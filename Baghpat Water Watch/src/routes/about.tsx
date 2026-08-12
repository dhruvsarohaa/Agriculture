import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, Section } from "@/components/AppShell";
import { PrototypeNotice } from "@/components/PrototypeNotice";
import { RiskMethodology } from "@/components/RiskMethodology";
import { StatusPill } from "@/components/RiskBadge";
import { QUALITY_PARAMETERS } from "@/data/types";
import { DUPLICATE_RULE } from "@/lib/risk";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About, Methodology & Limitations — Baghpat Prototype" },
      {
        name: "description",
        content:
          "How this district groundwater prototype works: data sources it is designed for, rule-based risk logic, planned AI models, ethical safeguards and explicit limitations.",
      },
      { property: "og:title", content: "About, Methodology & Limitations — Baghpat Prototype" },
      {
        property: "og:description",
        content:
          "Data sources, transparent risk rules, planned forecasting models, safeguards and the limitations of this demonstration system.",
      },
    ],
  }),
  component: AboutPage,
});

const DATA_SOURCES = [
  {
    name: "Central Ground Water Board (CGWB)",
    role: "Observation-well water-level records and district groundwater assessment reports.",
    status: "Not connected in this prototype",
  },
  {
    name: "India-WRIS",
    role: "Consolidated water-resources time series across agencies for cross-checking levels.",
    status: "Not connected in this prototype",
  },
  {
    name: "National Water Quality Sub-Mission / state lab data",
    role: "Laboratory water-quality parameters such as nitrate, fluoride, arsenic and iron.",
    status: "Not connected in this prototype",
  },
  {
    name: "India Meteorological Department (IMD)",
    role: "Rainfall context to separate seasonal recovery from long-term decline.",
    status: "Not connected in this prototype",
  },
  {
    name: "Community reports",
    role: "Citizen and field-staff observations of dry wells, dry hand pumps and leakage.",
    status: "Collected locally in this prototype",
  },
];

const PLANNED_MODELS = [
  {
    title: "Groundwater level forecasting",
    approach:
      "Per-station time-series model (e.g. seasonal ARIMA or gradient-boosted regression on lagged levels and rainfall) trained on multi-year observation-well records.",
    inputs: "Historical levels, monsoon/rainfall indicators, seasonal index, extraction proxies.",
    output: "Short-horizon depth projection with an uncertainty band.",
  },
  {
    title: "Contamination screening",
    approach:
      "Threshold rules first, then a classifier over parameter combinations and neighbouring stations to prioritise which locations need lab retesting.",
    inputs: "Parameter concentrations, sampling date, station neighbourhood, land-use proxies.",
    output: "Ranked retesting list, never a contamination verdict.",
  },
  {
    title: "Report clustering and de-duplication",
    approach:
      "Spatio-temporal clustering (DBSCAN-style) over report coordinates and timestamps, with text similarity on descriptions.",
    inputs: "Report coordinates, timestamps, type, free-text description.",
    output: "Grouped incidents so one problem is counted once.",
  },
];

const LIMITATIONS = [
  "All numbers on this prototype are synthetic demonstration data generated for Baghpat district; none are official measurements.",
  "Risk levels come from simple published-threshold comparisons and trend slopes, not from validated hydrogeological modelling.",
  "Forecast values are illustrative placeholders and have not been validated against any withheld data.",
  "Block boundaries and station coordinates are approximate schematic geometry for visualisation.",
  "Water-quality risk indicates an observed exceedance in sample data only; it does not confirm contamination and does not replace laboratory testing.",
  "Community reports submitted here are stored in your browser and are not transmitted to any government office.",
  "The system supports human decision-making. It does not issue directives, penalties or legal determinations.",
];

const SAFEGUARDS = [
  "Every screen states that this is a prototype using demonstration data.",
  "No personal identity data is required to file a report; the reporter name field is optional.",
  "Report locations are used only for clustering and prioritisation, never to identify individuals.",
  "Missing data is shown as “Insufficient data”; the system never invents values to fill a gap.",
  "Data source and confidence labels are attached to displayed records so users can judge reliability.",
  "Risk outputs are explained with the exact rule that produced them, so a district officer can disagree with them.",
];

function AboutPage() {
  return (
    <AppShell>
      <PageHeader
        title="About, methodology & limitations"
        subtitle="What this prototype does, how it reasons, and what it deliberately does not claim."
      />

      <div className="mx-auto max-w-4xl space-y-8 px-4 py-7 sm:px-6">
        <PrototypeNotice tone="warning">
          This is a prototype demonstration for Baghpat district, Uttar Pradesh. It uses synthetic
          sample data and is not an official government system or an advisory source.
        </PrototypeNotice>

        <Section
          title="Purpose"
          description="One workflow, end to end: observe → predict → assess risk → report → prioritise action."
        >
          <div className="space-y-3 rounded-lg border border-border bg-card p-5 text-sm leading-relaxed shadow-panel">
            <p>
              District officials, block-level engineers and community members currently read
              groundwater levels, laboratory quality results and field complaints in separate
              places. This prototype shows what it looks like when those three signals sit on one
              screen, are scored with rules anyone can read, and end in a ranked list of blocks to
              visit first.
            </p>
            <p>
              The intended users are district administration and water-department staff who need a
              defensible shortlist, and residents who need a low-friction way to report a dry well
              or a leaking pipeline and see that it was recorded.
            </p>
          </div>
        </Section>

        <Section
          title="Data sources the system is designed for"
          description="A production deployment would ingest these; the prototype substitutes synthetic records."
        >
          <ul className="grid gap-3">
            {DATA_SOURCES.map((s) => (
              <li key={s.name} className="rounded-lg border border-border bg-card p-4 shadow-panel">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold">{s.name}</h3>
                  <StatusPill tone={s.status.startsWith("Collected") ? "info" : "neutral"}>
                    {s.status}
                  </StatusPill>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">{s.role}</p>
              </li>
            ))}
          </ul>
        </Section>

        <RiskMethodology defaultOpen />

        <Section
          title="Thresholds and de-duplication"
          description="The reference values and matching rule used across the app."
        >
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-4 shadow-panel">
              <h3 className="text-sm font-semibold">Report de-duplication</h3>
              <p className="mt-1.5 font-mono text-[11px] leading-relaxed text-muted-foreground">
                same report_type AND distance ≤ {DUPLICATE_RULE.radiusMeters} m AND |Δt| ≤{" "}
                {DUPLICATE_RULE.windowDays} days → potential duplicate / related
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 shadow-panel">
              <h3 className="text-sm font-semibold">Reference thresholds used</h3>
              <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                {QUALITY_PARAMETERS.map((p) => (
                  <li key={p.key}>
                    <span className="font-medium text-foreground">{p.label}</span> — {p.threshold}{" "}
                    {p.unit}. {p.referenceNote}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        <Section
          title="Planned AI / ML components"
          description="Described honestly: these are the intended models, not models running behind this prototype."
        >
          <div className="grid gap-3">
            {PLANNED_MODELS.map((m) => (
              <article
                key={m.title}
                className="rounded-lg border border-border bg-card p-4 shadow-panel"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-display text-base font-semibold">{m.title}</h3>
                  <StatusPill tone="warning">Planned — not trained</StatusPill>
                </div>
                <dl className="mt-2 space-y-1.5 text-xs">
                  <div>
                    <dt className="font-semibold">Approach</dt>
                    <dd className="text-muted-foreground">{m.approach}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Inputs</dt>
                    <dd className="text-muted-foreground">{m.inputs}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Output</dt>
                    <dd className="text-muted-foreground">{m.output}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </Section>

        <Section title="Ethical safeguards">
          <ul className="grid gap-2 rounded-lg border border-border bg-card p-5 text-sm shadow-panel">
            {SAFEGUARDS.map((s) => (
              <li key={s} className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Limitations">
          <ul className="grid gap-2 rounded-lg border border-warning/40 bg-warning-soft p-5 text-sm text-warning-foreground">
            {LIMITATIONS.map((l) => (
              <li key={l} className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-warning" aria-hidden />
                <span>{l}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Scaling beyond Baghpat">
          <div className="rounded-lg border border-border bg-card p-5 text-sm leading-relaxed shadow-panel">
            <p>
              District, block and station identifiers are data, not hard-coded UI. Adding a second
              district means adding its stations, observations and quality records behind the same
              data-service layer; every page, rule and map projection then works unchanged.
              Replacing the synthetic dataset with live CGWB, India-WRIS, lab and IMD feeds is a
              change in one module rather than a rewrite of the interface.
            </p>
          </div>
        </Section>
      </div>
    </AppShell>
  );
}
