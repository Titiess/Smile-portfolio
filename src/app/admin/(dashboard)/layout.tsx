import Link from "next/link";
import {
  Activity,
  Award,
  BookOpen,
  BriefcaseBusiness,
  FileText,
  FolderKanban,
  GraduationCap,
  Image,
  LayoutDashboard,
  LogOut,
  Mail,
  Newspaper,
  Settings,
  Shield,
  UserRound,
} from "lucide-react";
import { signOut } from "@/auth";
import { requireUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/articles", label: "Articles", icon: Newspaper },
  { href: "/admin/research", label: "Research", icon: BookOpen },
  { href: "/admin/publications", label: "Publications", icon: FileText },
  { href: "/admin/experience", label: "Experience", icon: BriefcaseBusiness },
  { href: "/admin/education", label: "Education", icon: GraduationCap },
  { href: "/admin/certifications", label: "Certifications", icon: Award },
];

const managementLinks = [
  { href: "/admin/media", label: "Media library", icon: Image },
  { href: "/admin/cv-documents", label: "CV & documents", icon: FileText },
  { href: "/admin/profile", label: "Profile", icon: UserRound },
  { href: "/admin/enquiries", label: "Enquiries", icon: Mail },
  { href: "/admin/settings", label: "Website settings", icon: Settings },
  { href: "/admin/security", label: "Security & activity", icon: Shield },
];

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link aria-label="Portfolio dashboard" className="admin-brand" href="/admin">
          <span className="admin-brand-mark">SN</span>
          <span>
            Smile Nikoro
            <small>Portfolio admin</small>
          </span>
        </Link>
        <nav aria-label="Admin navigation">
          <span className="admin-nav-label">Workspace</span>
          {links.map(({ href, label, icon: Icon }) => (
            <Link className="admin-nav-link" href={href} key={href}>
              <Icon aria-hidden="true" size={17} />
              {label}
            </Link>
          ))}
          <span className="admin-nav-label admin-nav-spaced">Management</span>
          {managementLinks.map(({ href, label, icon: Icon }) => (
            <Link className="admin-nav-link" href={href} key={href}>
              <Icon aria-hidden="true" size={17} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <Link className="admin-nav-link" href="/">
            <Activity aria-hidden="true" size={17} />
            View public site
          </Link>
          <div className="admin-user">
            <span className="admin-user-avatar">{user.name?.slice(0, 1) ?? "S"}</span>
            <span className="admin-user-name">
              {user.name}
              <small>{user.role}</small>
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <button aria-label="Sign out" className="admin-icon-button" title="Sign out" type="submit">
                <LogOut aria-hidden="true" size={16} />
              </button>
            </form>
          </div>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <span>Content management</span>
          <span className="admin-topbar-user">
            <span className="admin-status-dot" />
            Secure workspace
          </span>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
