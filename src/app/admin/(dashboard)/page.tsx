import Link from "next/link";
import {
  ArrowUpRight,
  Award,
  FileText,
  FolderKanban,
  Mail,
  Newspaper,
  Plus,
} from "lucide-react";
import { getDashboardSummary } from "@/lib/admin-data";

export default async function AdminDashboardPage() {
  const summary = await getDashboardSummary();
  const stats = [
    { label: "Published projects", value: summary.publishedProjects, icon: FolderKanban },
    { label: "Draft projects", value: summary.draftProjects, icon: FolderKanban },
    { label: "Articles", value: summary.articleCount, icon: Newspaper },
    { label: "Publications", value: summary.publicationCount, icon: FileText },
    { label: "Certifications", value: summary.certificationCount, icon: Award },
    { label: "New enquiries", value: summary.newEnquiryCount, icon: Mail },
  ];

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">Overview</p>
          <h1>Good to see you.</h1>
          <p>Manage your portfolio content and keep your professional profile current.</p>
        </div>
        <Link className="admin-button admin-button-primary" href="/admin/projects?new=1">
          <Plus aria-hidden="true" size={15} /> New project
        </Link>
      </div>
      <section aria-label="Content summary" className="admin-stat-grid">
        {stats.map(({ label, value, icon: Icon }) => (
          <article className="admin-stat-card" key={label}>
            <span className="admin-stat-label">{label}</span>
            <strong className="admin-stat-value">{value}</strong>
            <Icon aria-hidden="true" color="#82a08c" size={16} />
          </article>
        ))}
      </section>
      <div className="admin-dashboard-grid">
        <section className="admin-card">
          <div className="admin-card-heading">
            <h2>Recent content activity</h2>
            <span>Latest 8 actions</span>
          </div>
          {summary.recentActivity.length ? (
            <div className="admin-activity-list">
              {summary.recentActivity.map((item) => (
                <div className="admin-activity-item" key={item.id}>
                  <span>
                    {item.action} · {item.entityType}
                    <small>{item.user?.name ?? "System"} · {item.entityId ?? "—"}</small>
                  </span>
                  <time dateTime={item.createdAt.toISOString()}>
                    {item.createdAt.toLocaleDateString()}
                  </time>
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-empty">
              <ActivityIcon />
              <strong>No activity yet</strong>
              <p>Your content changes will be recorded here.</p>
            </div>
          )}
        </section>
        <section className="admin-card">
          <div className="admin-card-heading">
            <h2>Quick links</h2>
            <span>Common tasks</span>
          </div>
          <div className="admin-shortcuts">
            <QuickLink href="/admin/articles?new=1" label="Write an article" />
            <QuickLink href="/admin/media" label="Upload media" />
            <QuickLink href="/admin/profile" label="Update your profile" />
            <QuickLink href="/admin/enquiries" label="View contact enquiries" />
          </div>
        </section>
      </div>
    </>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link className="admin-shortcut" href={href}>
      {label} <ArrowUpRight aria-hidden="true" size={15} />
    </Link>
  );
}

function ActivityIcon() {
  return <ArrowUpRight aria-hidden="true" size={21} />;
}
