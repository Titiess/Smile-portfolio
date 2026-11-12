import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { getPublicResearch } from "@/lib/public-data";

export const metadata: Metadata = {
  title: "Research",
  description: "Published research interests and work by Smile Nikoro.",
  alternates: { canonical: "/research" },
};

export default async function ResearchPage() {
  const research = await getPublicResearch();

  return (
    <>
      <PageHeading
        description="Research interests, academic work and evidence-led perspectives on environmental and HSE practice."
        eyebrow="Research"
        title="Curiosity, evidence and environmental practice."
      />
      <div className="page-content">
        {research.length ? (
          <div className="page-list">
            {research.map((item) => (
              <article className="page-list-item" key={item.id}>
                <p className="eyebrow"><span className="eyebrow-dot" />Research</p>
                <h2><Link href={`/research/${item.slug}`}>{item.title}</Link></h2>
                <p>{item.summary}</p>
                {item.tags.length > 0 && (
                  <div className="public-tags">{item.tags.map((tag) => <span key={tag.slug}>{tag.name}</span>)}</div>
                )}
                <Link className="text-link" href={`/research/${item.slug}`}>
                  Read research summary <ArrowRight aria-hidden="true" size={14} />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="writing-empty">
            <div className="empty-badge">
              <BookOpen aria-hidden="true" size={24} />
            </div>
            <h3>Research library in preparation</h3>
            <p>
              Independent research work, methodology reviews, and technical findings will appear here as they are verified and published.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
