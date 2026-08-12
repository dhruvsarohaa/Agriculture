import { DatabaseZap } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title = "Insufficient data",
  description,
  icon,
  className,
  action,
}: {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/40 px-4 py-10 text-center",
        className,
      )}
    >
      <span className="text-muted-foreground" aria-hidden>
        {icon ?? <DatabaseZap className="size-5" />}
      </span>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description ? <p className="max-w-sm text-xs text-muted-foreground">{description}</p> : null}
      {action}
    </div>
  );
}
