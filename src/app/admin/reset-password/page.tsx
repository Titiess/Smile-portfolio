import Link from "next/link";
import { ResetPasswordForm } from "@/app/admin/forgot-password/reset-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <main className="admin-auth-page">
      <section className="admin-auth-card">
        <span className="admin-auth-mark">SN</span>
        <p className="admin-eyebrow">Account recovery</p>
        <h1>Choose a new password.</h1>
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <p className="form-message form-error" role="alert">
            This reset link is incomplete. Request a new one to continue.
          </p>
        )}
        <Link className="admin-auth-link" href="/admin/login">Back to sign in</Link>
      </section>
    </main>
  );
}
