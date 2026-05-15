"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AQUATICS_EMAIL } from "@/lib/civicrec";

const NAV_ITEMS = [
  { href: "/", label: "Now" },
  { href: "/today", label: "Today" },
  { href: "/week", label: "Week" },
  { href: "/passes", label: "Passes" },
  { href: "/lessons", label: "Lessons" },
];

export function AppShell({ children }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-surface/95 backdrop-blur print:hidden">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div
              className="grid h-9 w-9 place-items-center rounded-lg bg-pool text-sm font-black text-white"
              aria-hidden="true"
            >
              BS
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">
                Berkeley Swim
              </p>
              <p className="text-sm text-muted">Unofficial pool schedules</p>
            </div>
          </Link>

          <nav
            className="grid grid-cols-5 rounded-lg border border-slate-200 bg-slate-100 p-1"
            aria-label="Schedule views"
          >
            {NAV_ITEMS.map((item) => {
              const selected =
                item.href === "/" ? pathname === "/" : pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`grid min-h-9 place-items-center rounded-md px-3 text-sm font-medium transition ${
                    selected
                      ? "bg-surface text-foreground shadow-sm"
                      : "text-muted hover:text-foreground"
                  }`}
                  aria-current={selected ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-4 py-5 sm:px-6 lg:py-8 print:max-w-none print:px-0 print:py-0">
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-surface print:hidden">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-sm text-muted sm:px-6">
          <p>
            Unofficial. Not affiliated with the City of Berkeley. Data scraped
            from berkeleyca.gov.
          </p>
          <p>
            Questions for the City?{" "}
            <a
              href={`mailto:${AQUATICS_EMAIL}`}
              className="font-medium text-pool underline underline-offset-2 hover:text-sky-700"
            >
              Email Aquatics
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
