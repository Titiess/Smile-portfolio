import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { ContentForm } from "@/app/admin/(dashboard)/[section]/content-form";
import { DeleteContentForm } from "@/app/admin/(dashboard)/[section]/delete-content-form";
import { adminModules, isAdminModule, type AdminModule } from "@/lib/admin-modules";
import { getAdminEntry, getMediaSelectOptions, listAdminEntries } from "@/lib/admin-data";

type PageProps = {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ edit?: string; new?: string; page?: string; q?: string; status?: string }>;
};

function listingUrl(module: AdminModule, page: number, search: string, status: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (search) params.set("q", search);
  if (status) params.set("status", status);
  const query = params.toString();
  return `/admin/${module}${query ? `?${query}` : ""}`;
}

export default async function ContentAdminPage({ params, searchParams }: PageProps) {
  await connection();
  const { section } = await params;
  if (!isAdminModule(section)) notFound();
  const contentModule = section;
  const query = await searchParams;
  const page = Math.max(1, Math.min(10000, Number.parseInt(query.page ?? "1", 10) || 1));
  const search = (query.q ?? "").trim().slice(0, 100);
  const status = query.status ?? "";
  const isEditing = Boolean(query.edit);
  const isCreating = query.new === "1";
  if (isEditing && query.edit!.length > 64) notFound();

  const [result, edit, mediaOptions] = await Promise.all([
    listAdminEntries(contentModule, page, search, status),
    isEditing ? getAdminEntry(contentModule, query.edit!) : Promise.resolve(null),
    getMediaSelectOptions(contentModule),
  ]);
  if (isEditing && !edit) notFound();
  const config = adminModules[contentModule];
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">Content management</p>
          <h1>{config.label}</h1>
          <p>Create, edit, publish, unpublish and archive your {config.label.toLowerCase()}.</p>
        </div>
        {!isCreating && !isEditing && (
          <Link className="admin-button admin-button-primary" href={`/admin/${contentModule}?new=1`}>
            <Plus aria-hidden="true" size={15} /> New {config.singular}
          </Link>
        )}
      </div>

      {(isCreating || isEditing) && (
        <div>
          <Link className="text-link admin-back-link" href={listingUrl(contentModule, page, search, status)}>
            <ArrowLeft aria-hidden="true" size={14} /> Back to {config.label.toLowerCase()}
          </Link>
          <ContentForm
            fields={config.fields}
            initialValues={edit ?? {}}
            mediaOptions={mediaOptions}
            module={contentModule}
          />
        </div>
      )}

      <section className="admin-card">
        <div className="admin-toolbar">
          <form action={`/admin/${contentModule}`} className="admin-filter-form" method="get">
            <input aria-label={`Search ${config.label}`} defaultValue={search} name="q" placeholder={`Search ${config.label.toLowerCase()}...`} />
            <select aria-label="Filter by status" defaultValue={status} name="status">
              <option value="">All statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <button className="admin-button" type="submit">Filter</button>
          </form>
          <span className="admin-muted-count">{result.total} total</span>
        </div>
        {result.items.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Title</th>
                  <th scope="col">Status</th>
                  <th scope="col">Last updated</th>
                  <th scope="col"><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.title}</strong>
                      {item.summary && <small>{item.summary}</small>}
                    </td>
                    <td><span className={`admin-status-badge admin-status-${item.status.toLowerCase()}`}>{item.status.toLowerCase()}</span></td>
                    <td>{item.updatedAt.toLocaleDateString()}</td>
                    <td>
                      <div className="admin-table-actions">
                        <Link className="admin-button" href={`/admin/${contentModule}?edit=${encodeURIComponent(item.id)}`}>Edit</Link>
                        <DeleteContentForm id={item.id} module={contentModule} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty">
            <Plus aria-hidden="true" size={22} />
            <strong>{search || status ? "No matching content" : `No ${config.label.toLowerCase()} yet`}</strong>
            <p>{search || status ? "Try changing the search or status filter." : `Create your first ${config.singular} to get started.`}</p>
          </div>
        )}
        <div className="admin-pagination">
          <span>Page {page} of {totalPages}</span>
          <span>
            {page > 1 && <Link className="admin-button" href={listingUrl(contentModule, page - 1, search, status)}><ChevronLeft aria-hidden="true" size={14} /> Previous</Link>}
            {page < totalPages && <Link className="admin-button" href={listingUrl(contentModule, page + 1, search, status)}><ChevronRight aria-hidden="true" size={14} /> Next</Link>}
          </span>
        </div>
      </section>
    </>
  );
}
