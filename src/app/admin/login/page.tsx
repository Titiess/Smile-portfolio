import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/app/admin/login/login-form";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user?.id) redirect("/admin");

  return (
    <main className="admin-auth-page">
      <section className="admin-auth-card">
        <span className="admin-auth-mark">SN</span>
        <p className="admin-eyebrow">Smile Nikoro · Portfolio</p>
        <h1>Welcome back.</h1>
        <p className="admin-auth-copy">Sign in to manage your professional portfolio.</p>
        <LoginForm />
        <Link className="admin-auth-link" href="/admin/forgot-password">Forgot your password?</Link>
        <Link className="admin-auth-link" href="/admin/setup">Initial administrator setup</Link>
      </section>
    </main>
  );
}
