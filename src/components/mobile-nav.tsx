"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useRef } from "react";
import { navigation } from "@/lib/content";

export function MobileNav() {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDetailsElement>(null);

  function closeMenu() {
    menuRef.current?.removeAttribute("open");
  }

  function isLinkActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <details className="mobile-nav" ref={menuRef}>
      <summary aria-label="Toggle navigation">
        <Menu aria-hidden="true" className="menu-icon" size={22} />
        <X aria-hidden="true" className="close-icon" size={22} />
      </summary>
      <nav aria-label="Mobile navigation">
        {navigation.map((item) => {
          const active = isLinkActive(item.href);
          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={active ? "active" : undefined}
              href={item.href}
              key={item.href}
              onClick={closeMenu}
            >
              {item.label}
            </Link>
          );
        })}
        <Link
          aria-current={pathname === "/contact" ? "page" : undefined}
          className={`mobile-contact ${pathname === "/contact" ? "active" : ""}`}
          href="/contact"
          onClick={closeMenu}
        >
          Let&apos;s connect <ArrowUpRight aria-hidden="true" size={16} />
        </Link>
      </nav>
    </details>
  );
}
