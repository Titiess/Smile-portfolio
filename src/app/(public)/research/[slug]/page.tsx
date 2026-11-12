import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { getPublicResearchItem } from "@/lib/public-data";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPublicResearchItem(slug);
  if (!item) return { title: "Research not found" };
  return {
    title: item.seoTitle || item.title,
    description: item.seoDescription || item.summary,
    alternates: { canonical: `/research/${item.slug}` },
    openGraph: { type: "article", title: item.seoTitle || item.title, description: item.summary },
  };
}

export default async function ResearchDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await getPublicResearchItem(slug);
  if (!item) notFound();

  return (
    <>
      <PageHeading description={item.summary} eyebrow="Research" title={item.title} />
      <article className="page-content">
        {item.abstract && <section><h2>Abstract</h2><p>{item.abstract}</p></section>}
        {item.methodology && <section><h2>Methodology</h2><p>{item.methodology}</p></section>}
        {item.findings && <section><h2>Findings</h2><p>{item.findings}</p></section>}
        {item.references.length > 0 && (
          <section><h2>References</h2><ol>{item.references.map((reference) => <li key={reference}>{reference}</li>)}</ol></section>
        )}
        <Link className="text-link project-back-link" href="/research">
          <ArrowLeft aria-hidden="true" size={14} /> Back to research
        </Link>
      </article>
    </>
  );
}
