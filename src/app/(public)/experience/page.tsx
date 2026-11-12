import type { Metadata } from "next";
import { PageHeading } from "@/components/page-heading";
import { experience as defaultExperience } from "@/lib/content";
import { getPublicExperience } from "@/lib/public-data";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Professional and service experience of Smile Nikoro in HSE and public service.",
  alternates: { canonical: "/experience" },
};

export default async function ExperiencePage() {
  const storedExperience = await getPublicExperience();
  const experienceList =
    storedExperience.length > 0
      ? storedExperience
      : defaultExperience.map((item, index) => ({
          id: `default-${index}`,
          organisation: item.organisation,
          jobTitle: item.role,
          location: item.location,
          employmentType: item.kind,
          description: item.description,
          responsibilities: [] as string[],
          achievements: [] as string[],
        }));

  return (
    <>
      <PageHeading
        description="Experience across an industrial HSE environment and national service in local government."
        eyebrow="Experience"
        title="Learning through service and practice."
      />
      <div className="page-content">
        <div className="page-list">
          {experienceList.map((item) => (
            <article className="page-list-item" key={item.id}>
              <p className="eyebrow">
                <span className="eyebrow-dot" />
                {item.employmentType ?? "Experience"}
              </p>
              <h2>{item.organisation}</h2>
              <p>
                <strong>{item.jobTitle}</strong>{item.location ? ` · ${item.location}` : ""}
              </p>
              <p>{item.description}</p>
              {item.responsibilities.length > 0 && (
                <ul>
                  {item.responsibilities.map((responsibility) => <li key={responsibility}>{responsibility}</li>)}
                </ul>
              )}
              {item.achievements.length > 0 && (
                <ul>
                  {item.achievements.map((achievement) => <li key={achievement}>{achievement}</li>)}
                </ul>
              )}
            </article>
          ))}
        </div>
        <aside className="page-callout">
          Dates, detailed responsibilities and achievements are not shown
          because they have not yet been provided for publication.
        </aside>
      </div>
    </>
  );
}
