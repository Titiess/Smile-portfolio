import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Leaf, ShieldCheck } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { getPublicCertifications, getPublicEducation, getPublicProfile, hasPublicCv } from "@/lib/public-data";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Smile Nikoro's background in environmental engineering, HSE and sustainability.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [profile, education, certifications, hasCv] = await Promise.all([
    getPublicProfile(),
    getPublicEducation(),
    getPublicCertifications(),
    hasPublicCv(),
  ]);
  const primaryEducation = education[0];

  return (
    <>
      <PageHeading
        description={profile.biography || "A developing professional practice grounded in environmental engineering, occupational safety and a desire to make a positive contribution."}
        eyebrow="About Smile"
        title="Engineering with people and the planet in mind."
      />
      <div className="page-content">
        <h2>A foundation in environmental engineering.</h2>
        <p>
          I am {profile.name}, an early-career Environmental Engineering and HSE
          professional. I hold {primaryEducation?.qualification ?? "an HND"} in{" "}
          {primaryEducation?.programme ?? "Environmental Engineering"} from{" "}
          {primaryEducation?.institution ?? "Petroleum Training Institute"}.
        </p>
        <p>
          My interests include environmental management, occupational health
          and safety, environmental sustainability and compliance. I value
          clear thinking, practical prevention and work that respects the
          communities and ecosystems it affects.
        </p>
        <div className="page-list">
          <article className="page-list-item">
            <h2>
              <BookOpen aria-hidden="true" size={18} /> Education
            </h2>
            <p>
              {primaryEducation
                ? `${primaryEducation.qualification} in ${primaryEducation.programme} · ${primaryEducation.institution}`
                : "HND, Environmental Engineering · Petroleum Training Institute"}
            </p>
          </article>
          <article className="page-list-item">
            <h2>
              <ShieldCheck aria-hidden="true" size={18} /> HSE
            </h2>
            <p>
              {certifications.length
                ? certifications.map((certification) => `${certification.name} · ${certification.issuingBody}`).join("; ")
                : "ISPON HSE Level 3"}
            </p>
          </article>
          <article className="page-list-item">
            <h2>
              <Leaf aria-hidden="true" size={18} /> Areas of interest
            </h2>
            <p>
              Environmental management, HSE, occupational health and safety,
              environmental compliance and sustainability.
            </p>
          </article>
        </div>
        <aside className="page-callout">
          {hasCv ? (
            <Link className="text-link" href="/cv">
              Download my current CV <ArrowRight aria-hidden="true" size={15} />
            </Link>
          ) : (
            "A current CV will be shared here once an approved copy is available. Dates, grades and additional credentials have intentionally been omitted until confirmed."
          )}
        </aside>
        <h2>Interested in connecting?</h2>
        <p>
          I welcome conversations about environmental engineering, HSE and
          opportunities to learn and contribute.
        </p>
        <Link className="text-link" href="/contact">
          Get in touch <ArrowRight aria-hidden="true" size={15} />
        </Link>
      </div>
    </>
  );
}
