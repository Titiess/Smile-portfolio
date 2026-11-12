import { AdminBar } from "@/components/admin-bar";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <AdminBar />
      <div className="site-shell" id="top">
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </div>
    </>
  );
}
