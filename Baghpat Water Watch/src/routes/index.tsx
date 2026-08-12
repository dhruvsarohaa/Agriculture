import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Activity,
  Droplets,
  FlaskConical,
  Gauge,
  MapPinned,
  MessageSquareWarning,
  Radio,
} from "lucide-react";
import { AppShell, PageHeader, Section } from "@/components/AppShell";
import { KpiCard, TrendIndicator } from "@/components/KpiCard";
import { PrototypeNotice, DataProvenance } from "@/components/PrototypeNotice";
import { RiskBadge, StatusPill } from "@/components/RiskBadge";
import { GroundwaterChart } from "@/components/GroundwaterChart";
import { PriorityAreas, ConsistencyAlerts } from "@/components/PriorityAreas";
import { RiskMethodology } from "@/components/RiskMethodology";
import { ReportProblemDialog } from "@/components/ReportProblemDialog";
import { Button } from "@/components/ui/button";
import { GROUNDWATER_OBSERVATIONS, OBSERVATION_DATES, STATE } from "@/data/demo-dataset";
import { REPORT_TYPE_LABELS } from "@/data/types";
import {
  assessStations,
  computeBlockPriorities,
  computeDistrictSummary,
} from "@/services/data-service";
import { useCommunityReports } from "@/services/reports-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Baghpat District Groundwater Intelligence Dashboard" },
      {
        name: "description",
        content:
          "Prototype district-level dashboard for Baghpat groundwater levels, water quality, risk classification and community water reports. Demo data only.",
      },
      { property: "og:title", content: "Baghpat District Groundwater Intelligence Dashboard" },
      {
        property: "og:description",
        content:
          "Observe, predict, assess risk, report and prioritise action on district groundwater — research prototype using clearly labelled demo data.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const reports = useCommunityReports();
  const summary = useMemo(() => computeDistrictSummary(reports), [reports]);
  const priorities = useMemo(() => computeBlockPriorities(reports), [reports]);
  const assessments = useMemo(() => assessStations(), []);

  const districtSeries = useMemo(
    () =>
      OBSERVATION_DATES.map((date) => {
        const values = GROUNDWATER_OBSERVATIONS.filter(
          (o) => o.date === date && o.groundwater_level_m !== null,
        ).map((o) => o.groundwater_level_m as number);
        return {
          date,
          district:
            values.length === 0
              ? null
              : Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10,
        };
      }),
    [],
  );

  const elevatedParams = useMemo(() => {
    const map = new Map<string, number>();
    assessments.forEach((a) =>
      a.qualityAssessments.forEach((p) => {
        if (p.risk !== "low" && p.risk !== "insufficient") {
          map.set(p.spec.label, (map.get(p.spec.label) ?? 0) + 1);
        }
      }),
    );
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [assessments]);

  const recentReports = reports.slice(0, 5);
  const forecastMean = useMemo(() => {
    const values = assessments
      .map((a) => a.prediction?.predicted_groundwater_level)
      .filter((v): v is number => typeof v === "number");
    return values.length
      ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
      : null;
  }, [assessments]);

  return (
    <AppShell>
      <PageHeader
        title={`${summary.district} District — Groundwater Intelligence`}
        subtitle="AI-assisted groundwater monitoring and risk assessment · Observe → Predict → Assess risk → Report → Prioritise action"
      >
        <ReportProblemDialog />
        <Button variant="outline" size="lg" asChild>
          <Link to="/risk-map">Open risk map</Link>
        </Button>
      </PageHeader>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-7 sm:px-6">
        <PrototypeNotice tone="warning">
          <strong className="font-semibold">Prototype demonstration</strong> using simulated/sample
          records for {summary.district}, {STATE}. Predictions and risk classifications are not
          official government assessments, and this prototype has no live CGWB / India-WRIS / WIMS
          connection.
        </PrototypeNotice>

        <Section
          title="District at a glance"
          description="Five signals answering: what is happening to groundwater, where is risk highest, what quality parameters are concerning, what is predicted, and what are people reporting."
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <KpiCard
              label="Groundwater status"
              icon={<Droplets className="size-4" />}
              value={
                summary.meanLatestLevel === null
                  ? "Insufficient data"
                  : `${summary.meanLatestLevel} m`
              }
              unitNote="Mean depth below ground level across stations"
              badge={
                <TrendIndicator
                  direction={summary.trendDirection}
                  detail={
                    summary.meanChangePerYear === null
                      ? "Insufficient data"
                      : `${summary.meanChangePerYear} m/yr`
                  }
                />
              }
              footer={
                summary.latestObservationDate
                  ? `Latest observation ${summary.latestObservationDate}`
                  : "No observation date available"
              }
              emphasis
            />
            <KpiCard
              label="Groundwater risk"
              icon={<Gauge className="size-4" />}
              value={<RiskBadge level={summary.groundwaterRisk} size="lg" />}
              unitNote="Worst station-level rule outcome in the district"
              footer="Rule-based prototype classification"
            />
            <KpiCard
              label="Water quality"
              icon={<FlaskConical className="size-4" />}
              value={`${summary.elevatedParameterCount} parameters`}
              unitNote="Elevated above reference thresholds somewhere in the district"
              footer={`${summary.totalParametersMeasured} parameter readings available`}
            />
            <KpiCard
              label="Community reports"
              icon={<MessageSquareWarning className="size-4" />}
              value={`${summary.activeReports} active`}
              unitNote={`${summary.totalReports} reports in total`}
              footer={
                <Link to="/reports" className="font-medium text-primary hover:underline">
                  Open reports dashboard
                </Link>
              }
            />
            <KpiCard
              label="Monitoring stations"
              icon={<Radio className="size-4" />}
              value={`${summary.stationCount} stations`}
              unitNote={`${summary.stationsWithGaps} with incomplete records`}
              footer="Demo observation wells & piezometers"
            />
          </div>
          <DataProvenance confidence="Medium (demo dataset with deliberate gaps)" />
        </Section>

        <div className="grid gap-6 lg:grid-cols-3">
          <Section
            title="District groundwater trend"
            description="District mean depth to water table. Illustrative prototype observations — not actual measurements."
            className="lg:col-span-2"
          >
            <div className="rounded-lg border border-border bg-card p-4 shadow-panel">
              <GroundwaterChart
                data={districtSeries}
                seriesKeys={[{ key: "district", label: "District mean depth" }]}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Y-axis is inverted: lower on the chart means the water table is deeper below ground.
              </p>
            </div>
          </Section>

          <Section
            title="Forecast snapshot"
            description="Demo prediction — model integration pending."
          >
            <div className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-panel">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  District mean, next period (Jan 2026)
                </p>
                <p className="stat-figure mt-1">
                  {forecastMean === null ? "Insufficient data" : `${forecastMean} m`}
                </p>
              </div>
              <StatusPill tone="warning">Demo prediction — model integration pending</StatusPill>
              <p className="text-xs text-muted-foreground">
                Produced by a transparent trend-persistence placeholder, not a trained model. The
                final model will be chosen experimentally.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/groundwater">See station forecasts & model plan</Link>
              </Button>
            </div>
          </Section>
        </div>

        <Section
          title="Priority areas requiring attention"
          description="Prototype prioritisation score — this is not an official government classification."
          aside={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/risk-map">View on map</Link>
            </Button>
          }
        >
          <PriorityAreas items={priorities} limit={4} />
        </Section>

        <div className="grid gap-6 lg:grid-cols-2">
          <Section
            title="Elevated water-quality parameters"
            description="Observed exceedances of reference thresholds in the demo dataset."
          >
            <div className="rounded-lg border border-border bg-card p-4 shadow-panel">
              {elevatedParams.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No parameter exceeds its reference threshold in the available records.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {elevatedParams.map(([label, count]) => (
                    <li
                      key={label}
                      className="flex items-center justify-between gap-2 py-2 text-sm"
                    >
                      <span className="font-medium">{label}</span>
                      <span className="text-xs text-muted-foreground">
                        {count} station{count > 1 ? "s" : ""} above reference threshold
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link to="/water-quality">Open water quality</Link>
              </Button>
            </div>
          </Section>

          <Section
            title="Latest community reports"
            description="Submitted by citizens and field staff."
          >
            <div className="rounded-lg border border-border bg-card p-2 shadow-panel">
              <ul className="divide-y divide-border">
                {recentReports.map((r) => (
                  <li key={r.id} className="flex items-start justify-between gap-3 p-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {REPORT_TYPE_LABELS[r.report_type]}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {r.block} · {new Date(r.created_at).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <span className="font-mono text-[11px] text-muted-foreground">{r.id}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Section>
        </div>

        <Section
          title="Potential data inconsistency"
          description="Flagged where prototype decline risk, recorded infrastructure status and community reports do not agree."
        >
          <ConsistencyAlerts items={priorities} />
        </Section>

        <Section title="Methodology">
          <RiskMethodology />
        </Section>

        <Section title="Explore the workflow">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { to: "/groundwater", label: "Groundwater & forecast", icon: Activity },
              {
                to: "/water-quality",
                label: "Water quality & contamination risk",
                icon: FlaskConical,
              },
              { to: "/reports", label: "Community reports", icon: MessageSquareWarning },
              { to: "/risk-map", label: "Combined risk map", icon: MapPinned },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 text-sm font-medium shadow-panel transition-colors hover:border-primary/40 hover:bg-secondary"
              >
                <item.icon className="size-4 text-primary" aria-hidden />
                {item.label}
              </Link>
            ))}
          </div>
        </Section>
      </div>
    </AppShell>
  );
}
