/**
 * Data-access seam for the prototype.
 *
 * Every page reads through these async functions. To move from demo records to
 * real data (CSV → Python preprocessing → FastAPI → DB), replace the bodies
 * here with fetch() calls; component code and types stay unchanged.
 */
import {
  BLOCKS,
  DISTRICT,
  GROUNDWATER_OBSERVATIONS,
  INFRASTRUCTURE_STATUS,
  RAINFALL_CONTEXT,
  STATIONS,
  WATER_QUALITY_RECORDS,
  buildDemoPredictions,
} from "@/data/demo-dataset";
import type {
  CommunityReport,
  GroundwaterObservation,
  MonitoringStation,
  Prediction,
  RiskLevel,
  WaterQualityRecord,
} from "@/data/types";
import { QUALITY_PARAMETERS } from "@/data/types";
import {
  assessRecord,
  computeGroundwaterTrend,
  worstRisk,
  type GroundwaterTrend,
  type ParameterAssessment,
} from "@/lib/risk";
import { getReports } from "./reports-store";

const LATENCY_MS = 120;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));
}

export interface GroundwaterFilters {
  district?: string;
  block?: string | "all";
  stationId?: string | "all";
  from?: string;
  to?: string;
  season?: "all" | "pre_monsoon" | "monsoon" | "post_monsoon" | "winter";
}

const SEASON_MONTHS: Record<string, number[]> = {
  winter: [1, 2, 12],
  pre_monsoon: [3, 4, 5, 6],
  monsoon: [7, 8, 9],
  post_monsoon: [10, 11],
};

export async function fetchStations(): Promise<MonitoringStation[]> {
  return delay(STATIONS);
}

export async function fetchBlocks(): Promise<string[]> {
  return delay([...BLOCKS]);
}

export function filterObservations(
  rows: GroundwaterObservation[],
  filters: GroundwaterFilters,
): GroundwaterObservation[] {
  return rows.filter((row) => {
    if (filters.district && row.district !== filters.district) return false;
    if (filters.block && filters.block !== "all" && row.block !== filters.block) return false;
    if (filters.stationId && filters.stationId !== "all" && row.station_id !== filters.stationId)
      return false;
    if (filters.from && row.date < filters.from) return false;
    if (filters.to && row.date > filters.to) return false;
    if (filters.season && filters.season !== "all") {
      const month = Number(row.date.slice(5, 7));
      if (!SEASON_MONTHS[filters.season]?.includes(month)) return false;
    }
    return true;
  });
}

export async function fetchObservations(
  filters: GroundwaterFilters = {},
): Promise<GroundwaterObservation[]> {
  return delay(filterObservations(GROUNDWATER_OBSERVATIONS, { district: DISTRICT, ...filters }));
}

export function stationSeries(stationId: string) {
  return GROUNDWATER_OBSERVATIONS.filter((o) => o.station_id === stationId).map((o) => ({
    date: o.date,
    value: o.groundwater_level_m,
  }));
}

export async function fetchPredictions(): Promise<Prediction[]> {
  return delay(buildDemoPredictions(stationSeries));
}

export function predictionsSync(): Prediction[] {
  return buildDemoPredictions(stationSeries);
}

export async function fetchWaterQuality(
  filters: {
    block?: string | "all";
    stationId?: string | "all";
  } = {},
): Promise<WaterQualityRecord[]> {
  return delay(
    WATER_QUALITY_RECORDS.filter((r) => {
      if (filters.block && filters.block !== "all" && r.block !== filters.block) return false;
      if (filters.stationId && filters.stationId !== "all" && r.station_id !== filters.stationId)
        return false;
      return true;
    }),
  );
}

export function latestQualityByStation(): Record<string, WaterQualityRecord> {
  const out: Record<string, WaterQualityRecord> = {};
  for (const r of WATER_QUALITY_RECORDS) {
    const existing = out[r.station_id];
    if (!existing || r.date > existing.date) out[r.station_id] = r;
  }
  return out;
}

export interface StationAssessment {
  station: MonitoringStation;
  trend: GroundwaterTrend;
  prediction: Prediction | undefined;
  quality: WaterQualityRecord | undefined;
  qualityAssessments: ParameterAssessment[];
  qualityRisk: RiskLevel;
  combinedRisk: RiskLevel;
}

export function assessStations(): StationAssessment[] {
  const preds = predictionsSync();
  const latestQuality = latestQualityByStation();
  return STATIONS.map((station) => {
    const obs = GROUNDWATER_OBSERVATIONS.filter((o) => o.station_id === station.station_id);
    const trend = computeGroundwaterTrend(obs);
    const quality = latestQuality[station.station_id];
    const qualityAssessments = assessRecord(quality);
    const qualityRisk = worstRisk(qualityAssessments.map((a) => a.risk));
    return {
      station,
      trend,
      prediction: preds.find((p) => p.station_id === station.station_id),
      quality,
      qualityAssessments,
      qualityRisk,
      combinedRisk: worstRisk([trend.risk, qualityRisk]),
    };
  });
}

export interface BlockPriority {
  block: string;
  score: number;
  groundwaterRisk: RiskLevel;
  qualityRisk: RiskLevel;
  reportCount: number;
  activeReportCount: number;
  stationCount: number;
  meanChangePerYear: number | null;
  infrastructureStatus: "functional" | "partial" | "reported_issue" | "unknown";
  dryWellReports: number;
  inconsistencyFlag: boolean;
}

const RISK_POINTS: Record<RiskLevel, number> = {
  insufficient: 0,
  low: 1,
  moderate: 2,
  high: 3,
  critical: 4,
};

/**
 * Prototype prioritisation score (transparent, not official):
 *   score = 3×groundwaterRisk + 3×qualityRisk + min(activeReports, 10)
 */
export function computeBlockPriorities(reports: CommunityReport[] = getReports()): BlockPriority[] {
  const assessments = assessStations();
  return BLOCKS.map((block) => {
    const blockAssessments = assessments.filter((a) => a.station.block === block);
    const blockReports = reports.filter((r) => r.block === block);
    const active = blockReports.filter((r) => r.status !== "resolved");
    const gwRisk = worstRisk(blockAssessments.map((a) => a.trend.risk));
    const wqRisk = worstRisk(blockAssessments.map((a) => a.qualityRisk));
    const changes = blockAssessments
      .map((a) => a.trend.changePerYear)
      .filter((v): v is number => v !== null);
    const infra =
      INFRASTRUCTURE_STATUS.find((i) => i.block === block)?.status ?? ("unknown" as const);
    const dryWellReports = active.filter(
      (r) => r.report_type === "dry_well" || r.report_type === "dry_hand_pump",
    ).length;
    const score = 3 * RISK_POINTS[gwRisk] + 3 * RISK_POINTS[wqRisk] + Math.min(active.length, 10);
    return {
      block,
      score,
      groundwaterRisk: gwRisk,
      qualityRisk: wqRisk,
      reportCount: blockReports.length,
      activeReportCount: active.length,
      stationCount: blockAssessments.length,
      meanChangePerYear:
        changes.length === 0
          ? null
          : Math.round((changes.reduce((a, b) => a + b, 0) / changes.length) * 100) / 100,
      infrastructureStatus: infra,
      dryWellReports,
      inconsistencyFlag:
        (gwRisk === "high" || gwRisk === "critical") &&
        infra === "functional" &&
        dryWellReports >= 2,
    };
  }).sort((a, b) => b.score - a.score);
}

export interface DistrictSummary {
  district: string;
  meanLatestLevel: number | null;
  latestObservationDate: string | null;
  trendDirection: GroundwaterTrend["direction"];
  meanChangePerYear: number | null;
  groundwaterRisk: RiskLevel;
  elevatedParameterCount: number;
  totalParametersMeasured: number;
  activeReports: number;
  totalReports: number;
  stationCount: number;
  stationsWithGaps: number;
}

export function computeDistrictSummary(reports: CommunityReport[] = getReports()): DistrictSummary {
  const assessments = assessStations();
  const latest = assessments.map((a) => a.trend.latest).filter((v): v is number => v !== null);
  const changes = assessments
    .map((a) => a.trend.changePerYear)
    .filter((v): v is number => v !== null);
  const meanChange =
    changes.length === 0 ? null : changes.reduce((a, b) => a + b, 0) / changes.length;

  const elevated = new Set<string>();
  let measured = 0;
  assessments.forEach((a) => {
    a.qualityAssessments.forEach((p) => {
      if (p.risk === "insufficient") return;
      measured += 1;
      if (p.risk !== "low") elevated.add(p.spec.label);
    });
  });

  const latestDate = GROUNDWATER_OBSERVATIONS.filter((o) => o.groundwater_level_m !== null)
    .map((o) => o.date)
    .sort()
    .at(-1);

  return {
    district: DISTRICT,
    meanLatestLevel:
      latest.length === 0
        ? null
        : Math.round((latest.reduce((a, b) => a + b, 0) / latest.length) * 10) / 10,
    latestObservationDate: latestDate ?? null,
    trendDirection:
      meanChange === null
        ? "unknown"
        : meanChange >= 0.15
          ? "declining"
          : meanChange <= -0.15
            ? "rising"
            : "stable",
    meanChangePerYear: meanChange === null ? null : Math.round(meanChange * 100) / 100,
    groundwaterRisk: worstRisk(assessments.map((a) => a.trend.risk)),
    elevatedParameterCount: elevated.size,
    totalParametersMeasured: measured,
    activeReports: reports.filter((r) => r.status !== "resolved").length,
    totalReports: reports.length,
    stationCount: STATIONS.length,
    stationsWithGaps: assessments.filter((a) => a.trend.confidence !== "high").length,
  };
}

export function rainfallContext() {
  return RAINFALL_CONTEXT;
}

export const QUALITY_PARAMETER_SPECS = QUALITY_PARAMETERS;
