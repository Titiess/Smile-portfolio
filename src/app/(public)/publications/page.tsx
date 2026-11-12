import type { Metadata } from "next";
import { ArrowUpRight, FileText } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { getPublicPublications } from "@/lib/public-data";

export const metadata: Metadata = {
  title: "Publications",
  description: "Verified academic publications by Smile Nikoro.",
  alternates: { canonical: "/publications" },
};

export default async function PublicationsPage() {
  const publications = await getPublicPublications();
  return (
    <>
      <PageHeading
        description="A record of formal publications, with complete citation details and source links."
        eyebrow="Publications"
        title="A clear record of published work."
      />
      <div className="page-content">
        {publications.length ? (
          <div className="page-list">
            {publications.map((publication) => (
              <article className="page-list-item publication-card" key={publication.id}>
                <p className="eyebrow"><span className="eyebrow-dot" />{publication.publicationType.replaceAll("_", " ")}</p>
                <h2>{publication.title}</h2>
                {publication.authors.length > 0 && <p>{publication.authors.join(", ")}</p>}
                {publication.journal && <p>{publication.journal}</p>}
                {publication.publicationDate && <p>{publication.publicationDate.toLocaleDateString()}</p>}
                {publication.abstract && <p>{publication.abstract}</p>}
                {publication.citation && <p className="publication-citation">{publication.citation}</p>}
                <div className="publication-links">
                  {publication.doi && (
                    <a className="text-link" href={`https://doi.org/${publication.doi}`} rel="noreferrer" target="_blank">
                      DOI: {publication.doi} <ArrowUpRight aria-hidden="true" size={14} />
                    </a>
                  )}
                  {publication.externalUrl && (
                    <a className="text-link" href={publication.externalUrl} rel="noreferrer" target="_blank">
                      View publication <ArrowUpRight aria-hidden="true" size={14} />
                    </a>
                  )}
                  {publication.pdfMedia && !publication.pdfMedia.isPrivate && (
                    <a className="text-link" href={`/api/media/${publication.pdfMedia.id}/download`}>
                      <FileText aria-hidden="true" size={14} /> Download PDF
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="writing-empty">
            <div className="empty-badge">
              <FileText aria-hidden="true" size={24} />
            </div>
            <h3>Publications in preparation</h3>
            <p>
              Formal publications, research papers, and technical proceedings with complete citation details and external references will appear here.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
