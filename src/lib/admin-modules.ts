export type AdminModule =
  | "projects"
  | "articles"
  | "research"
  | "publications"
  | "experience"
  | "education"
  | "certifications";

export type AdminField = {
  name: string;
  label: string;
  type?: "textarea" | "richtext" | "date" | "number" | "select" | "multiselect" | "checkbox";
  required?: boolean;
  options?: { label: string; value: string }[];
  help?: string;
};

const statusOptions = [
  { label: "Draft", value: "DRAFT" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Archived", value: "ARCHIVED" },
];

export const adminModules: Record<
  AdminModule,
  { label: string; singular: string; fields: AdminField[] }
> = {
  projects: {
    label: "Projects",
    singular: "project",
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "slug", label: "Slug", help: "Leave blank to generate from title." },
      { name: "summary", label: "Short summary", type: "textarea", required: true },
      { name: "category", label: "Category", help: "For example: Academic project" },
      { name: "projectType", label: "Project type" },
      { name: "description", label: "Full description", type: "textarea" },
      { name: "contentHtml", label: "Rich-text content", type: "richtext" },
      { name: "objectives", label: "Objectives", type: "textarea", help: "One item per line." },
      { name: "methodology", label: "Methodology", type: "textarea" },
      { name: "findings", label: "Findings", type: "textarea" },
      { name: "recommendations", label: "Recommendations", type: "textarea" },
      { name: "references", label: "References", type: "textarea", help: "One reference per line." },
      { name: "tags", label: "Tags", type: "textarea", help: "Separate tags with commas." },
      { name: "featuredImageId", label: "Featured image", type: "select" },
      { name: "galleryImageIds", label: "Image gallery", type: "multiselect", help: "Choose public images to display in the case study." },
      { name: "pdfAttachmentIds", label: "PDF attachments", type: "multiselect", help: "Choose public PDFs to attach to the case study." },
      { name: "featured", label: "Feature on the homepage", type: "checkbox" },
      { name: "status", label: "Status", type: "select", options: statusOptions, required: true },
      { name: "publishedAt", label: "Publication date", type: "date" },
      { name: "seoTitle", label: "SEO title" },
      { name: "seoDescription", label: "SEO description", type: "textarea" },
    ],
  },
  articles: {
    label: "Articles",
    singular: "article",
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "slug", label: "Slug", help: "Leave blank to generate from title." },
      { name: "summary", label: "Summary", type: "textarea", required: true },
      { name: "category", label: "Category" },
      { name: "tags", label: "Tags", type: "textarea", help: "Separate tags with commas." },
      { name: "contentHtml", label: "Article body", type: "richtext", required: true },
      { name: "coverImageId", label: "Cover image", type: "select" },
      { name: "status", label: "Status", type: "select", options: statusOptions, required: true },
      { name: "publishedAt", label: "Publication date", type: "date" },
      { name: "seoTitle", label: "SEO title" },
      { name: "seoDescription", label: "SEO description", type: "textarea" },
    ],
  },
  research: {
    label: "Research",
    singular: "research item",
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "slug", label: "Slug", help: "Leave blank to generate from title." },
      { name: "summary", label: "Summary", type: "textarea", required: true },
      { name: "abstract", label: "Abstract", type: "textarea" },
      { name: "methodology", label: "Methodology", type: "textarea" },
      { name: "findings", label: "Findings", type: "textarea" },
      { name: "references", label: "References", type: "textarea", help: "One reference per line." },
      { name: "tags", label: "Tags", type: "textarea", help: "Separate tags with commas." },
      { name: "status", label: "Status", type: "select", options: statusOptions, required: true },
      { name: "publishedAt", label: "Publication date", type: "date" },
      { name: "seoTitle", label: "SEO title" },
      { name: "seoDescription", label: "SEO description", type: "textarea" },
    ],
  },
  publications: {
    label: "Publications",
    singular: "publication",
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "authors", label: "Authors", type: "textarea", help: "One author per line." },
      { name: "abstract", label: "Abstract", type: "textarea" },
      {
        name: "publicationType",
        label: "Publication type",
        type: "select",
        options: [
          { label: "Journal article", value: "JOURNAL_ARTICLE" },
          { label: "Conference paper", value: "CONFERENCE_PAPER" },
          { label: "Thesis", value: "THESIS" },
          { label: "Report", value: "REPORT" },
          { label: "Other", value: "OTHER" },
        ],
      },
      { name: "journal", label: "Journal or conference" },
      { name: "publicationDate", label: "Publication date", type: "date" },
      { name: "doi", label: "DOI" },
      { name: "externalUrl", label: "External URL" },
      { name: "pdfMediaId", label: "PDF attachment", type: "select" },
      { name: "citation", label: "Citation details", type: "textarea" },
      { name: "status", label: "Status", type: "select", options: statusOptions, required: true },
    ],
  },
  experience: {
    label: "Experience",
    singular: "experience",
    fields: [
      { name: "organisation", label: "Organisation", required: true },
      { name: "jobTitle", label: "Job title", required: true },
      { name: "employmentType", label: "Employment type" },
      { name: "location", label: "Location" },
      { name: "startDate", label: "Start date", type: "date" },
      { name: "endDate", label: "End date", type: "date" },
      { name: "responsibilities", label: "Responsibilities", type: "textarea", help: "One item per line." },
      { name: "achievements", label: "Achievements", type: "textarea", help: "One item per line. Only include verified details." },
      { name: "description", label: "Description", type: "textarea" },
      { name: "displayOrder", label: "Display order", type: "number" },
      { name: "status", label: "Status", type: "select", options: statusOptions, required: true },
    ],
  },
  education: {
    label: "Education",
    singular: "education item",
    fields: [
      { name: "institution", label: "Institution", required: true },
      { name: "qualification", label: "Qualification", required: true },
      { name: "programme", label: "Programme", required: true },
      { name: "startDate", label: "Start date", type: "date" },
      { name: "endDate", label: "End date", type: "date" },
      { name: "classification", label: "Classification" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "displayOrder", label: "Display order", type: "number" },
      { name: "status", label: "Status", type: "select", options: statusOptions, required: true },
    ],
  },
  certifications: {
    label: "Certifications",
    singular: "certification",
    fields: [
      { name: "name", label: "Certificate name", required: true },
      { name: "issuingBody", label: "Issuing body", required: true },
      { name: "issueDate", label: "Issue date", type: "date" },
      { name: "expiryDate", label: "Expiry date", type: "date" },
      { name: "credentialRef", label: "Credential reference" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "mediaId", label: "Certificate file", type: "select" },
      { name: "verificationUrl", label: "Verification URL" },
      { name: "displayOrder", label: "Display order", type: "number" },
      { name: "status", label: "Status", type: "select", options: statusOptions, required: true },
    ],
  },
};

export function isAdminModule(value: string): value is AdminModule {
  return Object.hasOwn(adminModules, value);
}

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

export function splitLines(value: string | undefined) {
  return value
    ?.split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean) ?? [];
}

export function splitTags(value: string | undefined) {
  return value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean) ?? [];
}

export function dateValue(value: string | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
