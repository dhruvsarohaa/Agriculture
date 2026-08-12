import { Info, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export function PrototypeNotice({
  className,
  children,
  tone = "info",
}: {
  className?: string;
  children?: React.ReactNode;
  tone?: "info" | "warning";
}) {
  const Icon = tone === "warning" ? ShieldAlert : Info;
  return (
    <div
      role="note"
      className={cn(
        "flex gap-3 rounded-md border px-3 py-2.5 text-xs leading-relaxed sm:text-[13px]",
        tone === "warning"
          ? "border-warning/40 bg-warning-soft text-warning-foreground"
          : "border-primary/20 bg-primary/5 text-foreground/80",
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0 opacity-80" aria-hidden />
      <p>
        {children ?? (
          <>
            <strong className="font-semibold">Prototype data</strong> — intended to be replaced with
            verified CGWB / India-WRIS / NWDP records. Predictions and risk classifications are not
            official government assessments.
          </>
        )}
      </p>
    </div>
  );
}

export function DataProvenance({
  confidence,
  source = "DEMO_DATA",
  className,
}: {
  confidence: string;
  source?: string;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-mono text-[11px] uppercase tracking-wide text-muted-foreground",
        className,
      )}
    >
      Data confidence: {confidence} · Source: {source}
    </p>
  );
}
