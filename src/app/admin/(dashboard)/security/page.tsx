import Link from "next/link";
import { requireAdministrator } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { PasswordForm } from "@/app/admin/security/password-form";

export default async function SecurityPage() {
  await requireAdministrator();
  const [logs, lockedLogins, resetTokens] = await prisma.$transaction([
    prisma.auditLog.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.loginAttempt.count({ where: { lockedUntil: { gt: new Date() } } }),
    prisma.passwordResetToken.count({ where: { expiresAt: { gt: new Date() }, usedAt: null } }),
  ]);

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">Account protection</p>
          <h1>Security &amp; activity</h1>
          <p>Review administrative events, rate-limited logins and account security.</p>
        </div>
      </div>
      <div className="admin-stat-grid">
        <div className="admin-stat-card"><span className="admin-stat-label">Temporarily locked login keys</span><strong className="admin-stat-value">{lockedLogins}</strong></div>
        <div className="admin-stat-card"><span className="admin-stat-label">Active password reset links</span><strong className="admin-stat-value">{resetTokens}</strong></div>
        <div className="admin-stat-card"><span className="admin-stat-label">Public registration</span><strong className="admin-stat-value admin-stat-text">Disabled</strong></div>
        <div className="admin-stat-card"><span className="admin-stat-label">Session lifetime</span><strong className="admin-stat-value admin-stat-text">8 hours</strong></div>
      </div>
      <PasswordForm />
      <section className="admin-card admin-security-log">
        <div className="admin-card-heading">
          <h2>Audit log</h2>
          <span>Latest {logs.length} events</span>
        </div>
        {logs.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th scope="col">Action</th><th scope="col">Account</th><th scope="col">Content</th><th scope="col">Date</th></tr></thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.action}</td>
                    <td>{log.user?.email ?? "System"}</td>
                    <td>{log.entityType}{log.entityId ? ` · ${log.entityId}` : ""}</td>
                    <td>{log.createdAt.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty"><strong>No security events recorded yet</strong></div>
        )}
      </section>
      <p className="admin-security-note">
        Need to recover access? Use the <Link href="/admin/forgot-password">password reset flow</Link>.
        Every protected mutation performs a server-side session and role check.
      </p>
    </>
  );
}
