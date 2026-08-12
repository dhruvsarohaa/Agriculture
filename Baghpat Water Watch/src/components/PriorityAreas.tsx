import { ClipboardCheck, TriangleAlert } from "lucide-react";
import { RiskBadge, StatusPill } from "./RiskBadge";
import { EmptyState } from "./EmptyState";
import type { BlockPriority } from "@/services/data-service";

const INFRA_LABEL: Record<BlockPriority["infrastructureStatus"], string> = {
  functional: "Functional",
  partial: "Partially functional",
  reported_issue: "Issue recorded",
  unknown: "Unknown",
};

export function PriorityAreas({ items, limit }: { items: BlockPriority[]; limit?: number }) {
  const shown = limit ? items.slice(0, limit) : items;
  if (shown.length === 0) {
    return <EmptyState description="No blocks available to rank from the current dataset." />;
  }
  return (
    <ol className="grid gap-3 md:grid-cols-2">
      {shown.map((item, i) => (
        <li key={item.block} className="rounded-lg border border-border bg-card p-4 shadow-panel">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                Priority {i + 1}
              </p>
              <h3 className="font-display text-lg font-semibold">{item.block}</h3>
            </div>
            <div className="text-right">
              <p className="font-mono text-lg font-semibold tabular-nums">{item.score}</p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Prototype score
              </p>
            </div>
          </div>

          <dl className="mt-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">Groundwater decline</dt>
              <dd>
                <RiskBadge level={item.groundwaterRisk} />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">Water-quality risk</dt>
              <dd>
                <RiskBadge level={item.qualityRisk} />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">Active community reports</dt>
              <dd className="font-semibold tabular-nums">{item.activeReportCount}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">Mean change</dt>
              <dd className="font-semibold tabular-nums">
                {item.meanChangePerYear === null
                  ? "Insufficient data"
                  : `${item.meanChangePerYear > 0 ? "+" : ""}${item.meanChangePerYear} m/yr deeper`}
              </dd>
            </div>
          </dl>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <StatusPill tone="neutral">
              Recorded infrastructure: {INFRA_LABEL[item.infrastructureStatus]}
            </StatusPill>
            {item.inconsistencyFlag ? (
              <StatusPill tone="warning">
                <TriangleAlert className="size-3" aria-hidden /> Flagged for verification
              </StatusPill>
            ) : (
              <StatusPill tone="info">
                <ClipboardCheck className="size-3" aria-hidden /> No inconsistency flag
              </StatusPill>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function ConsistencyAlerts({ items }: { items: BlockPriority[] }) {
  const flagged = items.filter((i) => i.inconsistencyFlag);
  if (flagged.length === 0) {
    return (
      <EmptyState
        title="No inconsistency flags"
        description="No block currently combines high predicted decline, a recorded functional status and repeated dry-well reports."
      />
    );
  }
  return (
    <div className="space-y-3">
      {flagged.map((item) => (
        <div
          key={item.block}
          className="rounded-lg border border-warning/50 bg-warning-soft p-4 text-warning-foreground shadow-panel"
        >
          <div className="flex items-center gap-2">
            <TriangleAlert className="size-4" aria-hidden />
            <h3 className="text-sm font-semibold">Potential data inconsistency — {item.block}</h3>
          </div>
          <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
            <div>
              <dt className="text-warning-foreground/70">Prototype groundwater decline</dt>
              <dd className="font-semibold uppercase">{item.groundwaterRisk}</dd>
            </div>
            <div>
              <dt className="text-warning-foreground/70">Recorded infrastructure status</dt>
              <dd className="font-semibold uppercase">{INFRA_LABEL[item.infrastructureStatus]}</dd>
            </div>
            <div>
              <dt className="text-warning-foreground/70">Nearby community reports</dt>
              <dd className="font-semibold">{item.dryWellReports} dry well / hand pump reports</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs font-medium">
            Recommendation: field verification recommended. This is a decision-support flag only —
            it is not an allegation of misreporting or fraud by any person or office.
          </p>
        </div>
      ))}
    </div>
  );
}
