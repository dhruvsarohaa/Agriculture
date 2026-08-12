import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Brain, Layers, LineChart as LineChartIcon } from "lucide-react";
import { AppShell, PageHeader, Section } from "@/components/AppShell";
import { GroundwaterChart } from "@/components/GroundwaterChart";
import { EmptyState } from "@/components/EmptyState";
import { KpiCard, TrendIndicator } from "@/components/KpiCard";
import { DataProvenance, PrototypeNotice } from "@/components/PrototypeNotice";
import { RiskBadge, StatusPill } from "@/components/RiskBadge";
import { RiskMethodology } from "@/components/RiskMethodology";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BLOCKS,
  DISTRICT,
  GROUNDWATER_OBSERVATIONS,
  OBSERVATION_DATES,
  STATIONS,
  RAINFALL_CONTEXT,
} from "@/data/demo-dataset";
import { CONFIDENCE_LABELS } from "@/data/types";
import { computeGroundwaterTrend } from "@/lib/risk";
import {
  filterObservations,
  predictionsSync,
  type GroundwaterFilters,
} from "@/services/data-service";

export const Route = createFileRoute("/groundwater")({
  head: () => ({
    meta: [
      { title: "Groundwater Monitoring & Forecast — Baghpat Prototype" },
      {
        name: "description",
        content:
          "Filter illustrative groundwater level observations by block, station, season and date range, and review a transparent prototype forecast for Baghpat district.",
      },
      { property: "og:title", content: "Groundwater Monitoring & Forecast — Baghpat Prototype" },
      {
        property: "og:description",
        content:
          "Groundwater depth trends, prototype forecast, model architecture plan and illustrative feature influence for Baghpat district.",
      },
    ],
  }),
  component: GroundwaterPage,
});

const SEASONS = [
  { value: "all", label: "All seasons" },
  { value: "winter", label: "Winter (Dec–Feb)" },
  { value: "pre_monsoon", label: "Pre-monsoon (Mar–Jun)" },
  { value: "monsoon", label: "Monsoon (Jul–Sep)" },
  { value: "post_monsoon", label: "Post-monsoon (Oct–Nov)" },
] as const;

type Season = NonNullable<GroundwaterFilters["season"]>;

function GroundwaterPage() {
  const [block, setBlock] = useState<string>("all");
  const [stationId, setStationId] = useState<string>("BGP-OW-03");
  const [season, setSeason] = useState<Season>("all");
  const [from, setFrom] = useState("2023-01-01");
  const [to, setTo] = useState("2025-12-31");

  const stationOptions = useMemo(
    () => STATIONS.filter((s) => block === "all" || s.block === block),
    [block],
  );

  const filters = useMemo<GroundwaterFilters>(
    () => ({
      district: DISTRICT,
      block,
      stationId: stationOptions.some((s) => s.station_id === stationId) ? stationId : "all",
      season,
      from,
      to,
    }),
    [block, from, season, stationId, stationOptions, to],
  );

  const rows = useMemo(() => filterObservations(GROUNDWATER_OBSERVATIONS, filters), [filters]);

  const activeStation = STATIONS.find((s) => s.station_id === filters.stationId);
  const trend = useMemo(() => computeGroundwaterTrend(rows), [rows]);
  const prediction = useMemo(
    () => predictionsSync().find((p) => p.station_id === activeStation?.station_id),
    [activeStation?.station_id],
  );

  const chartData = useMemo(() => {
    const dates = OBSERVATION_DATES.filter((d) => rows.some((r) => r.date === d));
    return dates.map((date) => {
      const matching = rows.filter((r) => r.date === date && r.groundwater_level_m !== null);
      const rainfall = RAINFALL_CONTEXT[date] ?? null;
      return {
        date,
        level:
          matching.length === 0
            ? null
            : Math.round(
                (matching.reduce((a, b) => a + (b.groundwater_level_m as number), 0) /
                  matching.length) *
                  10,
              ) / 10,
        rainfall,
      };
    });
  }, [rows]);

  const seriesLabel = activeStation ? activeStation.name : "Mean of selected stations";

  return (
    <AppShell>
      <PageHeader
        title="Groundwater monitoring & prediction"
        subtitle="Depth to water table (metres below ground level) with a transparent prototype forecast."
      />

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-7 sm:px-6">
        <PrototypeNotice />

        <Section title="Filters" description="Default selection is Baghpat district.">
          <div className="grid gap-3 rounded-lg border border-border bg-card p-4 shadow-panel sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <div className="space-y-1.5">
              <Label htmlFor="district">District</Label>
              <Select value={DISTRICT} disabled>
                <SelectTrigger id="district">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DISTRICT}>{DISTRICT}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="block-filter">Block</Label>
              <Select
                value={block}
                onValueChange={(v) => {
                  setBlock(v);
                  setStationId("all");
                }}
              >
                <SelectTrigger id="block-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All blocks</SelectItem>
                  {BLOCKS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="station-filter">Monitoring station</Label>
              <Select value={filters.stationId as string} onValueChange={setStationId}>
                <SelectTrigger id="station-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All stations</SelectItem>
                  {stationOptions.map((s) => (
                    <SelectItem key={s.station_id} value={s.station_id}>
                      {s.station_id} · {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="season-filter">Season</Label>
              <Select value={season} onValueChange={(v) => setSeason(v as Season)}>
                <SelectTrigger id="season-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEASONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="from">From</Label>
              <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="to">To</Label>
              <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
        </Section>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Latest observed depth"
            value={trend.latest === null ? "Insufficient data" : `${trend.latest} m`}
            unitNote={trend.latestDate ? `Observed ${trend.latestDate}` : "No dated observation"}
            badge={
              <TrendIndicator
                direction={trend.direction}
                detail={
                  trend.changePerYear === null ? "Insufficient data" : `${trend.changePerYear} m/yr`
                }
              />
            }
            emphasis
          />
          <KpiCard
            label="Total change in window"
            value={
              trend.totalChange === null
                ? "Insufficient data"
                : `${trend.totalChange > 0 ? "+" : ""}${trend.totalChange} m`
            }
            unitNote="Positive = water table deeper than at start"
          />
          <KpiCard
            label="Groundwater risk (rule-based)"
            value={<RiskBadge level={trend.risk} size="lg" />}
            unitNote="From the documented decline-rate rule"
          />
          <KpiCard
            label="Valid observations"
            value={`${trend.observationCount}`}
            unitNote={`Data confidence: ${CONFIDENCE_LABELS[trend.confidence]}`}
            footer="Missing quarters are left blank, never back-filled."
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Section
            title="Groundwater trend"
            description={`Illustrative prototype observations — ${seriesLabel}.`}
            className="lg:col-span-2"
            aside={
              <StatusPill tone="info">
                <LineChartIcon className="size-3" aria-hidden /> Quarterly demo series
              </StatusPill>
            }
          >
            <div className="rounded-lg border border-border bg-card p-4 shadow-panel">
              <GroundwaterChart
                data={chartData}
                seriesKeys={[{ key: "level", label: `${seriesLabel} (m bgl)` }]}
                forecastPoint={
                  prediction?.predicted_groundwater_level !== null &&
                  prediction?.predicted_groundwater_level !== undefined &&
                  filters.stationId !== "all"
                    ? {
                        date: prediction.forecast_date,
                        value: prediction.predicted_groundwater_level,
                      }
                    : null
                }
              />
              <DataProvenance className="mt-2" confidence={CONFIDENCE_LABELS[trend.confidence]} />
            </div>
          </Section>

          <Section
            title="Groundwater forecast"
            description="Demo prediction — model integration pending."
          >
            <div className="space-y-3 rounded-lg border border-primary/30 bg-card p-4 shadow-panel ring-1 ring-primary/10">
              {prediction && filters.stationId !== "all" ? (
                <>
                  <dl className="space-y-2.5 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-muted-foreground">Current observed level</dt>
                      <dd className="font-semibold tabular-nums">
                        {trend.latest === null ? "Insufficient data" : `${trend.latest} m`}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-muted-foreground">
                        Predicted level ({prediction.forecast_date})
                      </dt>
                      <dd className="font-semibold tabular-nums">
                        {prediction.predicted_groundwater_level === null
                          ? "Insufficient data"
                          : `${prediction.predicted_groundwater_level} m`}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-muted-foreground">Predicted trend</dt>
                      <dd className="font-semibold capitalize">{trend.direction}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-muted-foreground">Risk</dt>
                      <dd>
                        <RiskBadge level={prediction.risk_level} />
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-muted-foreground">Confidence</dt>
                      <dd className="text-xs font-semibold">
                        {CONFIDENCE_LABELS[prediction.confidence]}
                      </dd>
                    </div>
                  </dl>
                  <StatusPill tone="warning">
                    Demo prediction — model integration pending
                  </StatusPill>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {prediction.model_name} v{prediction.model_version} · source {prediction.source}
                  </p>
                </>
              ) : (
                <EmptyState
                  title="No prediction available"
                  description="Select a single monitoring station to see its prototype forecast."
                />
              )}
            </div>
          </Section>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Section
            title="AI model architecture (planned)"
            description="Placeholder describing the intended pipeline. No model is trained or deployed yet."
          >
            <div className="rounded-lg border border-border bg-card p-4 shadow-panel">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Brain className="size-4 text-primary" aria-hidden /> Intended pipeline
              </div>
              <pre className="mt-3 overflow-x-auto rounded-md bg-secondary p-3 font-mono text-[11px] leading-relaxed text-foreground">
                {`Historical groundwater
        +
Rainfall
        +
Temperature
        +
Other available features
        ↓
Machine Learning Model
        ↓
Groundwater Forecast
        ↓
Risk Classification`}
              </pre>
              <p className="mt-3 text-xs text-muted-foreground">
                The final model will be selected experimentally by comparing candidates on held-out
                periods. Candidates under consideration:
              </p>
              <ul className="mt-2 grid gap-1.5 text-xs sm:grid-cols-2">
                {["Seasonal / persistence baseline", "Random Forest", "XGBoost", "LSTM"].map(
                  (m) => (
                    <li
                      key={m}
                      className="flex items-center gap-2 rounded border border-border bg-secondary/60 px-2 py-1.5"
                    >
                      <Layers className="size-3 text-primary" aria-hidden /> {m}
                    </li>
                  ),
                )}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                No architecture is committed in advance — deep sequence models will only be pursued
                if data exploration and baseline comparison justify them.
              </p>
            </div>
          </Section>

          <Section
            title="Why is groundwater risk increasing?"
            description="Illustrative feature importance — not generated from a validated model."
          >
            <div className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-panel">
              {[
                { label: "Historical groundwater decline", weight: 0.55, influence: "High" },
                { label: "Recent rainfall", weight: 0.25, influence: "Moderate" },
                { label: "Seasonal pattern", weight: 0.2, influence: "Moderate" },
              ].map((f) => (
                <div key={f.label} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-medium">{f.label}</span>
                    <span className="text-muted-foreground">{f.influence} influence</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${f.weight * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                This component is structured to accept SHAP values from a real model later: each
                entry is a feature name plus a signed contribution.
              </p>
              <PrototypeNotice>
                Illustrative feature importance — not generated from a validated model.
              </PrototypeNotice>
            </div>
          </Section>
        </div>

        <RiskMethodology />
      </div>
    </AppShell>
  );
}
