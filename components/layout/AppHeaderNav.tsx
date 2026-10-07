"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "一覧" },
  { href: "/dashboard", label: "ダッシュボード" },
] as const;

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppHeaderNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-4" aria-label="メイン">
      {NAV_LINKS.map(({ href, label }) => {
        const active = isActivePath(pathname, href);

        return (
          <Link
            key={href}
            href={href}
            className={
              active
                ? "text-sm font-medium text-foreground"
                : "text-sm text-foreground/60 hover:text-foreground"
            }
            aria-current={active ? "page" : undefined}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
