import Link from "next/link";
import { LayoutDashboard, LogOut, Plus, Shield } from "lucide-react";
import { auth, signOut } from "@/auth";

export async function AdminBar() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const role = session.user.role ?? "ADMIN";
  const name = session.user.name ?? "Smile Nikoro";

  return (
    <aside aria-label="Administrator quick navigation" className="admin-quickbar">
      <div className="admin-quickbar-inner">
        <div className="admin-quickbar-badge">
          <Shield aria-hidden="true" size={13} />
          <span>
            Logged in as <strong>{name}</strong> <small>({role})</small>
          </span>
        </div>

        <nav aria-label="Administrator shortcuts" className="admin-quickbar-nav">
          <Link className="admin-quickbar-link admin-quickbar-primary" href="/admin">
            <LayoutDashboard aria-hidden="true" size={13} /> Dashboard
          </Link>
          <Link className="admin-quickbar-link" href="/admin/projects?new=1">
            <Plus aria-hidden="true" size={13} /> Project
          </Link>
          <Link className="admin-quickbar-link" href="/admin/articles?new=1">
            <Plus aria-hidden="true" size={13} /> Article
          </Link>
          <Link className="admin-quickbar-link" href="/admin/media">
            Media
          </Link>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button className="admin-quickbar-logout" title="Sign out of administrator session" type="submit">
              <LogOut aria-hidden="true" size={12} /> Sign out
            </button>
          </form>
        </nav>
      </div>
    </aside>
  );
}
