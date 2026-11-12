import { ArrowUpRight, Link2, Mail } from "lucide-react";
import Link from "next/link";
import { getPublicProfile } from "@/lib/public-data";

export async function SiteFooter() {
  const profile = await getPublicProfile();
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div>
          <Link className="footer-brand" href="/">
            {profile.name}<span>.</span>
          </Link>
          <p>
            Environmental engineering, HSE and a more considered approach to
            the places where we live and work.
          </p>
        </div>
        <div className="footer-links">
          <a href={`mailto:${profile.email}`}>
            <Mail aria-hidden="true" size={16} />
            {profile.email}
          </a>
          <a href={profile.linkedin} rel="noreferrer" target="_blank">
            <Link2 aria-hidden="true" size={16} />
            LinkedIn <ArrowUpRight aria-hidden="true" size={14} />
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {profile.name}</span>
        <span>Environmental Engineering &amp; HSE</span>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  );
}
