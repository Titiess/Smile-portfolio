import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Eye, FileText } from "lucide-react";
import { requireUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { PageHeading } from "@/components/page-heading";
import { sanitizeRichContent } from "@/lib/sanitize-content";

export const dynamic = "force-dynamic";

type PreviewPageProps = {
  params: Promise<{ module: string; id: string }>;
};

export default async function AdminPreviewPage({ params }: PreviewPageProps) {
  await requireUser();
  const { module: contentModule, id } = await params;

  if (contentModule === "projects") {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        category: { select: { name: true, slug: true } },
        tags: { select: { name: true, slug: true } },
        featuredImage: true,
        media: {
          include: { media: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!project) notFound();

    const gallery = project.media
      .map((entry) => entry.media)
      .filter((file) => file.mimeType.startsWith("image/") && !file.isPrivate);

    const attachments = project.media
      .map((entry) => entry.media)
      .filter((file) => file.mimeType === "application/pdf" && !file.isPrivate);

    return (
      <div className="preview-container">
        <aside className="preview-banner" role="status">
          <div className="preview-banner-content">
            <span className="preview-pill"><Eye size={13} /> Preview Mode</span>
            <span>
              Project Status: <strong>{project.status}</strong> · {project.title}
            </span>
          </div>
          <Link className="preview-exit-link" href={`/admin/projects?edit=${project.id}`}>
            <ArrowLeft size={14} /> Back to editor
          </Link>
        </aside>

        <PageHeading
          description={project.summary}
          eyebrow={`${project.category?.name ?? "Project"} · ${project.projectType.replaceAll("_", " ")}`}
          title={project.title}
        />

        <article className="page-content project-detail">
          {project.featuredImage && (
            <div className="project-detail-image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={project.featuredImage.altText || project.title}
                src={`/api/media/${project.featuredImage.id}/download`}
              />
              {project.featuredImage.caption && <p>{project.featuredImage.caption}</p>}
            </div>
          )}
          {project.description && <p className="project-lead">{project.description}</p>}
          {project.contentHtml && (
            <div
              className="rich-content"
              dangerouslySetInnerHTML={{ __html: sanitizeRichContent(project.contentHtml) }}
            />
          )}
          {project.objectives.length > 0 && (
            <section>
              <h2>Objectives</h2>
              <ul>{project.objectives.map((obj) => <li key={obj}>{obj}</li>)}</ul>
            </section>
          )}
          {project.methodology && (
            <section><h2>Methodology</h2><p>{project.methodology}</p></section>
          )}
          {project.findings && (
            <section><h2>Findings</h2><p>{project.findings}</p></section>
          )}
          {project.recommendations && (
            <section><h2>Recommendations</h2><p>{project.recommendations}</p></section>
          )}
          {gallery.length > 0 && (
            <section>
              <h2>Project gallery</h2>
              <div className="project-gallery">
                {gallery.map((img) => (
                  <figure key={img.id}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={img.altText || img.originalName}
                      src={`/api/media/${img.id}/download`}
                    />
                    {img.caption && <figcaption>{img.caption}</figcaption>}
                  </figure>
                ))}
              </div>
            </section>
          )}
          {attachments.length > 0 && (
            <section>
              <h2>Project documents</h2>
              <div className="project-attachments">
                {attachments.map((file) => (
                  <a
                    className="project-attachment"
                    href={`/api/media/${file.id}/download`}
                    key={file.id}
                  >
                    <FileText aria-hidden="true" size={17} />
                    <span>
                      {file.originalName}
                      <small>{(file.sizeBytes / 1024 / 1024).toFixed(2)} MB · PDF</small>
                    </span>
                    <ArrowUpRight aria-hidden="true" size={15} />
                  </a>
                ))}
              </div>
            </section>
          )}
          {project.references.length > 0 && (
            <section>
              <h2>References</h2>
              <ol>{project.references.map((ref) => <li key={ref}>{ref}</li>)}</ol>
            </section>
          )}
        </article>
      </div>
    );
  }

  if (contentModule === "articles") {
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        coverImage: true,
        tags: { select: { name: true, slug: true } },
      },
    });

    if (!article) notFound();

    return (
      <div className="preview-container">
        <aside className="preview-banner" role="status">
          <div className="preview-banner-content">
            <span className="preview-pill"><Eye size={13} /> Preview Mode</span>
            <span>
              Article Status: <strong>{article.status}</strong> · {article.title}
            </span>
          </div>
          <Link className="preview-exit-link" href={`/admin/articles?edit=${article.id}`}>
            <ArrowLeft size={14} /> Back to editor
          </Link>
        </aside>

        <PageHeading
          description={article.summary}
          eyebrow={`${article.category} · ${article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : "Unpublished Draft"}`}
          title={article.title}
        />

        <article className="page-content article-detail">
          {article.coverImage && (
            <div className="article-detail-cover">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={article.coverImage.altText || article.title}
                src={`/api/media/${article.coverImage.id}/download`}
              />
              {article.coverImage.caption && <p>{article.coverImage.caption}</p>}
            </div>
          )}
          <div
            className="rich-content"
            dangerouslySetInnerHTML={{ __html: sanitizeRichContent(article.contentHtml) }}
          />
          {article.tags.length > 0 && (
            <div className="public-tags">
              {article.tags.map((tag) => <span key={tag.slug}>{tag.name}</span>)}
            </div>
          )}
        </article>
      </div>
    );
  }

  if (contentModule === "research") {
    const item = await prisma.research.findUnique({
      where: { id },
      include: { tags: { select: { name: true, slug: true } } },
    });

    if (!item) notFound();

    return (
      <div className="preview-container">
        <aside className="preview-banner" role="status">
          <div className="preview-banner-content">
            <span className="preview-pill"><Eye size={13} /> Preview Mode</span>
            <span>
              Research Status: <strong>{item.status}</strong> · {item.title}
            </span>
          </div>
          <Link className="preview-exit-link" href={`/admin/research?edit=${item.id}`}>
            <ArrowLeft size={14} /> Back to editor
          </Link>
        </aside>

        <PageHeading description={item.summary} eyebrow="Research Preview" title={item.title} />

        <article className="page-content">
          {item.abstract && <section><h2>Abstract</h2><p>{item.abstract}</p></section>}
          {item.methodology && <section><h2>Methodology</h2><p>{item.methodology}</p></section>}
          {item.findings && <section><h2>Findings</h2><p>{item.findings}</p></section>}
          {item.references.length > 0 && (
            <section>
              <h2>References</h2>
              <ol>{item.references.map((ref) => <li key={ref}>{ref}</li>)}</ol>
            </section>
          )}
        </article>
      </div>
    );
  }

  notFound();
}
