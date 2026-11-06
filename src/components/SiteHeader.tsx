"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Validate" },
  { href: "/luhn", label: "Luhn" },
  { href: "/brands", label: "Brands" },
  { href: "/generator", label: "Generator" },
  { href: "/code", label: "Code" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2 sm:flex-nowrap sm:px-6 sm:py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span
            aria-hidden
            className="grid h-7 w-7 place-items-center rounded-md bg-accent text-accent-ink"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
              <path d="m8 12.5 2.8 2.8L16.5 9.5" />
            </svg>
          </span>
          CardCheck
        </Link>

        <nav aria-label="Main" className="-mx-2 flex w-full gap-1 overflow-x-auto sm:mx-0 sm:-mr-2 sm:w-auto">
          {LINKS.map(({ href, label }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors sm:py-1.5 ${
                  active ? "text-ink" : "text-ink-soft hover:bg-white/5 hover:text-ink"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-lg bg-white/10"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
