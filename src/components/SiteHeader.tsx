"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/", label: "Validate", hint: "Type a number, watch the card react" },
  { href: "/luhn", label: "Luhn", hint: "The checksum, one digit at a time" },
  { href: "/brands", label: "Brands", hint: "Prefixes, lengths and security codes" },
  { href: "/generator", label: "Generator", hint: "Make Luhn-valid test numbers" },
  { href: "/code", label: "Code", hint: "Copy the check into your project" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5 font-semibold tracking-tight">
          <span aria-hidden className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-ink shadow-[0_0_20px_rgba(94,234,212,0.35)]">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
              <path d="m8 12.5 2.8 2.8L16.5 9.5" />
            </svg>
          </span>
          <span className="text-lg">CardCheck</span>
        </Link>

        <nav aria-label="Main" className="hidden gap-1 sm:flex">
          {LINKS.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors ${
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

        <button
          type="button"
          className="relative grid h-10 w-10 place-items-center rounded-xl border border-line bg-white/5 sm:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="relative block h-3.5 w-5" aria-hidden>
            <span className={`absolute left-0 h-0.5 w-5 rounded bg-ink transition-all duration-300 ${open ? "top-1.5 rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 top-1.5 h-0.5 w-5 rounded bg-ink transition-opacity duration-200 ${open ? "opacity-0" : "opacity-100"}`} />
            <span className={`absolute left-0 h-0.5 w-5 rounded bg-ink transition-all duration-300 ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
          </span>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              tabIndex={-1}
              className="absolute inset-x-0 top-full -z-10 h-dvh bg-black/50 backdrop-blur-sm sm:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.nav
              id="mobile-menu"
              aria-label="Mobile"
              className="absolute inset-x-0 top-full border-b border-line bg-panel-solid/95 px-4 pb-5 pt-2 shadow-2xl backdrop-blur-xl sm:hidden"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <ul className="space-y-1">
                {LINKS.map(({ href, label, hint }, i) => {
                  const active = isActive(href);
                  return (
                    <motion.li
                      key={href}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * i + 0.05 }}
                    >
                      <Link
                        href={href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
                          active ? "bg-accent/12 text-ink" : "text-ink-soft active:bg-white/10"
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`h-8 w-1 rounded-full ${active ? "bg-accent shadow-[0_0_12px_var(--accent)]" : "bg-white/10"}`}
                        />
                        <span className="min-w-0 flex-1">
                          <span className={`block text-base font-medium ${active ? "text-accent" : ""}`}>{label}</span>
                          <span className="block truncate text-xs text-ink-faint">{hint}</span>
                        </span>
                        <svg aria-hidden viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-faint">
                          <path d="m9 6 6 6-6 6" />
                        </svg>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
