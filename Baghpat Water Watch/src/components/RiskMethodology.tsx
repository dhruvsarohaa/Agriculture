import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GROUNDWATER_RULES, QUALITY_RULES } from "@/lib/risk";
import { RiskBadge } from "./RiskBadge";
import { DUPLICATE_RULE } from "@/lib/risk";

export function RiskMethodology({ defaultOpen = false }: { defaultOpen?: boolean }) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpen ? "how" : ""}
      className="rounded-lg border border-border bg-card px-4 shadow-panel"
    >
      <AccordionItem value="how" className="border-none">
        <AccordionTrigger className="text-sm font-semibold">
          How risk is calculated
        </AccordionTrigger>
        <AccordionContent className="space-y-5 pb-5 text-sm">
          <p className="text-xs text-muted-foreground sm:text-sm">
            Nothing here is machine learning. Every classification below comes from a fixed,
            inspectable rule applied to the demo records, so the logic can be reviewed and replaced
            once real data and a trained model are connected.
          </p>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Groundwater decline risk
            </h3>
            <ul className="mt-2 space-y-1.5">
              {GROUNDWATER_RULES.map((r) => (
                <li key={r.label} className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm">{r.label}</span>
                  <RiskBadge level={r.result} />
                </li>
              ))}
            </ul>
            <p className="mt-2 font-mono text-[11px] text-muted-foreground">
              rate = (last valid depth − first valid depth) ÷ years covered
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Water-quality risk
            </h3>
            <ul className="mt-2 space-y-1.5">
              {QUALITY_RULES.map((r) => (
                <li key={r.label} className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm">{r.label}</span>
                  <RiskBadge level={r.result} />
                </li>
              ))}
            </ul>
            <p className="mt-2 font-mono text-[11px] text-muted-foreground">
              ratio = measured value ÷ reference threshold
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Priority score (per block)
            </h3>
            <p className="mt-2 font-mono text-[11px] text-muted-foreground">
              score = 3 × groundwater risk points + 3 × water-quality risk points + min(active
              reports, 10) &nbsp;|&nbsp; points: low 1, moderate 2, high 3, critical 4, insufficient
              0
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Related-report rule
            </h3>
            <p className="mt-2 text-xs text-muted-foreground">
              Two reports are flagged as potential duplicates when they share the same problem type
              and fall within ~{DUPLICATE_RULE.radiusMeters} m and ~{DUPLICATE_RULE.windowDays} days
              of each other (straight-line distance).
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
