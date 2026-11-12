import "server-only";

import type { ContentStatus } from "@prisma/client";
import { adminModules, type AdminModule } from "@/lib/admin-modules";
import { prisma } from "@/lib/prisma";

export type AdminEntry = {
  id: string;
  title: string;
  slug: string | null;
  summary: string;
  status: ContentStatus;
  updatedAt: Date;
};

const pageSize = 20;

export async function listAdminEntries(
  module: AdminModule,
  page: number,
  search: string,
  status: string,
) {
  const skip = (page - 1) * pageSize;
  const statusFilter: ContentStatus | undefined =
    status === "DRAFT" || status === "PUBLISHED" || status === "ARCHIVED"
      ? (status as ContentStatus)
      : undefined;

  switch (module) {
    case "projects": {
      const where = {
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" as const } },
                { summary: { contains: search, mode: "insensitive" as const } },
                { slug: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {}),
      };
      const [items, total] = await prisma.$transaction([
        prisma.project.findMany({
          where,
          select: { id: true, title: true, slug: true, summary: true, status: true, updatedAt: true },
          orderBy: { updatedAt: "desc" },
          skip,
          take: pageSize,
        }),
        prisma.project.count({ where }),
      ]);
      return { items: items as AdminEntry[], total, page, pageSize };
    }
    case "articles": {
      const where = {
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" as const } },
                { summary: { contains: search, mode: "insensitive" as const } },
                { slug: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {}),
      };
      const [items, total] = await prisma.$transaction([
        prisma.article.findMany({
          where,
          select: { id: true, title: true, slug: true, summary: true, status: true, updatedAt: true },
          orderBy: { updatedAt: "desc" },
          skip,
          take: pageSize,
        }),
        prisma.article.count({ where }),
      ]);
      return { items: items as AdminEntry[], total, page, pageSize };
    }
    case "research": {
      const where = {
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" as const } },
                { summary: { contains: search, mode: "insensitive" as const } },
                { slug: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {}),
      };
      const [items, total] = await prisma.$transaction([
        prisma.research.findMany({
          where,
          select: { id: true, title: true, slug: true, summary: true, status: true, updatedAt: true },
          orderBy: { updatedAt: "desc" },
          skip,
          take: pageSize,
        }),
        prisma.research.count({ where }),
      ]);
      return { items: items as AdminEntry[], total, page, pageSize };
    }
    case "publications": {
      const where = {
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" as const } },
                { abstract: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {}),
      };
      const [items, total] = await prisma.$transaction([
        prisma.publication.findMany({
          where,
          select: { id: true, title: true, abstract: true, status: true, updatedAt: true },
          orderBy: { updatedAt: "desc" },
          skip,
          take: pageSize,
        }),
        prisma.publication.count({ where }),
      ]);
      return {
        items: items.map((item) => ({
          id: item.id,
          title: item.title,
          slug: null,
          summary: item.abstract,
          status: item.status,
          updatedAt: item.updatedAt,
        })),
        total,
        page,
        pageSize,
      };
    }
    case "experience": {
      const where = {
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(search
          ? {
              OR: [
                { organisation: { contains: search, mode: "insensitive" as const } },
                { jobTitle: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {}),
      };
      const [items, total] = await prisma.$transaction([
        prisma.experience.findMany({
          where,
          select: { id: true, organisation: true, jobTitle: true, description: true, status: true, updatedAt: true },
          orderBy: [{ displayOrder: "asc" }, { updatedAt: "desc" }],
          skip,
          take: pageSize,
        }),
        prisma.experience.count({ where }),
      ]);
      return {
        items: items.map((item) => ({
          id: item.id,
          title: `${item.organisation} — ${item.jobTitle}`,
          slug: null,
          summary: item.description,
          status: item.status,
          updatedAt: item.updatedAt,
        })),
        total,
        page,
        pageSize,
      };
    }
    case "education": {
      const where = {
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(search
          ? {
              OR: [
                { institution: { contains: search, mode: "insensitive" as const } },
                { qualification: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {}),
      };
      const [items, total] = await prisma.$transaction([
        prisma.education.findMany({
          where,
          select: { id: true, institution: true, qualification: true, description: true, status: true, updatedAt: true },
          orderBy: [{ displayOrder: "asc" }, { updatedAt: "desc" }],
          skip,
          take: pageSize,
        }),
        prisma.education.count({ where }),
      ]);
      return {
        items: items.map((item) => ({
          id: item.id,
          title: `${item.institution} — ${item.qualification}`,
          slug: null,
          summary: item.description,
          status: item.status,
          updatedAt: item.updatedAt,
        })),
        total,
        page,
        pageSize,
      };
    }
    case "certifications": {
      const where = {
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" as const } },
                { issuingBody: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {}),
      };
      const [items, total] = await prisma.$transaction([
        prisma.certification.findMany({
          where,
          select: { id: true, name: true, issuingBody: true, description: true, status: true, updatedAt: true },
          orderBy: [{ displayOrder: "asc" }, { updatedAt: "desc" }],
          skip,
          take: pageSize,
        }),
        prisma.certification.count({ where }),
      ]);
      return {
        items: items.map((item) => ({
          id: item.id,
          title: item.name,
          slug: null,
          summary: `${item.issuingBody}${item.description ? ` — ${item.description}` : ""}`,
          status: item.status,
          updatedAt: item.updatedAt,
        })),
        total,
        page,
        pageSize,
      };
    }
  }
}

function dateInput(value: Date | null | undefined) {
  return value?.toISOString().slice(0, 10) ?? "";
}

function toFieldValues(values: object) {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => {
      if (value instanceof Date) return [key, dateInput(value)];
      if (Array.isArray(value)) {
        return [
          key,
          value
            .map((item) =>
              item && typeof item === "object" && "name" in item
                ? String(item.name)
                : String(item),
            )
            .join(key === "tags" ? ", " : "\n"),
        ];
      }
      if (value === null || value === undefined) return [key, ""];
      return [key, String(value)];
    }),
  );
}

export async function getAdminEntry(module: AdminModule, id: string) {
  switch (module) {
    case "projects": {
      const item = await prisma.project.findUnique({
        where: { id },
        include: {
          tags: { select: { name: true } },
          media: { select: { mediaId: true, media: { select: { mimeType: true } } } },
        },
      });
      return item
        ? toFieldValues({
            ...item,
            tags: item.tags,
            objectives: item.objectives,
            references: item.references,
            galleryImageIds: item.media
              .filter((relation) => relation.media.mimeType.startsWith("image/"))
              .map((relation) => relation.mediaId)
              .join(","),
            pdfAttachmentIds: item.media
              .filter((relation) => relation.media.mimeType === "application/pdf")
              .map((relation) => relation.mediaId)
              .join(","),
          })
        : null;
    }
    case "articles": {
      const item = await prisma.article.findUnique({
        where: { id },
        include: { tags: { select: { name: true } } },
      });
      return item ? toFieldValues({ ...item, tags: item.tags }) : null;
    }
    case "research": {
      const item = await prisma.research.findUnique({
        where: { id },
        include: { tags: { select: { name: true } } },
      });
      return item ? toFieldValues({ ...item, tags: item.tags }) : null;
    }
    case "publications": {
      const item = await prisma.publication.findUnique({ where: { id } });
      return item ? toFieldValues(item) : null;
    }
    case "experience": {
      const item = await prisma.experience.findUnique({ where: { id } });
      return item ? toFieldValues(item) : null;
    }
    case "education": {
      const item = await prisma.education.findUnique({ where: { id } });
      return item ? toFieldValues(item) : null;
    }
    case "certifications": {
      const item = await prisma.certification.findUnique({ where: { id } });
      return item ? toFieldValues(item as unknown as Record<string, unknown>) : null;
    }
  }
}

export async function getMediaSelectOptions(module: AdminModule) {
  const where =
    module === "articles"
      ? { mimeType: { startsWith: "image/" } }
      : module === "publications"
        ? { mimeType: "application/pdf" }
        : module === "certifications"
          ? { mimeType: { in: ["application/pdf", "image/jpeg", "image/png"] } }
          : module === "projects"
            ? {
                mimeType: { in: ["image/jpeg", "image/png", "image/webp", "application/pdf"] },
                isPrivate: false,
              }
          : undefined;
  const media = await prisma.media.findMany({
    where,
    select: { id: true, originalName: true, mimeType: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return [
    { label: "None", value: "" },
    ...media.map(({ id, originalName, mimeType }) => ({
      label: `${mimeType.startsWith("image/") ? "Image" : "PDF"} · ${originalName}`,
      value: id,
    })),
  ];
}

export async function getDashboardSummary() {
  const [
    publishedProjects,
    draftProjects,
    articleCount,
    publicationCount,
    certificationCount,
    newEnquiryCount,
    recentActivity,
  ] = await prisma.$transaction([
    prisma.project.count({ where: { status: "PUBLISHED" } }),
    prisma.project.count({ where: { status: "DRAFT" } }),
    prisma.article.count(),
    prisma.publication.count(),
    prisma.certification.count(),
    prisma.contactEnquiry.count({ where: { status: "NEW" } }),
    prisma.auditLog.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);
  return {
    publishedProjects,
    draftProjects,
    articleCount,
    publicationCount,
    certificationCount,
    newEnquiryCount,
    recentActivity,
  };
}

export function getModuleLabel(module: AdminModule) {
  return adminModules[module].label;
}
