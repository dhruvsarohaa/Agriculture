import { cn } from "@/lib/utils";
import { RISK_LABELS, type RiskLevel } from "@/data/types";

const RISK_CLASS: Record<RiskLevel, string> = {
  low: "border-safe/40 bg-safe-soft text-safe",
  moderate: "border-warning/50 bg-warning-soft text-warning-foreground",
  high: "border-critical/40 bg-critical-soft text-critical",
  critical: "border-severe/50 bg-severe text-severe-foreground",
  insufficient: "border-unknown/40 bg-unknown-soft text-muted-foreground",
};

const DOT_CLASS: Record<RiskLevel, string> = {
  low: "bg-safe",
  moderate: "bg-warning",
  high: "bg-critical",
  critical: "bg-severe",
  insufficient: "bg-unknown",
};

export function RiskBadge({
  level,
  className,
  size = "sm",
  prefix,
}: {
  level: RiskLevel;
  className?: string;
  size?: "sm" | "lg";
  prefix?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase tracking-wide",
        size === "lg" ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[11px]",
        RISK_CLASS[level],
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", DOT_CLASS[level])} aria-hidden />
      {prefix ? `${prefix}: ` : ""}
      {RISK_LABELS[level]}
    </span>
  );
}

export function riskDotClass(level: RiskLevel) {
  return DOT_CLASS[level];
}

export function StatusPill({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "safe" | "warning" | "critical" | "info";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "border-border bg-muted text-muted-foreground",
    safe: "border-safe/40 bg-safe-soft text-safe",
    warning: "border-warning/50 bg-warning-soft text-warning-foreground",
    critical: "border-critical/40 bg-critical-soft text-critical",
    info: "border-primary/30 bg-primary/10 text-primary",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
