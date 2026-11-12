import "server-only";

import { cache } from "react";
import { profile as defaultProfile } from "@/lib/content";
import { prisma } from "@/lib/prisma";

export const getPublicProfile = cache(async () => {
  const storedProfile = await prisma.profile.findUnique({ where: { id: "primary" } });
  return {
    name: storedProfile?.name ?? defaultProfile.name,
    title: storedProfile?.title ?? defaultProfile.title,
    email: storedProfile?.email ?? defaultProfile.email,
    linkedin: storedProfile?.linkedinUrl ?? defaultProfile.linkedin,
    biography: storedProfile?.biography ?? "",
    cvUrl: storedProfile?.cvUrl ?? null,
  };
});

export async function getPublicSiteSettings() {
  const settings = await prisma.siteSettings.findMany({
    where: { key: { in: ["site-title", "site-description"] } },
    select: { key: true, value: true },
  });
  return Object.fromEntries(
    settings.map((setting) => [
      setting.key,
      typeof setting.value === "string" ? setting.value : String(setting.value),
    ]),
  ) as { "site-title"?: string; "site-description"?: string };
}

function publicImage(media: {
  id: string;
  originalName: string;
  altText: string;
  caption: string;
  isPrivate: boolean;
} | null) {
  if (!media || media.isPrivate) return null;
  return {
    id: media.id,
    name: media.originalName,
    altText: media.altText,
    caption: media.caption,
    src: `/api/media/${media.id}/download`,
  };
}

export async function getPublicProjects(options?: {
  category?: string;
  type?: string;
  featured?: boolean;
}) {
  const projects = await prisma.project.findMany({
    where: {
      status: "PUBLISHED",
      ...(options?.featured === undefined ? {} : { featured: options.featured }),
      ...(options?.category
        ? { category: { slug: options.category } }
        : {}),
      ...(options?.type ? { projectType: options.type } : {}),
    },
    include: {
      category: { select: { name: true, slug: true } },
      tags: { select: { name: true, slug: true } },
      featuredImage: {
        select: { id: true, originalName: true, altText: true, caption: true, isPrivate: true },
      },
    },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
  });
  return projects.map((project) => ({
    ...project,
    featuredImage: publicImage(project.featuredImage),
  }));
}

export const getPublicProject = cache(async (slug: string) => {
  const project = await prisma.project.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      category: { select: { name: true, slug: true } },
      tags: { select: { name: true, slug: true } },
      featuredImage: {
        select: { id: true, originalName: true, altText: true, caption: true, isPrivate: true },
      },
      media: {
        include: {
          media: {
            select: {
              id: true,
              originalName: true,
              altText: true,
              caption: true,
              isPrivate: true,
              mimeType: true,
              sizeBytes: true,
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
  if (!project) return null;
  return {
    ...project,
    featuredImage: publicImage(project.featuredImage),
    gallery: project.media
      .filter((relation) => relation.media.mimeType.startsWith("image/"))
      .map((relation) => publicImage(relation.media))
      .filter((media): media is NonNullable<typeof media> => media !== null),
    attachments: project.media
      .filter((relation) => relation.media.mimeType === "application/pdf" && !relation.media.isPrivate)
      .map((relation) => ({
        id: relation.media.id,
        name: relation.media.originalName,
        sizeBytes: relation.media.sizeBytes,
        href: `/api/media/${relation.media.id}/download`,
      })),
  };
});

export async function getProjectFilters() {
  const [categories, types] = await Promise.all([
    prisma.projectCategory.findMany({
      where: { projects: { some: { status: "PUBLISHED" } } },
      select: { name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    prisma.project.findMany({
      where: { status: "PUBLISHED" },
      select: { projectType: true },
      distinct: ["projectType"],
      orderBy: { projectType: "asc" },
    }),
  ]);
  return { categories, types: types.map((item) => item.projectType) };
}

export async function getPublicArticles(limit?: number) {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    include: {
      tags: { select: { name: true, slug: true } },
      coverImage: {
        select: { id: true, originalName: true, altText: true, caption: true, isPrivate: true },
      },
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    ...(limit ? { take: limit } : {}),
  });
  return articles.map((article) => ({
    ...article,
    coverImage: publicImage(article.coverImage),
  }));
}

export async function getPublicArticlePage(
  page: number,
  search: string,
  category: string,
) {
  const where = {
    status: "PUBLISHED" as const,
    ...(category ? { category } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { summary: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
  const [articles, total] = await prisma.$transaction([
    prisma.article.findMany({
      where,
      include: {
        tags: { select: { name: true, slug: true } },
        coverImage: {
          select: { id: true, originalName: true, altText: true, caption: true, isPrivate: true },
        },
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * 12,
      take: 12,
    }),
    prisma.article.count({ where }),
  ]);
  return {
    articles: articles.map((article) => ({
      ...article,
      coverImage: publicImage(article.coverImage),
    })),
    total,
    page,
    pageSize: 12,
  };
}

export const getPublicArticle = cache(async (slug: string) => {
  const article = await prisma.article.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      tags: { select: { name: true, slug: true } },
      coverImage: {
        select: { id: true, originalName: true, altText: true, caption: true, isPrivate: true },
      },
    },
  });
  return article ? { ...article, coverImage: publicImage(article.coverImage) } : null;
});

export async function getPublicResearch() {
  return prisma.research.findMany({
    where: { status: "PUBLISHED" },
    include: { tags: { select: { name: true, slug: true } } },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
}

export const getPublicResearchItem = cache(async (slug: string) =>
  prisma.research.findFirst({ where: { slug, status: "PUBLISHED" } }),
);

export async function getPublicPublications() {
  return prisma.publication.findMany({
    where: { status: "PUBLISHED" },
    include: {
      pdfMedia: { select: { id: true, isPrivate: true } },
    },
    orderBy: [{ publicationDate: "desc" }, { createdAt: "desc" }],
  });
}

export async function getPublicExperience() {
  return prisma.experience.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ displayOrder: "asc" }, { startDate: "desc" }],
  });
}

export async function getPublicEducation() {
  return prisma.education.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ displayOrder: "asc" }, { endDate: "desc" }],
  });
}

export async function getPublicCertifications() {
  return prisma.certification.findMany({
    where: { status: "PUBLISHED" },
    include: {
      media: { select: { id: true, isPrivate: true, originalName: true } },
    },
    orderBy: [{ displayOrder: "asc" }, { issueDate: "desc" }],
  });
}

export async function hasPublicCv() {
  return Boolean(
    await prisma.cvVersion.findFirst({
      where: { isCurrent: true, media: { isPrivate: false } },
      select: { id: true },
    }),
  );
}
