import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CopyCheck, Inbox } from "lucide-react";
import { AppShell, PageHeader, Section } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { KpiCard } from "@/components/KpiCard";
import { PrototypeNotice } from "@/components/PrototypeNotice";
import { ReportProblemDialog } from "@/components/ReportProblemDialog";
import { StatusPill } from "@/components/RiskBadge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  REPORT_STATUS_LABELS,
  REPORT_TYPE_LABELS,
  type ReportPriority,
  type ReportStatus,
  type ReportType,
} from "@/data/types";
import { DUPLICATE_RULE } from "@/lib/risk";
import { findRelatedReports, useCommunityReports } from "@/services/reports-store";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Community Water Reports — Baghpat Prototype" },
      {
        name: "description",
        content:
          "Community reports of pipeline leakage, dry wells, dry hand pumps and water-quality concerns in Baghpat district, with prototype duplicate detection and status tracking.",
      },
      { property: "og:title", content: "Community Water Reports — Baghpat Prototype" },
      {
        property: "og:description",
        content:
          "Submit and track dry-well, leakage and water-quality reports with prototype duplicate detection and status workflow.",
      },
    ],
  }),
  component: ReportsPage,
});

const STATUS_TONE: Record<ReportStatus, "info" | "warning" | "critical" | "safe"> = {
  new: "info",
  under_review: "warning",
  field_verification: "critical",
  resolved: "safe",
};

const PRIORITY_TONE: Record<ReportPriority, "neutral" | "warning" | "critical"> = {
  low: "neutral",
  medium: "warning",
  high: "critical",
};

function ReportsPage() {
  const reports = useCommunityReports();
  const [type, setType] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [priority, setPriority] = useState<string>("all");

  const related = useMemo(() => findRelatedReports(reports), [reports]);

  const filtered = useMemo(
    () =>
      reports.filter((r) => {
        if (type !== "all" && r.report_type !== type) return false;
        if (status !== "all" && r.status !== status) return false;
        if (priority !== "all" && r.priority !== priority) return false;
        return true;
      }),
    [reports, type, status, priority],
  );

  const duplicateCount = Object.keys(related).length;

  return (
    <AppShell>
      <PageHeader
        title="Community reports"
        subtitle="Leakage, dry-well, dry hand pump and water-quality concerns raised by citizens and field staff."
      >
        <ReportProblemDialog />
      </PageHeader>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-7 sm:px-6">
        <PrototypeNotice>
          Seed reports carry <span className="font-mono">source = DEMO_DATA</span>. Reports you
          submit in this session are stored locally in your browser only and are not sent to any
          government office.
        </PrototypeNotice>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Total reports"
            value={`${reports.length}`}
            icon={<Inbox className="size-4" />}
            unitNote="Demo seed + your submissions"
            emphasis
          />
          <KpiCard
            label="Active"
            value={`${reports.filter((r) => r.status !== "resolved").length}`}
            unitNote="Not yet resolved"
          />
          <KpiCard
            label="High priority"
            value={`${reports.filter((r) => r.priority === "high").length}`}
            unitNote="Dry wells and dry hand pumps first"
          />
          <KpiCard
            label="Potential duplicates"
            value={`${duplicateCount}`}
            icon={<CopyCheck className="size-4" />}
            unitNote={`Same type within ~${DUPLICATE_RULE.radiusMeters} m and ~${DUPLICATE_RULE.windowDays} days`}
          />
        </div>

        <Section title="Filters">
          <div className="grid gap-3 rounded-lg border border-border bg-card p-4 shadow-panel sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="f-type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="f-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {(Object.keys(REPORT_TYPE_LABELS) as ReportType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {REPORT_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="f-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {(Object.keys(REPORT_STATUS_LABELS) as ReportStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {REPORT_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="f-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Section>

        <Section
          title={`${filtered.length} report${filtered.length === 1 ? "" : "s"}`}
          description="Related reports are flagged so the same problem is not counted twice."
        >
          {filtered.length === 0 ? (
            <EmptyState
              title="No reports match these filters"
              description="Clear a filter to see more reports, or submit a new one."
              action={
                <div className="mt-2">
                  <ReportProblemDialog size="default" />
                </div>
              }
            />
          ) : (
            <>
              {/* Card list on small screens */}
              <ul className="grid gap-3 md:hidden">
                {filtered.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-lg border border-border bg-card p-4 shadow-panel"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold">{REPORT_TYPE_LABELS[r.report_type]}</p>
                      <span className="font-mono text-[11px] text-muted-foreground">{r.id}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {r.location_text ?? r.block} ·{" "}
                      {new Date(r.created_at).toLocaleDateString("en-IN")}
                    </p>
                    <p className="mt-2 text-xs">{r.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <StatusPill tone={STATUS_TONE[r.status]}>
                        {REPORT_STATUS_LABELS[r.status]}
                      </StatusPill>
                      <StatusPill tone={PRIORITY_TONE[r.priority]}>
                        Priority: {r.priority}
                      </StatusPill>
                      {related[r.id] ? (
                        <StatusPill tone="warning">Potential duplicate / related</StatusPill>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>

              {/* Table on larger screens */}
              <div className="hidden overflow-x-auto rounded-lg border border-border bg-card shadow-panel md:block">
                <table className="w-full min-w-[860px] text-sm">
                  <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Report ID</th>
                      <th className="px-3 py-2 font-semibold">Type</th>
                      <th className="px-3 py-2 font-semibold">Location</th>
                      <th className="px-3 py-2 font-semibold">Date</th>
                      <th className="px-3 py-2 font-semibold">Status</th>
                      <th className="px-3 py-2 font-semibold">Priority</th>
                      <th className="px-3 py-2 font-semibold">Flags</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((r) => (
                      <tr key={r.id} className="align-top">
                        <td className="px-3 py-2.5 font-mono text-xs">{r.id}</td>
                        <td className="px-3 py-2.5">
                          <p className="font-medium">{REPORT_TYPE_LABELS[r.report_type]}</p>
                          <p className="max-w-xs text-xs text-muted-foreground">{r.description}</p>
                        </td>
                        <td className="px-3 py-2.5 text-xs">
                          {r.location_text ?? `${r.block} block`}
                          {r.location_text ? (
                            <span className="block text-muted-foreground">{r.block} block</span>
                          ) : null}
                        </td>
                        <td className="px-3 py-2.5 text-xs tabular-nums">
                          {new Date(r.created_at).toLocaleDateString("en-IN")}
                        </td>
                        <td className="px-3 py-2.5">
                          <StatusPill tone={STATUS_TONE[r.status]}>
                            {REPORT_STATUS_LABELS[r.status]}
                          </StatusPill>
                        </td>
                        <td className="px-3 py-2.5">
                          <StatusPill tone={PRIORITY_TONE[r.priority]}>{r.priority}</StatusPill>
                        </td>
                        <td className="px-3 py-2.5 text-xs">
                          {related[r.id] ? (
                            <span className="font-medium text-warning-foreground">
                              Potential duplicate / related: {related[r.id]!.join(", ")}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Section>

        <Section
          title="Duplicate detection rule"
          description="Deliberately simple for the prototype — plain distance and time comparison, no GIS stack."
        >
          <div className="rounded-lg border border-border bg-card p-4 font-mono text-[11px] leading-relaxed text-muted-foreground shadow-panel">
            same report_type AND straight-line distance ≤ {DUPLICATE_RULE.radiusMeters} m AND |Δt| ≤{" "}
            {DUPLICATE_RULE.windowDays} days → flag as “Potential duplicate / related reports”
          </div>
        </Section>
      </div>
    </AppShell>
  );
}
