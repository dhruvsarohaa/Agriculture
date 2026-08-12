import { useMemo, useState } from "react";
import { BLOCK_SHAPES, DISTRICT_BOUNDS } from "@/data/demo-dataset";
import type { RiskLevel } from "@/data/types";
import { cn } from "@/lib/utils";
import { riskDotClass } from "./RiskBadge";

export interface MapMarker {
  id: string;
  latitude: number | null;
  longitude: number | null;
  label: string;
  risk: RiskLevel;
  kind: "station" | "quality" | "report" | "decline";
  details: { label: string; value: string }[];
}

const KIND_SHAPE: Record<MapMarker["kind"], "circle" | "square" | "diamond" | "triangle"> = {
  station: "circle",
  decline: "triangle",
  quality: "square",
  report: "diamond",
};

const RISK_FILL: Record<RiskLevel, string> = {
  low: "var(--safe)",
  moderate: "var(--warning)",
  high: "var(--critical)",
  critical: "var(--severe)",
  insufficient: "var(--unknown)",
};

const W = 720;
const H = 560;
const PAD = 26;

function project(lat: number, lon: number) {
  const x =
    PAD +
    ((lon - DISTRICT_BOUNDS.minLon) / (DISTRICT_BOUNDS.maxLon - DISTRICT_BOUNDS.minLon)) *
      (W - PAD * 2);
  const y =
    PAD +
    ((DISTRICT_BOUNDS.maxLat - lat) / (DISTRICT_BOUNDS.maxLat - DISTRICT_BOUNDS.minLat)) *
      (H - PAD * 2);
  return { x, y };
}

export function DistrictMap({
  markers,
  showBlocks = true,
  className,
  emptyMessage = "No mapped locations for the current selection.",
}: {
  markers: MapMarker[];
  showBlocks?: boolean;
  className?: string;
  emptyMessage?: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const placed = useMemo(
    () =>
      markers
        .filter((m) => m.latitude !== null && m.longitude !== null)
        .map((m) => ({ ...m, pos: project(m.latitude as number, m.longitude as number) })),
    [markers],
  );

  const active = placed.find((m) => m.id === selected) ?? null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border border-border bg-secondary/40",
        className,
      )}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-full w-full"
        role="img"
        aria-label="Demo map of Baghpat district monitoring locations"
      >
        <rect x={0} y={0} width={W} height={H} fill="var(--secondary)" />
        <g opacity={0.5}>
          {Array.from({ length: 18 }).map((_, i) => (
            <line
              key={`v${i}`}
              x1={(i * W) / 18}
              y1={0}
              x2={(i * W) / 18}
              y2={H}
              stroke="var(--border)"
              strokeWidth={1}
            />
          ))}
          {Array.from({ length: 14 }).map((_, i) => (
            <line
              key={`h${i}`}
              x1={0}
              y1={(i * H) / 14}
              x2={W}
              y2={(i * H) / 14}
              stroke="var(--border)"
              strokeWidth={1}
            />
          ))}
        </g>

        {showBlocks &&
          BLOCK_SHAPES.map((shape) => {
            const pts = shape.points.map(([lat, lon]) => project(lat, lon));
            const centroid = pts.reduce(
              (acc, p) => ({ x: acc.x + p.x / pts.length, y: acc.y + p.y / pts.length }),
              { x: 0, y: 0 },
            );
            return (
              <g key={shape.block}>
                <polygon
                  points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill="var(--primary)"
                  fillOpacity={0.06}
                  stroke="var(--primary)"
                  strokeOpacity={0.35}
                  strokeWidth={1.5}
                />
                <text
                  x={centroid.x}
                  y={centroid.y}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                  fontSize={12}
                  fontWeight={600}
                >
                  {shape.block}
                </text>
              </g>
            );
          })}

        {placed.map((m) => {
          const shape = KIND_SHAPE[m.kind];
          const fill = RISK_FILL[m.risk];
          const isActive = m.id === selected;
          const r = isActive ? 9 : 7;
          const common = {
            fill,
            stroke: "var(--card)",
            strokeWidth: 2,
            style: { cursor: "pointer" as const },
            onClick: () => setSelected(isActive ? null : m.id),
          };
          return (
            <g key={m.id} aria-label={m.label}>
              {shape === "circle" && <circle cx={m.pos.x} cy={m.pos.y} r={r} {...common} />}
              {shape === "square" && (
                <rect
                  x={m.pos.x - r}
                  y={m.pos.y - r}
                  width={r * 2}
                  height={r * 2}
                  rx={2}
                  {...common}
                />
              )}
              {shape === "diamond" && (
                <rect
                  x={m.pos.x - r}
                  y={m.pos.y - r}
                  width={r * 2}
                  height={r * 2}
                  transform={`rotate(45 ${m.pos.x} ${m.pos.y})`}
                  {...common}
                />
              )}
              {shape === "triangle" && (
                <polygon
                  points={`${m.pos.x},${m.pos.y - r - 1} ${m.pos.x + r},${m.pos.y + r} ${m.pos.x - r},${m.pos.y + r}`}
                  {...common}
                />
              )}
            </g>
          );
        })}
      </svg>

      <p className="pointer-events-none absolute bottom-2 left-3 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
        Demo locations — schematic projection, not a survey map
      </p>

      {placed.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 p-6 text-center">
          <p className="text-sm font-medium text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : null}

      {active ? (
        <div className="absolute right-3 top-3 w-[min(19rem,calc(100%-1.5rem))] rounded-md border border-border bg-card p-3 shadow-panel">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold leading-tight">{active.label}</p>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="rounded px-1 text-xs text-muted-foreground hover:text-foreground"
              aria-label="Close popup"
            >
              ✕
            </button>
          </div>
          <dl className="mt-2 space-y-1">
            {active.details.map((d) => (
              <div key={d.label} className="flex justify-between gap-3 text-xs">
                <dt className="text-muted-foreground">{d.label}</dt>
                <dd className="text-right font-medium tabular-nums">{d.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </div>
  );
}

export function MapLegend({
  className,
  kinds,
}: {
  className?: string;
  kinds?: { kind: MapMarker["kind"]; label: string }[];
}) {
  const risks: { level: RiskLevel; label: string }[] = [
    { level: "low", label: "Low" },
    { level: "moderate", label: "Moderate" },
    { level: "high", label: "High" },
    { level: "critical", label: "Critical" },
    { level: "insufficient", label: "Insufficient data" },
  ];
  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Risk level
        </p>
        <ul className="mt-2 space-y-1.5">
          {risks.map((r) => (
            <li key={r.level} className="flex items-center gap-2 text-xs">
              <span className={cn("size-2.5 rounded-full", riskDotClass(r.level))} aria-hidden />
              {r.label}
            </li>
          ))}
        </ul>
      </div>
      {kinds?.length ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Marker shape
          </p>
          <ul className="mt-2 space-y-1.5">
            {kinds.map((k) => (
              <li key={k.kind} className="flex items-center gap-2 text-xs">
                <span
                  aria-hidden
                  className={cn(
                    "size-2.5 border border-foreground/40 bg-foreground/20",
                    KIND_SHAPE[k.kind] === "circle" && "rounded-full",
                    KIND_SHAPE[k.kind] === "diamond" && "rotate-45",
                    KIND_SHAPE[k.kind] === "triangle" &&
                      "border-0 bg-foreground/30 [clip-path:polygon(50%_0%,100%_100%,0%_100%)]",
                  )}
                />
                {k.label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
