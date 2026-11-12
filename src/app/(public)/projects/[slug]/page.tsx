import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, FileText } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { getPublicProject } from "@/lib/public-data";
import { sanitizeRichContent } from "@/lib/sanitize-content";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublicProject(slug);
  if (!project) return { title: "Project not found" };
  return {
    title: project.seoTitle || project.title,
    description: project.seoDescription || project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      type: "article",
      title: project.seoTitle || project.title,
      description: project.seoDescription || project.summary,
      images: project.featuredImage ? [project.featuredImage.src] : undefined,
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getPublicProject(slug);
  if (!project) notFound();

  const projectJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: project.title,
    description: project.summary,
    author: {
      "@type": "Person",
      name: "Smile Nikoro",
    },
    datePublished: project.publishedAt?.toISOString(),
    image: project.featuredImage ? [project.featuredImage.src] : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }}
      />
      <PageHeading
        description={project.summary}
        eyebrow={`${project.category?.name ?? "Project"} · ${project.projectType.replaceAll("_", " ")}`}
        title={project.title}
      />
      <article className="page-content project-detail">
        <nav aria-label="Breadcrumb" className="breadcrumbs">
          <Link href="/">Home</Link><span>/</span><Link href="/projects">Projects</Link><span>/</span><span>{project.title}</span>
        </nav>
        {project.featuredImage && (
          <div className="project-detail-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt={project.featuredImage.altText || project.title} src={project.featuredImage.src} />
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
            <ul>{project.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul>
          </section>
        )}
        {project.methodology && <section><h2>Methodology</h2><p>{project.methodology}</p></section>}
        {project.findings && <section><h2>Findings</h2><p>{project.findings}</p></section>}
        {project.recommendations && <section><h2>Recommendations</h2><p>{project.recommendations}</p></section>}
        {project.gallery.length > 0 && (
          <section>
            <h2>Project gallery</h2>
            <div className="project-gallery">
              {project.gallery.map((image) => (
                <figure key={image.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt={image.altText || image.name} src={image.src} />
                  {image.caption && <figcaption>{image.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </section>
        )}
        {project.attachments.length > 0 && (
          <section>
            <h2>Project documents</h2>
            <div className="project-attachments">
              {project.attachments.map((file) => (
                <a className="project-attachment" href={file.href} key={file.id}>
                  <FileText aria-hidden="true" size={17} />
                  <span>{file.name}<small>{(file.sizeBytes / 1024 / 1024).toFixed(2)} MB · PDF</small></span>
                  <ArrowUpRight aria-hidden="true" size={15} />
                </a>
              ))}
            </div>
          </section>
        )}
        {project.references.length > 0 && (
          <section>
            <h2>References</h2>
            <ol>{project.references.map((reference) => <li key={reference}>{reference}</li>)}</ol>
          </section>
        )}
        {project.tags.length > 0 && (
          <div className="public-tags project-detail-tags">{project.tags.map((tag) => <span key={tag.slug}>{tag.name}</span>)}</div>
        )}
        <Link className="text-link project-back-link" href="/projects">
          <ArrowLeft aria-hidden="true" size={14} /> Back to projects
        </Link>
      </article>
    </>
  );
}
