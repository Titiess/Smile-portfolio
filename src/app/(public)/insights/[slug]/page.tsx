import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { getPublicArticle } from "@/lib/public-data";
import { sanitizeRichContent } from "@/lib/sanitize-content";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublicArticle(slug);
  if (!article) return { title: "Article not found" };
  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.summary,
    alternates: { canonical: `/insights/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.summary,
      images: article.coverImage ? [article.coverImage.src] : undefined,
      publishedTime: article.publishedAt?.toISOString(),
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getPublicArticle(slug);
  if (!article) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.summary,
    author: {
      "@type": "Person",
      name: "Smile Nikoro",
    },
    datePublished: article.publishedAt?.toISOString(),
    image: article.coverImage ? [article.coverImage.src] : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <PageHeading
        description={article.summary}
        eyebrow={`${article.category} · ${article.publishedAt?.toLocaleDateString() ?? ""}`}
        title={article.title}
      />
      <article className="page-content article-detail">
        {article.coverImage && (
          <div className="article-detail-cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt={article.coverImage.altText || article.title} src={article.coverImage.src} />
            {article.coverImage.caption && <p>{article.coverImage.caption}</p>}
          </div>
        )}
        <div
          className="rich-content"
          dangerouslySetInnerHTML={{ __html: sanitizeRichContent(article.contentHtml) }}
        />
        {article.tags.length > 0 && (
          <div className="public-tags">{article.tags.map((tag) => <span key={tag.slug}>{tag.name}</span>)}</div>
        )}
        <Link className="text-link project-back-link" href="/insights">
          <ArrowLeft aria-hidden="true" size={14} /> Back to insights
        </Link>
      </article>
    </>
  );
}
