import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FlaskConical } from "lucide-react";
import { AppShell, PageHeader, Section } from "@/components/AppShell";
import { DistrictMap, MapLegend, type MapMarker } from "@/components/DistrictMap";
import { EmptyState } from "@/components/EmptyState";
import { DataProvenance, PrototypeNotice } from "@/components/PrototypeNotice";
import { RiskBadge, StatusPill } from "@/components/RiskBadge";
import { RiskMethodology } from "@/components/RiskMethodology";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BLOCKS, STATIONS, WATER_QUALITY_RECORDS } from "@/data/demo-dataset";
import { CONFIDENCE_LABELS, QUALITY_PARAMETERS, type RiskLevel } from "@/data/types";
import { assessParameter, assessRecord, worstRisk } from "@/lib/risk";
import { assessStations, latestQualityByStation } from "@/services/data-service";

export const Route = createFileRoute("/water-quality")({
  head: () => ({
    meta: [
      { title: "Water Quality & Contamination Risk — Baghpat Prototype" },
      {
        name: "description",
        content:
          "Prototype water-quality screening for Baghpat: nitrate, fluoride, arsenic, iron and EC against reference thresholds, with elevated-risk indicators and a demo sampling map.",
      },
      { property: "og:title", content: "Water Quality & Contamination Risk — Baghpat Prototype" },
      {
        property: "og:description",
        content:
          "Sample groundwater-quality parameters, reference thresholds, observed exceedances and a demo sampling-location map for Baghpat district.",
      },
    ],
  }),
  component: WaterQualityPage,
});

function WaterQualityPage() {
  const [block, setBlock] = useState<string>("all");
  const [stationId, setStationId] = useState<string>("BGP-OW-03");

  const stationOptions = useMemo(
    () => STATIONS.filter((s) => block === "all" || s.block === block),
    [block],
  );
  const effectiveStation = stationOptions.some((s) => s.station_id === stationId)
    ? stationId
    : stationOptions[0]?.station_id;

  const latest = useMemo(() => latestQualityByStation(), []);
  const record = effectiveStation ? latest[effectiveStation] : undefined;
  const assessments = useMemo(() => assessRecord(record), [record]);
  const station = STATIONS.find((s) => s.station_id === effectiveStation);

  const parameterRisks = useMemo(() => {
    return QUALITY_PARAMETERS.map((spec) => {
      const perStation = Object.values(latest)
        .filter((r) => block === "all" || r.block === block)
        .map((r) => assessParameter(spec, (r[spec.key] as number | null) ?? null).risk);
      return { spec, risk: worstRisk(perStation) as RiskLevel };
    });
  }, [latest, block]);

  const stationAssessments = useMemo(() => assessStations(), []);

  const markers: MapMarker[] = useMemo(
    () =>
      stationAssessments
        .filter((a) => block === "all" || a.station.block === block)
        .map((a) => ({
          id: a.station.station_id,
          latitude: a.station.latitude,
          longitude: a.station.longitude,
          label: `${a.station.station_id} — ${a.station.name}`,
          risk: a.qualityRisk,
          kind: "quality" as const,
          details: [
            { label: "Station ID", value: a.station.station_id },
            { label: "Block", value: a.station.block },
            { label: "Sample date", value: a.quality?.date ?? "Insufficient data" },
            {
              label: "Nitrate",
              value:
                a.quality?.nitrate_mg_l === null || a.quality === undefined
                  ? "Insufficient data"
                  : `${a.quality.nitrate_mg_l} mg/L`,
            },
            {
              label: "Fluoride",
              value:
                a.quality?.fluoride_mg_l === null || a.quality === undefined
                  ? "Insufficient data"
                  : `${a.quality.fluoride_mg_l} mg/L`,
            },
            {
              label: "Arsenic",
              value:
                a.quality?.arsenic_ug_l === null || a.quality === undefined
                  ? "Insufficient data"
                  : `${a.quality.arsenic_ug_l} µg/L`,
            },
            {
              label: "Iron",
              value:
                a.quality?.iron_mg_l === null || a.quality === undefined
                  ? "Insufficient data"
                  : `${a.quality.iron_mg_l} mg/L`,
            },
            {
              label: "EC",
              value:
                a.quality?.ec_us_cm === null || a.quality === undefined
                  ? "Insufficient data"
                  : `${a.quality.ec_us_cm} µS/cm`,
            },
            {
              label: "Risk status",
              value:
                a.qualityRisk === "insufficient" ? "Insufficient data" : `${a.qualityRisk} risk`,
            },
            { label: "Source", value: a.quality?.source ?? "—" },
          ],
        })),
    [stationAssessments, block],
  );

  const history = useMemo(
    () =>
      WATER_QUALITY_RECORDS.filter((r) => r.station_id === effectiveStation).sort((a, b) =>
        b.date.localeCompare(a.date),
      ),
    [effectiveStation],
  );

  return (
    <AppShell>
      <PageHeader
        title="Water quality & contamination risk"
        subtitle="Screening of sample groundwater-quality parameters against commonly cited reference thresholds."
      />

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-7 sm:px-6">
        <PrototypeNotice tone="warning">
          These are prototype/sample measurements, not laboratory results. Risk classification is a
          prototype analytical layer and does not replace laboratory water-quality testing.
        </PrototypeNotice>

        <Section title="Selection">
          <div className="grid gap-3 rounded-lg border border-border bg-card p-4 shadow-panel sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="wq-block">Block</Label>
              <Select value={block} onValueChange={setBlock}>
                <SelectTrigger id="wq-block">
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
              <Label htmlFor="wq-station">Sampling station</Label>
              <Select value={effectiveStation ?? ""} onValueChange={setStationId}>
                <SelectTrigger id="wq-station">
                  <SelectValue placeholder="Select station" />
                </SelectTrigger>
                <SelectContent>
                  {stationOptions.map((s) => (
                    <SelectItem key={s.station_id} value={s.station_id}>
                      {s.station_id} · {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Section>

        <Section
          title={`Parameters — ${station ? `${station.station_id}, ${station.block}` : "no station selected"}`}
          description="Every reading is compared with a reference threshold; missing readings stay missing."
          aside={
            record ? (
              <StatusPill tone="info">
                <FlaskConical className="size-3" aria-hidden /> Sampled {record.date}
              </StatusPill>
            ) : null
          }
        >
          {record ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {assessments.map((a) => (
                <div
                  key={a.spec.key}
                  className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 shadow-panel"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{a.spec.label}</p>
                      <p className="text-[11px] text-muted-foreground">{a.spec.unit}</p>
                    </div>
                    <RiskBadge level={a.risk} />
                  </div>
                  <p className="stat-figure">
                    {a.value === null ? (
                      <span className="text-base font-medium text-muted-foreground">
                        Insufficient data
                      </span>
                    ) : (
                      `${a.value} ${a.spec.unit}`
                    )}
                  </p>
                  <dl className="space-y-1 text-xs">
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">Reference threshold</dt>
                      <dd className="font-medium tabular-nums">
                        {a.spec.threshold} {a.spec.unit}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">Status</dt>
                      <dd className="font-medium">{a.statusLabel}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">Date</dt>
                      <dd className="font-medium">{record.date}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">Station</dt>
                      <dd className="font-medium">{record.station_id}</dd>
                    </div>
                  </dl>
                  <DataProvenance
                    confidence={CONFIDENCE_LABELS[record.data_confidence]}
                    source={record.source}
                  />
                  <p className="text-[11px] text-muted-foreground">{a.spec.referenceNote}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Insufficient water-quality data"
              description="No sample record is available for this station. Nothing is estimated in its place."
            />
          )}
        </Section>

        <Section
          title="Contamination risk"
          description={`Worst observed exceedance per parameter${block === "all" ? " across the district" : ` in ${block} block`}. Elevated risk indicates observed exceedance, not confirmed contamination.`}
        >
          <div className="rounded-lg border border-border bg-card shadow-panel">
            <ul className="divide-y divide-border">
              {parameterRisks.map((p) => (
                <li
                  key={p.spec.key}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{p.spec.label} risk</p>
                    <p className="text-[11px] text-muted-foreground">
                      Reference threshold {p.spec.threshold} {p.spec.unit}
                    </p>
                  </div>
                  <RiskBadge level={p.risk} size="lg" />
                </li>
              ))}
            </ul>
          </div>
          <PrototypeNotice tone="warning">
            Risk classification is a prototype analytical layer and does not replace laboratory
            water-quality testing. No statement here should be read as a declaration that water is
            contaminated.
          </PrototypeNotice>
        </Section>

        <Section
          title="Water-quality map"
          description="Demo sampling locations and monitoring stations. Click a marker for the full record."
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
            <DistrictMap markers={markers} className="aspect-[4/3] w-full" />
            <div className="rounded-lg border border-border bg-card p-4 shadow-panel">
              <MapLegend kinds={[{ kind: "quality", label: "Water-quality sampling station" }]} />
            </div>
          </div>
        </Section>

        <Section title="Sample history for this station">
          {history.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-panel">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Date</th>
                    <th className="px-3 py-2 font-semibold">Nitrate</th>
                    <th className="px-3 py-2 font-semibold">Fluoride</th>
                    <th className="px-3 py-2 font-semibold">Arsenic</th>
                    <th className="px-3 py-2 font-semibold">Iron</th>
                    <th className="px-3 py-2 font-semibold">EC</th>
                    <th className="px-3 py-2 font-semibold">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {history.map((r) => (
                    <tr key={r.id}>
                      <td className="px-3 py-2 font-medium">{r.date}</td>
                      <td className="px-3 py-2 tabular-nums">{r.nitrate_mg_l ?? "—"}</td>
                      <td className="px-3 py-2 tabular-nums">{r.fluoride_mg_l ?? "—"}</td>
                      <td className="px-3 py-2 tabular-nums">{r.arsenic_ug_l ?? "—"}</td>
                      <td className="px-3 py-2 tabular-nums">{r.iron_mg_l ?? "—"}</td>
                      <td className="px-3 py-2 tabular-nums">{r.ec_us_cm ?? "—"}</td>
                      <td className="px-3 py-2 text-xs">{CONFIDENCE_LABELS[r.data_confidence]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState description="No sample history available for this station." />
          )}
        </Section>

        <RiskMethodology />
      </div>
    </AppShell>
  );
}
