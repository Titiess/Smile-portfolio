import Link from "next/link";
import { Search } from "lucide-react";
import { connection } from "next/server";
import type { EnquiryStatus } from "@prisma/client";
import { requireAdministrator } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { EnquiryStatusForm } from "@/app/admin/(dashboard)/enquiries/enquiry-status-form";

type Props = {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
};

function url(status: string | undefined, search: string, page: number) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (search) params.set("q", search);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return `/admin/enquiries${query ? `?${query}` : ""}`;
}

export default async function EnquiriesPage({ searchParams }: Props) {
  await requireAdministrator();
  await connection();
  const query = await searchParams;
  const search = (query.q ?? "").trim().slice(0, 100);
  const status: EnquiryStatus | undefined =
    query.status === "READ" || query.status === "ARCHIVED"
      ? query.status
      : query.status === "NEW"
        ? "NEW"
        : undefined;
  const page = Math.max(1, Math.min(10000, Number.parseInt(query.page ?? "1", 10) || 1));
  const where = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { subject: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
  const [enquiries, total] = await prisma.$transaction([
    prisma.contactEnquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * 20,
      take: 20,
    }),
    prisma.contactEnquiry.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">Private inbox</p>
          <h1>Contact enquiries</h1>
          <p>Messages are visible only to administrators and are never shown publicly.</p>
        </div>
        <span className="admin-button">{total} messages</span>
      </div>
      <section className="admin-card">
        <div className="admin-toolbar">
          <form action="/admin/enquiries" className="admin-filter-form" method="get">
            <label className="admin-search-input">
              <Search aria-hidden="true" size={14} />
              <input aria-label="Search enquiries" defaultValue={search} name="q" placeholder="Search name, email or subject..." />
            </label>
            <select aria-label="Filter by status" defaultValue={status} name="status">
              <option value="">All statuses</option>
              <option value="NEW">New</option>
              <option value="READ">Read</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <button className="admin-button" type="submit">Filter</button>
          </form>
        </div>
        {enquiries.length ? (
          <div className="admin-enquiry-list">
            {enquiries.map((enquiry) => (
              <article className="admin-enquiry" key={enquiry.id}>
                <div className="admin-enquiry-top">
                  <div>
                    <span className={`admin-status-badge admin-status-${enquiry.status.toLowerCase()}`}>{enquiry.status.toLowerCase()}</span>
                    <h2>{enquiry.subject}</h2>
                    <p>
                      <strong>{enquiry.name}</strong> · <a href={`mailto:${enquiry.email}`}>{enquiry.email}</a>
                    </p>
                  </div>
                  <time dateTime={enquiry.createdAt.toISOString()}>{enquiry.createdAt.toLocaleString()}</time>
                </div>
                <p className="admin-enquiry-message">{enquiry.message}</p>
                {enquiry.notificationError && (
                  <p className="form-message form-error">Email notification issue: {enquiry.notificationError}</p>
                )}
                <div className="admin-enquiry-actions">
                  {enquiry.status === "NEW" && (
                    <EnquiryStatusForm id={enquiry.id} targetStatus="READ" />
                  )}
                  <EnquiryStatusForm
                    id={enquiry.id}
                    targetStatus={enquiry.status === "ARCHIVED" ? "NEW" : "ARCHIVED"}
                  />
                  <Link className="admin-button" href={`mailto:${enquiry.email}?subject=${encodeURIComponent(`Re: ${enquiry.subject}`)}`}>
                    Reply by email
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="admin-empty">
            <Search aria-hidden="true" size={22} />
            <strong>No enquiries found</strong>
            <p>New contact form submissions will appear here.</p>
          </div>
        )}
        <div className="admin-pagination">
          <span>Page {page} of {totalPages}</span>
          <span>
            {page > 1 && <Link className="admin-button" href={url(status, search, page - 1)}>Previous</Link>}
            {page < totalPages && <Link className="admin-button" href={url(status, search, page + 1)}>Next</Link>}
          </span>
        </div>
      </section>
    </>
  );
}
