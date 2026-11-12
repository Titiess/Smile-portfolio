import Link from "next/link";
import { RequestResetForm } from "@/app/admin/forgot-password/reset-form";

export default function ForgotPasswordPage() {
  return (
    <main className="admin-auth-page">
      <section className="admin-auth-card">
        <span className="admin-auth-mark">SN</span>
        <p className="admin-eyebrow">Account recovery</p>
        <h1>Reset your password.</h1>
        <p className="admin-auth-copy">
          If an active administrator account matches the address, a one-time
          reset link will be sent.
        </p>
        <RequestResetForm />
        <Link className="admin-auth-link" href="/admin/login">Back to sign in</Link>
      </section>
    </main>
  );
}
