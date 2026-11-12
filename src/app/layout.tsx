import type { Metadata } from "next";
import "./globals.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { getPublicProfile, getPublicSiteSettings } = await import("@/lib/public-data");
  const [profile, settings] = await Promise.all([
    getPublicProfile(),
    getPublicSiteSettings(),
  ]);
  const title =
    settings["site-title"] ??
    `${profile.name} | Environmental Engineering and HSE Portfolio`;
  const description =
    settings["site-description"] ??
    "Environmental engineering, HSE and a more considered approach to the places where we live and work.";

  return {
    metadataBase: process.env.NEXT_PUBLIC_SITE_URL
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
      : undefined,
    title: { default: title, template: `%s | ${profile.name}` },
    description,
    openGraph: {
      type: "website",
      title,
      description,
      siteName: profile.name,
    },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
