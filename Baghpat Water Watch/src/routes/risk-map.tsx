import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Layers } from "lucide-react";
import { AppShell, PageHeader, Section } from "@/components/AppShell";
import { DistrictMap, MapLegend, type MapMarker } from "@/components/DistrictMap";
import { PrototypeNotice } from "@/components/PrototypeNotice";
import { PriorityAreas, ConsistencyAlerts } from "@/components/PriorityAreas";
import { RiskBadge, StatusPill } from "@/components/RiskBadge";
import { RiskMethodology } from "@/components/RiskMethodology";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BLOCKS } from "@/data/demo-dataset";
import { REPORT_STATUS_LABELS, REPORT_TYPE_LABELS, RISK_LABELS } from "@/data/types";
import { assessStations, computeBlockPriorities } from "@/services/data-service";
import { useCommunityReports } from "@/services/reports-store";

export const Route = createFileRoute("/risk-map")({
  head: () => ({
    meta: [
      { title: "District Risk Map — Baghpat Groundwater Prototype" },
      {
        name: "description",
        content:
          "Combined prototype risk map for Baghpat: groundwater decline, water-quality exceedances and community reports on one demo district view with block prioritisation.",
      },
      { property: "og:title", content: "District Risk Map — Baghpat Groundwater Prototype" },
      {
        property: "og:description",
        content:
          "Overlay groundwater decline, quality exceedances and community reports to see which blocks need attention first.",
      },
    ],
  }),
  component: RiskMapPage,
});

function RiskMapPage() {
  const reports = useCommunityReports();
  const [block, setBlock] = useState("all");
  const [showDecline, setShowDecline] = useState(true);
  const [showQuality, setShowQuality] = useState(true);
  const [showReports, setShowReports] = useState(true);

  const assessments = useMemo(() => assessStations(), []);
  const priorities = useMemo(() => computeBlockPriorities(reports), [reports]);

  const markers = useMemo<MapMarker[]>(() => {
    const inBlock = (b: string) => block === "all" || b === block;
    const out: MapMarker[] = [];

    if (showDecline) {
      assessments
        .filter((a) => inBlock(a.station.block))
        .forEach((a) =>
          out.push({
            id: `gw-${a.station.station_id}`,
            latitude: a.station.latitude,
            longitude: a.station.longitude,
            label: `${a.station.station_id} — groundwater trend`,
            risk: a.trend.risk,
            kind: "decline",
            details: [
              { label: "Layer", value: "Groundwater decline" },
              { label: "Station", value: `${a.station.station_id} · ${a.station.name}` },
              { label: "Block", value: a.station.block },
              {
                label: "Latest depth",
                value:
                  a.trend.latest === null
                    ? "Insufficient data"
                    : `${a.trend.latest} m below ground level`,
              },
              {
                label: "Change per year",
                value:
                  a.trend.changePerYear === null
                    ? "Insufficient data"
                    : `${a.trend.changePerYear > 0 ? "+" : ""}${a.trend.changePerYear} m/yr`,
              },
              { label: "Risk", value: RISK_LABELS[a.trend.risk] },
            ],
          }),
        );
    }

    if (showQuality) {
      assessments
        .filter((a) => inBlock(a.station.block) && a.quality)
        .forEach((a) =>
          out.push({
            id: `wq-${a.station.station_id}`,
            latitude: a.station.latitude,
            longitude: a.station.longitude,
            label: `${a.station.station_id} — water quality`,
            risk: a.qualityRisk,
            kind: "quality",
            details: [
              { label: "Layer", value: "Water quality" },
              { label: "Station", value: a.station.station_id },
              { label: "Sample date", value: a.quality?.date ?? "Insufficient data" },
              ...a.qualityAssessments.map((p) => ({
                label: p.spec.label,
                value:
                  p.value === null
                    ? "Insufficient data"
                    : `${p.value} ${p.spec.unit} — ${p.statusLabel}`,
              })),
              { label: "Risk", value: RISK_LABELS[a.qualityRisk] },
            ],
          }),
        );
    }

    if (showReports) {
      reports
        .filter((r) => inBlock(r.block) && r.latitude !== null && r.longitude !== null)
        .forEach((r) =>
          out.push({
            id: `rep-${r.id}`,
            latitude: r.latitude,
            longitude: r.longitude,
            label: `${r.id} — ${REPORT_TYPE_LABELS[r.report_type]}`,
            risk: r.priority === "high" ? "high" : r.priority === "medium" ? "moderate" : "low",
            kind: "report",
            details: [
              { label: "Layer", value: "Community report" },
              { label: "Report ID", value: r.id },
              { label: "Type", value: REPORT_TYPE_LABELS[r.report_type] },
              { label: "Block", value: r.block },
              { label: "Location", value: r.location_text ?? "Not specified" },
              { label: "Reported", value: new Date(r.created_at).toLocaleDateString("en-IN") },
              { label: "Status", value: REPORT_STATUS_LABELS[r.status] },
              { label: "Priority", value: r.priority },
              { label: "Source", value: r.source },
            ],
          }),
        );
    }

    return out;
  }, [assessments, reports, block, showDecline, showQuality, showReports]);

  return (
    <AppShell>
      <PageHeader
        title="District risk map"
        subtitle="Groundwater decline, water-quality exceedances and community reports on one demo district view."
      >
        <StatusPill tone="info">
          <Layers className="size-3" aria-hidden /> {markers.length} mapped features
        </StatusPill>
      </PageHeader>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-7 sm:px-6">
        <PrototypeNotice>
          Block outlines are schematic and approximate — this is a demo geometry for prototype
          visualisation, not an official administrative boundary layer.
        </PrototypeNotice>

        <Section title="Layers and area">
          <div className="grid gap-4 rounded-lg border border-border bg-card p-4 shadow-panel sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="rm-block">Block</Label>
              <Select value={block} onValueChange={setBlock}>
                <SelectTrigger id="rm-block">
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
            <LayerToggle
              id="layer-decline"
              label="Groundwater decline"
              checked={showDecline}
              onChange={setShowDecline}
            />
            <LayerToggle
              id="layer-quality"
              label="Water-quality risk"
              checked={showQuality}
              onChange={setShowQuality}
            />
            <LayerToggle
              id="layer-reports"
              label="Community reports"
              checked={showReports}
              onChange={setShowReports}
            />
          </div>
        </Section>

        <Section
          title="Combined risk view"
          description="Click any marker to read the underlying record, including its data source."
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
            <DistrictMap
              markers={markers}
              className="aspect-[4/3] w-full"
              emptyMessage="No layers selected, or no mapped features for this block."
            />
            <div className="rounded-lg border border-border bg-card p-4 shadow-panel">
              <MapLegend
                kinds={[
                  { kind: "decline", label: "Groundwater decline" },
                  { kind: "quality", label: "Water-quality sample" },
                  { kind: "report", label: "Community report" },
                ]}
              />
            </div>
          </div>
        </Section>

        <Section
          title="Block risk summary"
          description="Each block's worst groundwater and quality risk, with active community reports."
        >
          <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-panel">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-semibold">Block</th>
                  <th className="px-3 py-2 font-semibold">Groundwater risk</th>
                  <th className="px-3 py-2 font-semibold">Quality risk</th>
                  <th className="px-3 py-2 font-semibold">Mean change</th>
                  <th className="px-3 py-2 font-semibold">Active reports</th>
                  <th className="px-3 py-2 font-semibold">Priority score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {priorities.map((p) => (
                  <tr key={p.block}>
                    <td className="px-3 py-2.5 font-medium">{p.block}</td>
                    <td className="px-3 py-2.5">
                      <RiskBadge level={p.groundwaterRisk} />
                    </td>
                    <td className="px-3 py-2.5">
                      <RiskBadge level={p.qualityRisk} />
                    </td>
                    <td className="px-3 py-2.5 text-xs tabular-nums">
                      {p.meanChangePerYear === null
                        ? "Insufficient data"
                        : `${p.meanChangePerYear > 0 ? "+" : ""}${p.meanChangePerYear} m/yr`}
                    </td>
                    <td className="px-3 py-2.5 tabular-nums">{p.activeReportCount}</td>
                    <td className="px-3 py-2.5 tabular-nums">{p.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section
          title="Priority areas"
          description="Ranked by the transparent prototype score: 3×groundwater risk + 3×quality risk + active reports."
        >
          <PriorityAreas items={priorities} />
        </Section>

        <ConsistencyAlerts items={priorities} />

        <RiskMethodology />
      </div>
    </AppShell>
  );
}

function LayerToggle({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-secondary/40 px-3 py-2">
      <Label htmlFor={id} className="text-xs font-medium">
        {label}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
