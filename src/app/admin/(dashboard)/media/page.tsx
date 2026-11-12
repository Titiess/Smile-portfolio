import Image from "next/image";
import Link from "next/link";
import { FileText, Image as ImageIcon, LockKeyhole } from "lucide-react";
import { connection } from "next/server";
import { MediaUploadForm } from "@/app/admin/media/upload-form";
import { MediaDetailsForm } from "@/app/admin/media/media-details-form";
import { DeleteMediaForm } from "@/app/admin/media/delete-media-form";
import { prisma } from "@/lib/prisma";

type Props = {
  searchParams: Promise<{ q?: string; type?: string }>;
};

export default async function MediaLibraryPage({ searchParams }: Props) {
  await connection();
  const query = await searchParams;
  const search = (query.q ?? "").trim().slice(0, 100);
  const type = query.type ?? "";
  const where = {
    ...(type === "images"
      ? { mimeType: { startsWith: "image/" } }
      : type === "pdf"
        ? { mimeType: "application/pdf" }
        : {}),
    ...(search
      ? {
          OR: [
            { originalName: { contains: search, mode: "insensitive" as const } },
            { altText: { contains: search, mode: "insensitive" as const } },
            { caption: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
  const media = await prisma.media.findMany({
    where,
    include: { documents: { select: { id: true, title: true } }, cvVersions: { select: { id: true, isCurrent: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">File management</p>
          <h1>Media library</h1>
          <p>Upload images and PDFs, edit accessibility metadata and manage file access.</p>
        </div>
        <span className="admin-button">{media.length} files shown</span>
      </div>
      <section className="admin-card admin-media-section">
        <div className="admin-card-heading">
          <h2>Upload an image</h2>
          <span>JPEG, PNG or WebP · Up to 10 MB</span>
        </div>
        <MediaUploadForm />
        <form action="/admin/media" className="admin-toolbar" method="get">
          <div className="admin-filter-form">
            <input aria-label="Search media" defaultValue={search} name="q" placeholder="Search files or alt text..." />
            <select aria-label="Filter by file type" defaultValue={type} name="type">
              <option value="">All file types</option>
              <option value="images">Images</option>
              <option value="pdf">PDF documents</option>
            </select>
            <button className="admin-button" type="submit">Filter</button>
          </div>
        </form>
        {media.length ? (
          <div className="admin-media-grid admin-media-grid-padded">
            {media.map((item) => (
              <article className="admin-media-card" key={item.id}>
                <div className="admin-media-preview">
                  {item.mimeType.startsWith("image/") ? (
                    <Image
                      alt={item.altText || item.originalName}
                      height={180}
                      src={`/api/media/${item.id}/download`}
                      unoptimized
                      width={240}
                    />
                  ) : (
                    <FileText aria-hidden="true" size={32} />
                  )}
                  {item.isPrivate && (
                    <span className="admin-private-badge">
                      <LockKeyhole aria-hidden="true" size={11} /> Private
                    </span>
                  )}
                </div>
                <div className="admin-media-details">
                  <strong title={item.originalName}>{item.originalName}</strong>
                  <small>{item.mimeType} · {(item.sizeBytes / 1024 / 1024).toFixed(2)} MB</small>
                  <small>Uploaded {item.createdAt.toLocaleDateString()}</small>
                  {item.documents.length > 0 && <small>Document: {item.documents.map((doc) => doc.title).join(", ")}</small>}
                  {item.cvVersions.length > 0 && <small>{item.cvVersions.some((cv) => cv.isCurrent) ? "Current CV" : "Archived CV"}</small>}
                </div>
                <MediaDetailsForm altText={item.altText} caption={item.caption} id={item.id} />
                <div className="admin-media-actions">
                  <Link className="admin-button" href={`/api/media/${item.id}/download`} rel="noreferrer" target="_blank">
                    {item.mimeType.startsWith("image/") ? <ImageIcon aria-hidden="true" size={13} /> : <FileText aria-hidden="true" size={13} />}
                    Open
                  </Link>
                  <DeleteMediaForm id={item.id} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="admin-empty">
            <ImageIcon aria-hidden="true" size={23} />
            <strong>No files found</strong>
            <p>Upload an image or change your filters to see matching files.</p>
          </div>
        )}
      </section>
    </>
  );
}
