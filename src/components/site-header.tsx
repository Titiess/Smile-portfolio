import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DesktopNav } from "@/components/desktop-nav";
import { MobileNav } from "@/components/mobile-nav";
import { getPublicProfile } from "@/lib/public-data";

export async function SiteHeader() {
  const profile = await getPublicProfile();
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link aria-label={`${profile.name} — home`} className="brand" href="/">
          <span aria-hidden="true" className="brand-mark">
            {profile.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("")}
          </span>
          <span className="brand-name">
            {profile.name}
            <span>{profile.title}</span>
          </span>
        </Link>

        <DesktopNav />

        <Link className="header-contact" href="/contact">
          Let&apos;s connect <ArrowUpRight aria-hidden="true" size={15} />
        </Link>

        <MobileNav />
      </div>
    </header>
  );
}
