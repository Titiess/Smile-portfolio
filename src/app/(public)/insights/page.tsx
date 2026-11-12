import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { getPublicArticlePage } from "@/lib/public-data";

export const metadata: Metadata = {
  title: "Insights",
  description: "Articles and perspectives on environmental management, HSE and sustainability by Smile Nikoro.",
  alternates: { canonical: "/insights" },
};

type Props = {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
};

function listingUrl(page: number, search: string, category: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (search) params.set("q", search);
  if (category) params.set("category", category);
  const query = params.toString();
  return `/insights${query ? `?${query}` : ""}`;
}

export default async function InsightsPage({ searchParams }: Props) {
  const query = await searchParams;
  const search = (query.q ?? "").trim().slice(0, 100);
  const category = (query.category ?? "").trim().slice(0, 80);
  const page = Math.max(1, Math.min(10000, Number.parseInt(query.page ?? "1", 10) || 1));
  const results = await getPublicArticlePage(page, search, category);
  const totalPages = Math.max(1, Math.ceil(results.total / results.pageSize));

  return (
    <>
      <PageHeading
        description="Notes on environmental management, workplace safety and sustainability."
        eyebrow="Insights"
        title="Ideas and perspectives, shared with care."
      />
      <div className="page-content page-content-wide">
        <form action="/insights" className="public-filter-bar" method="get">
          <label>
            <span>Search articles</span>
            <input defaultValue={search} maxLength={100} name="q" placeholder="Search title or summary..." />
          </label>
          <label>
            <span>Category</span>
            <input defaultValue={category} maxLength={80} name="category" placeholder="All categories" />
          </label>
          <button className="button" type="submit">Search</button>
        </form>
        {results.articles.length ? (
          <div className="article-preview-grid insights-grid">
            {results.articles.map((article) => (
              <article className="article-preview-card" key={article.id}>
                {article.coverImage && (
                  <Link aria-label={`Read ${article.title}`} className="article-cover" href={`/insights/${article.slug}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt={article.coverImage.altText || article.title} src={article.coverImage.src} />
                  </Link>
                )}
                <span>{article.category} · {article.publishedAt?.toLocaleDateString()}</span>
                <h2><Link href={`/insights/${article.slug}`}>{article.title}</Link></h2>
                <p>{article.summary}</p>
                <Link className="text-link" href={`/insights/${article.slug}`}>
                  Read article <ArrowRight aria-hidden="true" size={14} />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="writing-empty">
            <div className="empty-badge">
              <BookOpen aria-hidden="true" size={24} />
            </div>
            <h3>Articles in preparation</h3>
            <p>
              {search || category
                ? "No published articles match these filters. Try searching for a different topic."
                : "Articles and technical perspectives on environmental engineering, safety, and sustainability will appear here as they are published."}
            </p>
          </div>
        )}
        {results.total > results.pageSize && (
          <div className="public-pagination">
            <span>Page {page} of {totalPages}</span>
            <span>
              {page > 1 && <Link className="button button-secondary" href={listingUrl(page - 1, search, category)}>Previous</Link>}
              {page < totalPages && <Link className="button button-secondary" href={listingUrl(page + 1, search, category)}>Next</Link>}
            </span>
          </div>
        )}
      </div>
    </>
  );
}
