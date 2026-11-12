import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { SetupForm } from "@/app/admin/setup/setup-form";

export default async function AdminSetupPage() {
  await connection();
  const hasAdministrator = (await prisma.user.count()) > 0;

  return (
    <main className="admin-auth-page">
      <section className="admin-auth-card">
        <span className="admin-auth-mark">SN</span>
        <p className="admin-eyebrow">Secure initial setup</p>
        <h1>Administrator access.</h1>
        {hasAdministrator ? (
          <>
            <p className="admin-auth-copy">
              Setup is closed because an administrator account already exists.
            </p>
            <Link className="admin-button admin-button-primary" href="/admin/login">Go to sign in</Link>
          </>
        ) : process.env.ADMIN_SETUP_TOKEN ? (
          <>
            <p className="admin-auth-copy">
              Create the first administrator. This form closes permanently after
              the first account is created.
            </p>
            <SetupForm />
          </>
        ) : (
          <p className="form-message form-error" role="alert">
            Initial setup is disabled. Configure ADMIN_SETUP_TOKEN on the server
            and try again.
          </p>
        )}
      </section>
    </main>
  );
}
