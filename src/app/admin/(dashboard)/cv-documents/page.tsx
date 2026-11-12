import Link from "next/link";
import { FileText, ShieldCheck } from "lucide-react";
import { connection } from "next/server";
import { UploadCvForm, UploadDocumentForm } from "@/app/admin/cv-documents/upload-document-form";
import { DocumentDetailsForm } from "@/app/admin/cv-documents/document-details-form";
import { SetCurrentCvForm } from "@/app/admin/cv-documents/set-current-form";
import { prisma } from "@/lib/prisma";

export default async function CvDocumentsPage() {
  await connection();
  const [versions, documents] = await prisma.$transaction([
    prisma.cvVersion.findMany({
      include: { media: { select: { id: true, originalName: true, sizeBytes: true, isPrivate: true } } },
      orderBy: { uploadedAt: "desc" },
    }),
    prisma.document.findMany({
      include: { media: { select: { id: true, originalName: true, sizeBytes: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">Documents</p>
          <h1>CV &amp; documents</h1>
          <p>Publish the current approved CV and manage public and private PDF documents.</p>
        </div>
      </div>
      <section className="admin-card admin-form-section">
        <div className="admin-card-heading">
          <h2>CV versions</h2>
          <span>Current public CV downloads at <Link href="/cv">/cv</Link></span>
        </div>
        <UploadCvForm />
        {versions.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th scope="col">Version</th><th scope="col">Uploaded</th><th scope="col">Access</th><th scope="col">Status</th><th scope="col">Action</th></tr>
              </thead>
              <tbody>
                {versions.map((version) => (
                  <tr key={version.id}>
                    <td><strong>{version.label}</strong><small>{version.media.originalName} · {(version.media.sizeBytes / 1024 / 1024).toFixed(2)} MB</small></td>
                    <td>{version.uploadedAt.toLocaleDateString()}</td>
                    <td>{version.media.isPrivate ? "Private" : "Public"}</td>
                    <td><span className={`admin-status-badge ${version.isCurrent ? "admin-status-published" : "admin-status-archived"}`}>{version.isCurrent ? "Current" : "Archived"}</span></td>
                    <td>{!version.isCurrent && !version.media.isPrivate && <SetCurrentCvForm id={version.id} />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty">
            <FileText aria-hidden="true" size={23} />
            <strong>No CV uploaded yet</strong>
            <p>Upload an approved PDF. The public /cv route always resolves to the current version.</p>
          </div>
        )}
      </section>

      <section className="admin-card admin-form-section">
        <div className="admin-card-heading">
          <h2>Document library</h2>
          <span>Private downloads require administrator access</span>
        </div>
        <UploadDocumentForm />
        {documents.length ? (
          <div className="admin-document-list">
            {documents.map((document) => (
              <article className="admin-document-card" key={document.id}>
                <div className="admin-document-heading">
                  <FileText aria-hidden="true" size={19} />
                  <div>
                    <strong>{document.title}</strong>
                    <small>{document.media.originalName} · {document.type.toLowerCase().replaceAll("_", " ")} · {(document.media.sizeBytes / 1024 / 1024).toFixed(2)} MB</small>
                  </div>
                  <span className={`admin-status-badge ${document.isPublic ? "admin-status-published" : "admin-status-archived"}`}>
                    {document.isPublic ? "Public" : <><ShieldCheck aria-hidden="true" size={11} /> Private</>}
                  </span>
                  <Link className="admin-button" href={`/api/media/${document.media.id}/download`} rel="noreferrer" target="_blank">Open PDF</Link>
                </div>
                <DocumentDetailsForm
                  description={document.description}
                  id={document.id}
                  isPublic={document.isPublic}
                  title={document.title}
                  type={document.type}
                />
              </article>
            ))}
          </div>
        ) : (
          <div className="admin-empty">
            <FileText aria-hidden="true" size={23} />
            <strong>No documents yet</strong>
            <p>Upload certificates, reports, publications and project attachments as PDFs.</p>
          </div>
        )}
      </section>
    </>
  );
}
