import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TrendDirection } from "@/data/types";

export function KpiCard({
  label,
  value,
  unitNote,
  footer,
  badge,
  icon,
  emphasis = false,
  className,
}: {
  label: string;
  value: React.ReactNode;
  unitNote?: string;
  footer?: React.ReactNode;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  emphasis?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-panel",
        emphasis ? "border-primary/30 ring-1 ring-primary/10" : "border-border",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <span className="text-muted-foreground/70" aria-hidden>
          {icon}
        </span>
      </div>
      <p className="stat-figure text-foreground">{value}</p>
      {unitNote ? <p className="text-xs text-muted-foreground">{unitNote}</p> : null}
      {badge}
      {footer ? <div className="mt-auto pt-1 text-xs text-muted-foreground">{footer}</div> : null}
    </div>
  );
}

export function TrendIndicator({
  direction,
  detail,
  className,
}: {
  direction: TrendDirection;
  detail?: string;
  className?: string;
}) {
  const map = {
    declining: {
      Icon: ArrowDown,
      label: "Declining",
      tone: "text-critical",
      help: "Water table getting deeper",
    },
    rising: {
      Icon: ArrowUp,
      label: "Recovering",
      tone: "text-safe",
      help: "Water table getting shallower",
    },
    stable: {
      Icon: ArrowRight,
      label: "Stable",
      tone: "text-muted-foreground",
      help: "Little change",
    },
    unknown: {
      Icon: ArrowRight,
      label: "Unknown",
      tone: "text-muted-foreground",
      help: "Insufficient data",
    },
  } as const;
  const { Icon, label, tone, help } = map[direction];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", tone, className)}>
      <Icon className="size-3.5" aria-hidden />
      {label}
      <span className="font-normal text-muted-foreground">· {detail ?? help}</span>
    </span>
  );
}
