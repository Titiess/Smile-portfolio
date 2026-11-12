import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  Compass,
  Leaf,
  ShieldCheck,
  Sprout,
} from "lucide-react";
import {
  focusAreas,
  pendingContent,
  experience as defaultExperience,
  certifications as defaultCertifications,
} from "@/lib/content";
import {
  getPublicArticles,
  getPublicCertifications,
  getPublicEducation,
  getPublicExperience,
  getPublicProfile,
  getPublicProjects,
  hasPublicCv,
} from "@/lib/public-data";

export const metadata: Metadata = {
  title: "Environmental Engineering and HSE Portfolio",
  description:
    "Meet Smile Nikoro, an Environmental Engineering graduate and HSE professional focused on environmental management, safety and sustainability.",
  alternates: { canonical: "/" },
};

const areaIcons = {
  leaf: Leaf,
  shield: ShieldCheck,
  sprout: Sprout,
  compass: Compass,
};

export default async function Home() {
  const [profile, projects, experience, education, certifications, articles, hasCv] =
    await Promise.all([
      getPublicProfile(),
      getPublicProjects({ featured: true }),
      getPublicExperience(),
      getPublicEducation(),
      getPublicCertifications(),
      getPublicArticles(3),
      hasPublicCv(),
    ]);

  const experienceList =
    experience.length > 0
      ? experience
      : defaultExperience.map((item, index) => ({
          id: `default-${index}`,
          organisation: item.organisation,
          jobTitle: item.role,
          location: item.location,
          employmentType: item.kind,
          description: item.description,
        }));

  const certList =
    certifications.length > 0
      ? certifications
      : defaultCertifications.map((item, index) => ({
          id: `default-${index}`,
          name: item.name,
          issuingBody: item.issuer,
        }));

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.title,
    email: `mailto:${profile.email}`,
    url: profile.linkedin,
    sameAs: [profile.linkedin].filter(Boolean),
    alumniOf: {
      "@type": "EducationalOrganization",
      name: "Petroleum Training Institute",
    },
    knowsAbout: [
      "Environmental Engineering",
      "Health, Safety and Environment (HSE)",
      "Environmental Management",
      "Occupational Health and Safety",
      "Environmental Sustainability",
      "Environmental Compliance",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <section aria-labelledby="hero-title" className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="eyebrow-dot" />
            Environmental engineering · HSE
          </p>
          <h1 id="hero-title">A safer future starts with <em>thoughtful</em> work.</h1>
          <p className="hero-lede">
            I&apos;m {profile.name}, an Environmental Engineering graduate and HSE
            professional interested in building safer workplaces and a more
            sustainable world.
            {profile.biography ? ` ${profile.biography}` : ""}
          </p>
          <div className="hero-actions">
            <Link className="button" href="/about">
              Get to know me <ArrowRight aria-hidden="true" size={16} />
            </Link>
            <Link className="button button-secondary" href="/projects">
              Explore my work <ArrowUpRight aria-hidden="true" size={15} />
            </Link>
            {hasCv && (
              <a className="text-link" href="/cv">
                Download CV <ArrowUpRight aria-hidden="true" size={15} />
              </a>
            )}
          </div>
          <p className="hero-note">
            <ArrowDown aria-hidden="true" size={15} />
            Open to meaningful conversations and opportunities
          </p>
        </div>
        <div aria-label="Illustrated landscape, a reminder of what environmental work protects" className="hero-visual" role="img">
          <div aria-hidden="true" className="visual-outline" />
          <span aria-hidden="true" className="visual-mark">
            <Leaf size={18} />
          </span>
          <div className="visual-caption">
            <div>
              <span>Purpose in practice</span>
              <strong>People. Places. Planet.</strong>
            </div>
            <ArrowUpRight aria-hidden="true" size={19} />
          </div>
          <div aria-hidden="true" className="hero-stamp">
            <span>SN</span>
            <small>Environment<br />&amp; safety</small>
          </div>
        </div>
      </section>

      <section aria-label="Education and professional certifications" className="credential-bar">
        <div className="credential-inner">
          <span className="credential-label">Grounded in learning &amp; practice</span>
          <span className="credential-item">
            <BookOpen aria-hidden="true" size={17} />
            {education[0]
              ? `${education[0].qualification}, ${education[0].programme}`
              : "Environmental Engineering"}
          </span>
          <span className="credential-item">
            <Award aria-hidden="true" size={17} />
            {certifications.slice(0, 2).map((certification) => certification.name).join(" · ") || "HSE Certifications"}
          </span>
        </div>
      </section>

      <section aria-labelledby="intro-title" className="section">
        <div className="intro-grid">
          <div className="intro-aside">
            <p className="eyebrow">
              <span className="eyebrow-dot" />
              A little about me
            </p>
            <p>
              My work and learning bring together environmental engineering,
              HSE practice and a belief that progress should protect people as
              well as the planet.
            </p>
            <Link className="text-link" href="/about">
              More about Smile <ArrowRight aria-hidden="true" size={15} />
            </Link>
          </div>
          <div className="intro-main">
            <p id="intro-title">
              Environmental responsibility isn&apos;t a box to tick. It&apos;s
              part of <strong>how we design, work and make decisions.</strong>
            </p>
            <p>
              With an HND in Environmental Engineering from the Petroleum
              Training Institute, I&apos;m building a career at the intersection
              of environmental management, occupational health and safety, and
              sustainability.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="focus-title" className="expertise-section">
        <div className="expertise-inner">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                <span className="eyebrow-dot" />
                Areas of focus
              </p>
              <h2 id="focus-title">Where my interests take root.</h2>
            </div>
            <p>
              A growing professional practice shaped by engineering, care for
              the environment and safer ways of working.
            </p>
          </div>
          <div className="focus-grid">
            {focusAreas.map((area) => {
              const Icon = areaIcons[area.icon as keyof typeof areaIcons];
              return (
                <article className="focus-card" key={area.number}>
                  <div className="focus-card-top">
                    <span>{area.number}</span>
                    <Icon aria-hidden="true" size={19} strokeWidth={1.5} />
                  </div>
                  <h3>{area.title}</h3>
                  <p>{area.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section aria-labelledby="work-title" className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              <span className="eyebrow-dot" />
              Selected work
            </p>
            <h2 id="work-title">Work with purpose, shared with care.</h2>
          </div>
          <Link className="text-link" href="/projects">
            Project library <ArrowRight aria-hidden="true" size={15} />
          </Link>
        </div>
        <div className="work-preview">
          {projects.length ? projects.slice(0, 3).map((project, index) => (
            <Link
              aria-label={`Read project: ${project.title}`}
              className="work-card"
              href={`/projects/${project.slug}`}
              key={project.id}
            >
              <div className="work-card-top">
                <span className="work-card-type">{project.category?.name ?? project.projectType}</span>
                <ArrowUpRight aria-hidden="true" size={17} />
              </div>
              <div>
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
              </div>
              <div className="work-card-bottom">
                <span>{project.tags.map((tag) => tag.name).join(" · ") || "Project details"}</span>
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
            </Link>
          )) : (
            <article className="work-card" key="project-placeholder">
              <div className="work-card-top">
                <span className="work-card-type">Project library</span>
                <ArrowUpRight aria-hidden="true" size={17} />
              </div>
              <div>
                <h3>Projects and case studies</h3>
                <p>{pendingContent.projects}</p>
              </div>
              <div className="work-card-bottom">
                <span>Details to be added</span>
                <span>01</span>
              </div>
            </article>
          )}
        </div>
      </section>

      <section aria-labelledby="experience-title" className="section section-tight">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              <span className="eyebrow-dot" />
              Experience
            </p>
            <h2 id="experience-title">Learning through service and practice.</h2>
          </div>
          <Link className="text-link" href="/experience">
            Full experience <ArrowRight aria-hidden="true" size={15} />
          </Link>
        </div>
        <div className="timeline">
          {experienceList.map((item) => (
            <article className="timeline-item" key={item.id}>
              <span className="timeline-kind">{item.employmentType ?? "Experience"}</span>
              <h3>{item.organisation}</h3>
              <p>
                {item.jobTitle}{item.location ? ` · ${item.location}` : ""}
                <br />
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section aria-label="Education and certifications" className="section section-tight">
        <div className="education-panel">
          <div>
            <p className="eyebrow">
              <span className="eyebrow-dot" />
              Education
            </p>
            <h3>
              {education[0]
                ? `${education[0].qualification}, ${education[0].programme}`
                : "Higher National Diploma (HND), Environmental Engineering"}
            </h3>
            <p>{education[0]?.institution ?? "Petroleum Training Institute"}</p>
          </div>
          <div className="education-certs">
            {certList.slice(0, 3).map((certification) => (
              <span key={certification.id}>
                <Award aria-hidden="true" size={16} />
                {certification.name} · {certification.issuingBody}
              </span>
            ))}
            <Link className="text-link" href="/certifications">
              Certification details <ArrowRight aria-hidden="true" size={15} />
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="writing-title" className="section section-tight">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              <span className="eyebrow-dot" />
              Notes &amp; research
            </p>
            <h2 id="writing-title">Ideas worth sharing, in time.</h2>
          </div>
          <Link className="text-link" href="/insights">
            Explore insights <ArrowRight aria-hidden="true" size={15} />
          </Link>
        </div>
        {articles.length ? (
          <div className="article-preview-grid">
            {articles.map((article) => (
              <Link className="article-preview-card" href={`/insights/${article.slug}`} key={article.id}>
                <span>{article.category}</span>
                <h3>{article.title}</h3>
                <p>{article.summary}</p>
                <span className="text-link">Read article <ArrowRight aria-hidden="true" size={14} /></span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="writing-empty">
            <div>
              <BookOpen aria-hidden="true" size={22} />
              <p>{pendingContent.writing}</p>
            </div>
          </div>
        )}
      </section>

      <section aria-labelledby="contact-title" className="cta-section">
        <div className="cta-inner">
          <div>
            <p className="eyebrow">
              <span className="eyebrow-dot" />
              Let&apos;s connect
            </p>
            <h2 id="contact-title">
              Good work begins with a thoughtful conversation.
            </h2>
          </div>
          <Link className="button" href="/contact">
            Get in touch <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
