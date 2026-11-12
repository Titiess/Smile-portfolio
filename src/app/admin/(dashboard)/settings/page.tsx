import { requireAdministrator } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { SettingForm } from "@/app/admin/settings/setting-form";

export default async function SiteSettingsPage() {
  await requireAdministrator();
  const [settings, profile] = await Promise.all([
    prisma.siteSettings.findMany(),
    prisma.profile.findUnique({ where: { id: "primary" } }),
  ]);
  const values = new Map(settings.map((setting) => [setting.key, String(setting.value)]));

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">Configuration</p>
          <h1>Website settings</h1>
          <p>Update public site metadata and contact presentation.</p>
        </div>
      </div>
      <div className="admin-setting-list">
        <section className="admin-card">
          <div className="admin-card-heading"><h2>Search and sharing</h2></div>
          <div className="admin-card-body admin-setting-stack">
            <SettingForm
              help="Used in page titles and social sharing."
              label="Website title"
              settingKey="site-title"
              value={values.get("site-title") ?? "Smile Nikoro | Environmental Engineering and HSE Portfolio"}
            />
            <SettingForm
              help="Default description for search engines and social previews."
              label="Website description"
              settingKey="site-description"
              value={values.get("site-description") ?? "Environmental Engineering, HSE and sustainability portfolio of Smile Nikoro."}
            />
          </div>
        </section>
        <section className="admin-card">
          <div className="admin-card-heading"><h2>Contact</h2></div>
          <div className="admin-card-body">
            <SettingForm
              help="Used as the public contact address. Email notifications go to this address."
              label="Contact email"
              settingKey="contact-email"
              type="email"
              value={values.get("contact-email") ?? profile?.email ?? "smileniko18@gmail.com"}
            />
          </div>
        </section>
        <aside className="page-callout">
          Configure database, storage, authentication and email credentials in
          the server environment. Secrets cannot be edited or viewed in this
          dashboard.
        </aside>
      </div>
    </>
  );
}
