import type { Metadata } from "next";
import { ArrowUpRight, Award } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { certifications as defaultCertifications } from "@/lib/content";
import { getPublicCertifications } from "@/lib/public-data";

export const metadata: Metadata = {
  title: "Certifications",
  description: "HSE certifications held by Smile Nikoro.",
  alternates: { canonical: "/certifications" },
};

export default async function CertificationsPage() {
  const storedCertifications = await getPublicCertifications();
  const certList =
    storedCertifications.length > 0
      ? storedCertifications
      : defaultCertifications.map((item, index) => ({
          id: `default-${index}`,
          name: item.name,
          issuingBody: item.issuer,
          description: "Verified foundational HSE certification.",
          issueDate: null as Date | null,
          expiryDate: null as Date | null,
          credentialRef: null as string | null,
          verificationUrl: null as string | null,
          media: null,
        }));

  return (
    <>
      <PageHeading
        description="Professional HSE certifications and verified credential information."
        eyebrow="Certifications"
        title="Continuing to build a foundation in HSE."
      />
      <div className="page-content">
        <div className="page-list">
          {certList.map((certification) => (
            <article className="page-list-item" key={certification.id}>
              <h2>
                <Award aria-hidden="true" size={19} /> {certification.name}
              </h2>
              <p>Issuing body: {certification.issuingBody}</p>
              {certification.description && <p>{certification.description}</p>}
              {certification.issueDate && <p>Issued {certification.issueDate.toLocaleDateString()}</p>}
              {certification.expiryDate && <p>Expires {certification.expiryDate.toLocaleDateString()}</p>}
              {certification.credentialRef && <p>Credential reference: {certification.credentialRef}</p>}
              {certification.verificationUrl && (
                <a className="text-link" href={certification.verificationUrl} rel="noreferrer" target="_blank">
                  Verify credential <ArrowUpRight aria-hidden="true" size={14} />
                </a>
              )}
              {certification.media && !certification.media.isPrivate && (
                <a className="text-link" href={`/api/media/${certification.media.id}/download`}>
                  View certificate file <ArrowUpRight aria-hidden="true" size={14} />
                </a>
              )}
            </article>
          ))}
        </div>
        <aside className="page-callout">
          Issue dates, expiry information, credential references and
          verification links will be added when confirmed.
        </aside>
      </div>
    </>
  );
}
