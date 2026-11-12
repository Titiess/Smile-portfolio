import "./(dashboard)/admin.css";

export const dynamic = "force-dynamic";

export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
