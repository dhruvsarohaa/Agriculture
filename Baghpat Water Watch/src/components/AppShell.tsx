import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Droplets, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReportProblemDialog } from "./ReportProblemDialog";

const NAV = [
  { to: "/", label: "Dashboard" },
  { to: "/groundwater", label: "Groundwater" },
  { to: "/water-quality", label: "Water Quality" },
  { to: "/reports", label: "Reports" },
  { to: "/risk-map", label: "Risk Map" },
  { to: "/about", label: "About / Data Sources" },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
              <Droplets className="size-5" aria-hidden />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-sm font-semibold sm:text-base">
                Baghpat Groundwater Intelligence
              </span>
              <span className="block text-[11px] text-muted-foreground">
                District decision-support prototype
              </span>
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Main">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto hidden lg:ml-3 lg:block">
            <ReportProblemDialog size="default" triggerLabel="Report a Problem" />
          </div>

          <button
            type="button"
            className="ml-auto grid size-10 place-items-center rounded-md border border-border lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle navigation"
          >
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>

        {open ? (
          <div className="border-t border-border bg-card px-4 pb-4 pt-2 lg:hidden">
            <nav className="grid gap-1" aria-label="Mobile">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-3 text-sm font-medium text-muted-foreground"
                  activeProps={{ className: "bg-secondary text-foreground" }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-3">
              <ReportProblemDialog triggerClassName="w-full" />
            </div>
          </div>
        ) : null}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 text-xs text-muted-foreground sm:px-6">
          <p className="font-semibold text-foreground">
            Research / engineering prototype — Baghpat, Uttar Pradesh
          </p>
          <p className="mt-1 max-w-3xl leading-relaxed">
            All records shown carry <span className="font-mono">source = DEMO_DATA</span> unless
            submitted by you in this session. The prototype has no live government data feed, no
            real-time WIMS access and no validated machine-learning predictions. It does not replace
            laboratory water testing or official assessments.
          </p>
        </div>
      </footer>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("hero-band border-b border-border", className)}>
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-7 sm:px-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
      </div>
    </div>
  );
}

export function Section({
  title,
  description,
  children,
  aside,
  className,
  id,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("space-y-3", className)}>
      {title ? (
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-semibold">{title}</h2>
            {description ? (
              <p className="mt-1 max-w-3xl text-xs text-muted-foreground sm:text-sm">
                {description}
              </p>
            ) : null}
          </div>
          {aside}
        </div>
      ) : null}
      {children}
    </section>
  );
}
