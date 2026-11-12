"use server";

import sanitizeHtml from "sanitize-html";
import { z } from "zod";
import { ContentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/admin-auth";
import {
  adminModules,
  dateValue,
  isAdminModule,
  slugify,
  splitLines,
  splitTags,
} from "@/lib/admin-modules";
import { requestIpHash } from "@/lib/security";

export type FormActionState = {
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
};

const formSchema = z.object({
  module: z.string().min(1),
  id: z.string().max(64).optional(),
  fields: z.record(z.string(), z.string().max(200_000)),
});

const safeHtml = (html: string) =>
  sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "h2",
      "h3",
      "h4",
      "ul",
      "ol",
      "li",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "blockquote",
      "a",
      "pre",
      "code",
      "hr",
    ],
    allowedAttributes: { a: ["href", "target", "rel"] },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
        target: "_blank",
      }),
    },
  });

function requiredValue(fields: Record<string, string>, name: string) {
  return fields[name]?.trim() ?? "";
}

function selectedIds(fields: Record<string, string>, name: string) {
  return [...new Set(requiredValue(fields, name).split(",").map((id) => id.trim()).filter(Boolean))];
}

function contentStatus(value: string) {
  if (value === "PUBLISHED") return ContentStatus.PUBLISHED;
  if (value === "ARCHIVED") return ContentStatus.ARCHIVED;
  return ContentStatus.DRAFT;
}

function publishedDate(fields: Record<string, string>, status: string) {
  const fieldDate = validatedDate(fields, "publishedAt");
  if (status !== "PUBLISHED") return null;
  return fieldDate ?? new Date();
}

function tagsToConnect(value: string) {
  const unique = new Map(
    splitTags(value).map((name) => [slugify(name), name] as const),
  );
  return [...unique].filter(([slug]) => slug).map(([slug, name]) => {
    return {
      where: { slug },
      create: { name, slug },
    };
  });
}

function validatedDate(fields: Record<string, string>, name: string) {
  const raw = requiredValue(fields, name);
  if (!raw) return null;
  const parsed = dateValue(raw);
  if (!parsed) throw new Error(`The ${name} value is not a valid date.`);
  return parsed;
}

function numericValue(fields: Record<string, string>, name: string) {
  const raw = requiredValue(fields, name);
  if (!raw) return 0;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0 || value > 10000) {
    throw new Error(`The ${name} value must be a whole number between 0 and 10000.`);
  }
  return value;
}

async function writeAudit(
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      ipHash: await requestIpHash(),
    },
  });
}

export async function saveContent(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const user = await requireUser();
  const parsedFields: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("fields.") && typeof value === "string") {
      const field = key.slice("fields.".length);
      parsedFields[field] = parsedFields[field] ? `${parsedFields[field]},${value}` : value;
    }
  }

  const parsed = formSchema.safeParse({
    module: formData.get("module"),
    id: formData.get("id") || undefined,
    fields: parsedFields,
  });
  if (!parsed.success) return { error: "Please review the form fields and try again." };
  if (!isAdminModule(parsed.data.module)) {
    return { error: "This content type is not supported." };
  }

  const contentModule = parsed.data.module;
  const fields = parsed.data.fields;
  const allowedFields = new Set(adminModules[contentModule].fields.map((field) => field.name));
  if (Object.keys(fields).some((field) => !allowedFields.has(field))) {
    return { error: "The form contains unexpected fields. Reload and try again." };
  }
  for (const field of adminModules[contentModule].fields) {
    const value = fields[field.name]?.trim() ?? "";
    if (field.required && !value) {
      return { fieldErrors: { [field.name]: `${field.label} is required.` } };
    }
    if (value.length > (field.type === "richtext" ? 200_000 : 10_000)) {
      return { fieldErrors: { [field.name]: `${field.label} is too long.` } };
    }
  }
  const statusValue = requiredValue(fields, "status");
  if (!["DRAFT", "PUBLISHED", "ARCHIVED"].includes(statusValue)) {
    return { fieldErrors: { status: "Choose a valid content status." } };
  }
  if (
    contentModule === "publications" &&
    !["JOURNAL_ARTICLE", "CONFERENCE_PAPER", "THESIS", "REPORT", "OTHER"].includes(
      requiredValue(fields, "publicationType"),
    )
  ) {
    return { fieldErrors: { publicationType: "Choose a valid publication type." } };
  }
  const title =
    contentModule === "experience"
      ? requiredValue(fields, "organisation")
      : contentModule === "education"
        ? requiredValue(fields, "institution")
        : contentModule === "certifications"
          ? requiredValue(fields, "name")
          : requiredValue(fields, "title");
  if (!title) return { fieldErrors: { title: "This field is required." } };

  const rawSlug = requiredValue(fields, "slug") || title;
  const slug = slugify(rawSlug);
  if (["projects", "articles", "research"].includes(contentModule) && !slug) {
    return { fieldErrors: { slug: "Enter a title that can be used as a URL." } };
  }
  for (const urlField of ["externalUrl", "verificationUrl"]) {
    const value = requiredValue(fields, urlField);
    if (value) {
      try {
        const url = new URL(value);
        if (url.protocol !== "https:" && url.protocol !== "http:") {
          return { fieldErrors: { [urlField]: "Use an HTTP or HTTPS URL." } };
        }
      } catch {
        return { fieldErrors: { [urlField]: "Enter a valid URL." } };
      }
    }
  }
  if (contentModule === "publications" && requiredValue(fields, "doi")) {
    const doi = requiredValue(fields, "doi");
    if (!/^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i.test(doi)) {
      return { fieldErrors: { doi: "Enter a valid DOI or leave this field blank." } };
    }
  }

  const mediaIds = [...new Set(
    [
      ...selectedIds(fields, "galleryImageIds"),
      ...selectedIds(fields, "pdfAttachmentIds"),
      requiredValue(fields, "featuredImageId"),
    ]
      .map((id) => id.trim())
      .filter(Boolean),
  )];
  if (contentModule === "projects" && mediaIds.length > 40) {
    return { error: "A project can have at most 40 gallery images and PDF attachments." };
  }
  if (contentModule === "projects" && mediaIds.length > 0) {
    const media = await prisma.media.findMany({
      where: { id: { in: mediaIds } },
      select: { id: true, mimeType: true, isPrivate: true },
    });
    if (media.length !== mediaIds.length) {
      return { error: "One or more selected media files no longer exist." };
    }
    const images = new Set(selectedIds(fields, "galleryImageIds"));
    const pdfs = new Set(selectedIds(fields, "pdfAttachmentIds"));
    const featuredImageId = requiredValue(fields, "featuredImageId");
    if (
      media.some((item) =>
        (images.has(item.id) && (!item.mimeType.startsWith("image/") || item.isPrivate)) ||
        (pdfs.has(item.id) && (item.mimeType !== "application/pdf" || item.isPrivate)) ||
        (item.id === featuredImageId && (!item.mimeType.startsWith("image/") || item.isPrivate)),
      )
    ) {
      return { error: "Projects can only reference public images and PDF attachments." };
    }
  }

  try {
    let id = parsed.data.id;
    const status = contentStatus(requiredValue(fields, "status"));
    const publishedAt = publishedDate(fields, status);

    switch (contentModule) {
      case "projects": {
        const data = {
          title,
          slug,
          summary: requiredValue(fields, "summary"),
          description: requiredValue(fields, "description"),
          contentHtml: safeHtml(requiredValue(fields, "contentHtml")),
          projectType: requiredValue(fields, "projectType") || "ACADEMIC",
          objectives: splitLines(fields.objectives),
          methodology: requiredValue(fields, "methodology"),
          findings: requiredValue(fields, "findings"),
          recommendations: requiredValue(fields, "recommendations"),
          references: splitLines(fields.references),
          tags: { set: [], connectOrCreate: tagsToConnect(fields.tags) },
          status,
          featured: fields.featured === "true",
          featuredImageId: requiredValue(fields, "featuredImageId") || null,
          seoTitle: requiredValue(fields, "seoTitle") || null,
          seoDescription: requiredValue(fields, "seoDescription") || null,
          publishedAt,
        };
        id = await prisma.$transaction(async (transaction) => {
          const categoryName = requiredValue(fields, "category");
          const categorySlug = slugify(categoryName);
          const category = categoryName
            ? await transaction.projectCategory.upsert({
                where: { slug: categorySlug },
                create: { name: categoryName, slug: categorySlug },
                update: { name: categoryName },
              })
            : null;
          const projectData = { ...data, categoryId: category?.id ?? null };
          const item = id
            ? await transaction.project.update({ where: { id }, data: projectData })
            : await transaction.project.create({ data: projectData });
          const projectMedia = [
            ...selectedIds(fields, "galleryImageIds").map((mediaId, sortOrder) => ({
              projectId: item.id,
              mediaId,
              sortOrder,
            })),
            ...selectedIds(fields, "pdfAttachmentIds").map((mediaId, index) => ({
              projectId: item.id,
              mediaId,
              sortOrder: index + 100,
            })),
          ];
          await transaction.projectMedia.deleteMany({ where: { projectId: item.id } });
          if (projectMedia.length) {
            await transaction.projectMedia.createMany({ data: projectMedia });
          }
          return item.id;
        });
        break;
      }
      case "articles": {
        const data = {
          title,
          slug,
          summary: requiredValue(fields, "summary"),
          category: requiredValue(fields, "category") || "General",
          contentHtml: safeHtml(requiredValue(fields, "contentHtml")),
          tags: { set: [], connectOrCreate: tagsToConnect(fields.tags) },
          status,
          coverImageId: requiredValue(fields, "coverImageId") || null,
          seoTitle: requiredValue(fields, "seoTitle") || null,
          seoDescription: requiredValue(fields, "seoDescription") || null,
          publishedAt,
        };
        const item = id
          ? await prisma.article.update({ where: { id }, data })
          : await prisma.article.create({ data });
        id = item.id;
        break;
      }
      case "research": {
        const data = {
          title,
          slug,
          summary: requiredValue(fields, "summary"),
          abstract: requiredValue(fields, "abstract"),
          methodology: requiredValue(fields, "methodology"),
          findings: requiredValue(fields, "findings"),
          references: splitLines(fields.references),
          tags: { set: [], connectOrCreate: tagsToConnect(fields.tags) },
          status,
          seoTitle: requiredValue(fields, "seoTitle") || null,
          seoDescription: requiredValue(fields, "seoDescription") || null,
          publishedAt,
        };
        const item = id
          ? await prisma.research.update({ where: { id }, data })
          : await prisma.research.create({ data });
        id = item.id;
        break;
      }
      case "publications": {
        const data = {
          title,
          authors: splitLines(fields.authors),
          abstract: requiredValue(fields, "abstract"),
          publicationType: requiredValue(fields, "publicationType") || "OTHER",
          journal: requiredValue(fields, "journal") || null,
          publicationDate: validatedDate(fields, "publicationDate"),
          doi: requiredValue(fields, "doi") || null,
          externalUrl: requiredValue(fields, "externalUrl") || null,
          pdfMediaId: requiredValue(fields, "pdfMediaId") || null,
          citation: requiredValue(fields, "citation") || null,
          status,
        };
        const item = id
          ? await prisma.publication.update({ where: { id }, data })
          : await prisma.publication.create({ data });
        id = item.id;
        break;
      }
      case "experience": {
        const data = {
          organisation: title,
          jobTitle: requiredValue(fields, "jobTitle"),
          employmentType: requiredValue(fields, "employmentType") || null,
          location: requiredValue(fields, "location") || null,
          startDate: validatedDate(fields, "startDate"),
          endDate: validatedDate(fields, "endDate"),
          responsibilities: splitLines(fields.responsibilities),
          achievements: splitLines(fields.achievements),
          description: requiredValue(fields, "description"),
          displayOrder: numericValue(fields, "displayOrder"),
          status,
        };
        const item = id
          ? await prisma.experience.update({ where: { id }, data })
          : await prisma.experience.create({ data });
        id = item.id;
        break;
      }
      case "education": {
        const data = {
          institution: title,
          qualification: requiredValue(fields, "qualification"),
          programme: requiredValue(fields, "programme"),
          startDate: validatedDate(fields, "startDate"),
          endDate: validatedDate(fields, "endDate"),
          classification: requiredValue(fields, "classification") || null,
          description: requiredValue(fields, "description"),
          displayOrder: numericValue(fields, "displayOrder"),
          status,
        };
        const item = id
          ? await prisma.education.update({ where: { id }, data })
          : await prisma.education.create({ data });
        id = item.id;
        break;
      }
      case "certifications": {
        const data = {
          name: title,
          issuingBody: requiredValue(fields, "issuingBody"),
          issueDate: validatedDate(fields, "issueDate"),
          expiryDate: validatedDate(fields, "expiryDate"),
          credentialRef: requiredValue(fields, "credentialRef") || null,
          description: requiredValue(fields, "description"),
          mediaId: requiredValue(fields, "mediaId") || null,
          verificationUrl: requiredValue(fields, "verificationUrl") || null,
          displayOrder: numericValue(fields, "displayOrder"),
          status,
        };
        const item = id
          ? await prisma.certification.update({ where: { id }, data })
          : await prisma.certification.create({ data });
        id = item.id;
        break;
      }
    }

    await writeAudit(user.id, parsed.data.id ? "update" : "create", contentModule, id!);
    revalidatePath(`/admin/${contentModule}`);
    revalidatePath("/");
    revalidatePath(`/${contentModule}`);
    return { message: `${contentModule.slice(0, 1).toUpperCase()}${contentModule.slice(1)} saved.` };
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return { fieldErrors: { slug: "This URL is already in use. Choose another slug." } };
    }
    if (error instanceof Error && error.message.startsWith("The ")) {
      return { error: error.message };
    }
    throw error;
  }
}

const deleteSchema = z.object({
  module: z.string().min(1),
  id: z.string().min(1).max(64),
});

export async function deleteContent(formData: FormData) {
  const user = await requireUser();
  const parsed = deleteSchema.safeParse({
    module: formData.get("module"),
    id: formData.get("id"),
  });
  if (!parsed.success || !isAdminModule(parsed.data.module)) {
    throw new Error("Invalid content deletion request.");
  }

  const { module: contentModule, id } = parsed.data;
  switch (contentModule) {
    case "projects":
      await prisma.project.delete({ where: { id } });
      break;
    case "articles":
      await prisma.article.delete({ where: { id } });
      break;
    case "research":
      await prisma.research.delete({ where: { id } });
      break;
    case "publications":
      await prisma.publication.delete({ where: { id } });
      break;
    case "experience":
      await prisma.experience.delete({ where: { id } });
      break;
    case "education":
      await prisma.education.delete({ where: { id } });
      break;
    case "certifications":
      await prisma.certification.delete({ where: { id } });
      break;
  }

  await writeAudit(user.id, "delete", contentModule, id);
  revalidatePath(`/admin/${contentModule}`);
  revalidatePath("/");
  revalidatePath(`/${contentModule}`);
}

export async function updateEnquiryStatus(formData: FormData) {
  const { requireAdministrator } = await import("@/lib/admin-auth");
  const user = await requireAdministrator();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["NEW", "READ", "ARCHIVED"].includes(status)) {
    throw new Error("Invalid contact enquiry update.");
  }

  await prisma.contactEnquiry.update({
    where: { id },
    data: { status: status as "NEW" | "READ" | "ARCHIVED" },
  });
  await writeAudit(user.id, "update-status", "contact-enquiry", id);
  revalidatePath("/admin/enquiries");
}

export async function updateProfile(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const user = await requireUser();
  const schema = z.object({
    name: z.string().trim().min(1).max(120),
    title: z.string().trim().min(1).max(180),
    email: z.string().trim().email().max(254),
    linkedinUrl: z.string().trim().url().max(500).or(z.literal("")),
    biography: z.string().max(10000),
  });
  const parsed = schema.safeParse({
    name: formData.get("name"),
    title: formData.get("title"),
    email: formData.get("email"),
    linkedinUrl: formData.get("linkedinUrl"),
    biography: formData.get("biography"),
  });
  if (!parsed.success) return { error: "Enter a valid name, title, email, and LinkedIn URL." };

  await prisma.$transaction([
    prisma.profile.upsert({
      where: { id: "primary" },
      create: { id: "primary", ...parsed.data },
      update: parsed.data,
    }),
    prisma.siteSettings.upsert({
      where: { key: "contact-email" },
      create: { key: "contact-email", value: parsed.data.email },
      update: { value: parsed.data.email },
    }),
  ]);
  await writeAudit(user.id, "update", "profile", "primary");
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/contact");
  return { message: "Profile updated." };
}

export async function updateSiteSetting(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const user = await requireUser();
  const key = String(formData.get("key") ?? "");
  const value = String(formData.get("value") ?? "");
  const safeKey = z.enum(["site-title", "site-description", "contact-email"]).safeParse(key);
  if (!safeKey.success || value.length > 1000) {
    return { error: "This setting or value is not valid." };
  }
  if (safeKey.data === "contact-email" && !z.string().email().safeParse(value).success) {
    return { error: "Enter a valid contact email address." };
  }

  if (safeKey.data === "contact-email") {
    await prisma.$transaction([
      prisma.siteSettings.upsert({
        where: { key: safeKey.data },
        create: { key: safeKey.data, value },
        update: { value },
      }),
      prisma.profile.upsert({
        where: { id: "primary" },
        create: { id: "primary", email: value },
        update: { email: value },
      }),
    ]);
  } else {
    await prisma.siteSettings.upsert({
      where: { key: safeKey.data },
      create: { key: safeKey.data, value },
      update: { value },
    });
  }
  await writeAudit(user.id, "update", "site-setting", key);
  revalidatePath("/");
  return { message: "Website setting saved." };
}

export async function setCurrentCv(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const target = await prisma.cvVersion.findUnique({
    where: { id },
    include: { media: { select: { id: true, isPrivate: true } } },
  });
  if (!target) throw new Error("The CV version could not be found.");
  if (target.media.isPrivate) {
    throw new Error("The current public CV must use a public media file.");
  }

  await prisma.$transaction([
    prisma.cvVersion.updateMany({ data: { isCurrent: false } }),
    prisma.cvVersion.update({ where: { id }, data: { isCurrent: true } }),
  ]);
  await writeAudit(user.id, "set-current", "cv-version", id);
  revalidatePath("/admin/cv-documents");
  revalidatePath("/cv");
}

export async function deleteMedia(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id || id.length > 64) throw new Error("Invalid media deletion request.");
  const media = await prisma.media.findUnique({
    where: { id },
    select: { id: true, storageKey: true, bucket: true },
  });
  if (!media) throw new Error("Media file was not found.");
  const usedByCv = await prisma.cvVersion.findFirst({ where: { mediaId: id } });
  if (usedByCv) throw new Error("Remove this CV version before deleting its file.");
  const usedByDocument = await prisma.document.findFirst({ where: { mediaId: id } });
  if (usedByDocument) throw new Error("Remove this document before deleting its file.");

  const { deleteStorageObject } = await import("@/lib/storage");
  await deleteStorageObject(media.bucket, media.storageKey);
  await prisma.media.delete({ where: { id } });
  revalidatePath("/admin/media");
  revalidatePath("/admin/cv-documents");
}

export async function updateMediaMetadata(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const user = await requireUser();
  const parsed = z
    .object({
      id: z.string().min(1).max(64),
      altText: z.string().trim().max(500),
      caption: z.string().trim().max(1000),
    })
    .safeParse({
      id: formData.get("id"),
      altText: formData.get("altText") ?? "",
      caption: formData.get("caption") ?? "",
    });
  if (!parsed.success) return { error: "The media details are invalid." };

  await prisma.media.update({
    where: { id: parsed.data.id },
    data: { altText: parsed.data.altText, caption: parsed.data.caption },
  });
  await writeAudit(user.id, "update-metadata", "media", parsed.data.id);
  revalidatePath("/admin/media");
  return { message: "Media details saved." };
}

export async function updateDocument(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const user = await requireUser();
  const parsed = z
    .object({
      id: z.string().min(1).max(64),
      title: z.string().trim().min(1).max(200),
      type: z.enum(["REPORT", "CERTIFICATE", "PUBLICATION", "PROJECT_ATTACHMENT", "OTHER"]),
      description: z.string().trim().max(2000),
    })
    .safeParse({
      id: formData.get("id"),
      title: formData.get("title"),
      type: formData.get("type"),
      description: formData.get("description") ?? "",
    });
  if (!parsed.success) return { error: "Review the document details and try again." };
  await prisma.document.update({
    where: { id: parsed.data.id },
    data: {
      title: parsed.data.title,
      type: parsed.data.type,
      description: parsed.data.description,
    },
  });
  await writeAudit(user.id, "update", "document", parsed.data.id);
  revalidatePath("/admin/cv-documents");
  return { message: "Document details saved." };
}

export async function deleteDocument(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id || id.length > 64) throw new Error("Invalid document deletion request.");
  const document = await prisma.document.findUnique({
    where: { id },
    select: { id: true, mediaId: true },
  });
  if (!document) throw new Error("Document was not found.");
  await prisma.document.delete({ where: { id } });
  await writeAudit(user.id, "delete", "document", id);
  revalidatePath("/admin/cv-documents");
  revalidatePath("/admin/media");
}

export async function changePassword(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const user = await requireUser();
  const parsed = z
    .object({
      currentPassword: z.string().min(1).max(128),
      newPassword: z.string().min(14).max(128),
      confirmPassword: z.string().min(14).max(128),
    })
    .safeParse({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    });
  if (!parsed.success) return { error: "Enter the current password and a new password of at least 14 characters." };
  if (parsed.data.newPassword !== parsed.data.confirmPassword) {
    return { error: "The new password and confirmation do not match." };
  }
  if (parsed.data.currentPassword === parsed.data.newPassword) {
    return { error: "Choose a new password different from your current password." };
  }

  const { compare, hash } = await import("bcryptjs");
  const currentUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });
  if (!currentUser || !(await compare(parsed.data.currentPassword, currentUser.passwordHash))) {
    return { error: "The current password is incorrect." };
  }
  const passwordHash = await hash(parsed.data.newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, authVersion: { increment: 1 } },
  });
  await writeAudit(user.id, "change-password", "user", user.id);
  return { message: "Password changed. Sign in again with your new password." };
}
