import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { getProjectFilters, getPublicProjects } from "@/lib/public-data";

export const metadata: Metadata = {
  title: "Projects and Case Studies",
  description: "Published environmental engineering and HSE projects by Smile Nikoro.",
  alternates: { canonical: "/projects" },
};

type Props = {
  searchParams: Promise<{ category?: string; type?: string }>;
};

export default async function ProjectsPage({ searchParams }: Props) {
  const query = await searchParams;
  const [filters, projects] = await Promise.all([
    getProjectFilters(),
    getPublicProjects({ category: query.category, type: query.type }),
  ]);
  const selectedCategory = filters.categories.some((item) => item.slug === query.category)
    ? query.category!
    : "";
  const selectedType = filters.types.includes(query.type ?? "") ? query.type! : "";

  return (
    <>
      <PageHeading
        description="A home for academic projects, case studies, research work and professional contributions."
        eyebrow="Projects & case studies"
        title="Thoughtful work deserves thoughtful documentation."
      />
      <div className="page-content page-content-wide">
        <form action="/projects" className="public-filter-bar" method="get">
          <label>
            <span>Category</span>
            <select defaultValue={selectedCategory} name="category">
              <option value="">All categories</option>
              {filters.categories.map((category) => (
                <option key={category.slug} value={category.slug}>{category.name}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Project type</span>
            <select defaultValue={selectedType} name="type">
              <option value="">All types</option>
              {filters.types.map((type) => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}
            </select>
          </label>
          <button className="button" type="submit">Apply filters</button>
          {(selectedCategory || selectedType) && (
            <Link className="text-link" href="/projects">Clear filters</Link>
          )}
        </form>

        {projects.length ? (
          <div className="public-project-grid">
            {projects.map((project) => (
              <article className="public-project-card" key={project.id}>
                {project.featuredImage && (
                  <Link aria-label={`View ${project.title}`} className="public-project-image" href={`/projects/${project.slug}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt={project.featuredImage.altText || project.title} src={project.featuredImage.src} />
                  </Link>
                )}
                <div className="public-project-content">
                  <div className="public-project-meta">
                    <span>{project.category?.name ?? project.projectType.replaceAll("_", " ")}</span>
                    <span>{project.publishedAt?.toLocaleDateString()}</span>
                  </div>
                  <h2><Link href={`/projects/${project.slug}`}>{project.title}</Link></h2>
                  <p>{project.summary}</p>
                  {project.tags.length > 0 && (
                    <div className="public-tags">
                      {project.tags.map((tag) => <span key={tag.slug}>{tag.name}</span>)}
                    </div>
                  )}
                  <Link className="text-link" href={`/projects/${project.slug}`}>
                    Read case study <ArrowRight aria-hidden="true" size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="writing-empty">
            <div className="empty-badge">
              <Leaf aria-hidden="true" size={24} />
            </div>
            <h3>Project library in preparation</h3>
            <p>
              {selectedCategory || selectedType
                ? "No published projects match these filters. Try clearing your filters above."
                : "Project case studies, technical findings and field reports will appear here as they are prepared for publication."}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
