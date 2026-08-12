/**
 * Transparent prototype risk rules.
 *
 * These are deliberately simple, documented, rule-based calculations — NOT
 * machine-learning output. They are surfaced verbatim in the UI ("How risk is
 * calculated") so no user mistakes them for a validated model.
 */
import {
  QUALITY_PARAMETERS,
  type DataConfidence,
  type GroundwaterObservation,
  type QualityParameterSpec,
  type RiskLevel,
  type TrendDirection,
  type WaterQualityRecord,
} from "@/data/types";

export const RISK_ORDER: Record<RiskLevel, number> = {
  insufficient: 0,
  low: 1,
  moderate: 2,
  high: 3,
  critical: 4,
};

export function worstRisk(levels: RiskLevel[]): RiskLevel {
  const known = levels.filter((l) => l !== "insufficient");
  if (known.length === 0) return "insufficient";
  return known.reduce((a, b) => (RISK_ORDER[b] > RISK_ORDER[a] ? b : a));
}

export interface GroundwaterTrend {
  latest: number | null;
  latestDate: string | null;
  earliest: number | null;
  /** Metres of change per year; positive = water table getting deeper. */
  changePerYear: number | null;
  totalChange: number | null;
  direction: TrendDirection;
  risk: RiskLevel;
  confidence: DataConfidence;
  observationCount: number;
}

/** GROUNDWATER RULE: >=1.0 m/yr deepening = HIGH, >=0.4 = MODERATE, else LOW. */
export const GROUNDWATER_RULES = [
  { label: "Water table deepening ≥ 1.0 m/year", result: "high" as RiskLevel },
  { label: "Water table deepening 0.4 – 1.0 m/year", result: "moderate" as RiskLevel },
  { label: "Stable or recovering (< 0.4 m/year)", result: "low" as RiskLevel },
  { label: "Fewer than 4 valid observations", result: "insufficient" as RiskLevel },
];

export function computeGroundwaterTrend(observations: GroundwaterObservation[]): GroundwaterTrend {
  const valid = observations
    .filter((o) => o.groundwater_level_m !== null)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));

  if (valid.length < 4) {
    return {
      latest: valid.at(-1)?.groundwater_level_m ?? null,
      latestDate: valid.at(-1)?.date ?? null,
      earliest: valid[0]?.groundwater_level_m ?? null,
      changePerYear: null,
      totalChange: null,
      direction: "unknown",
      risk: "insufficient",
      confidence: "insufficient",
      observationCount: valid.length,
    };
  }

  const first = valid[0]!;
  const last = valid.at(-1)!;
  const years =
    (new Date(last.date).getTime() - new Date(first.date).getTime()) / (365.25 * 86_400_000);
  const totalChange = (last.groundwater_level_m as number) - (first.groundwater_level_m as number);
  const changePerYear = years > 0 ? totalChange / years : null;

  let direction: TrendDirection = "stable";
  if (changePerYear !== null) {
    if (changePerYear >= 0.15) direction = "declining";
    else if (changePerYear <= -0.15) direction = "rising";
  }

  let risk: RiskLevel = "low";
  if (changePerYear !== null) {
    if (changePerYear >= 1.0) risk = "high";
    else if (changePerYear >= 0.4) risk = "moderate";
  }

  const expected = observations.length;
  const coverage = expected === 0 ? 0 : valid.length / expected;
  const confidence: DataConfidence = coverage >= 0.9 ? "high" : coverage >= 0.6 ? "medium" : "low";

  return {
    latest: last.groundwater_level_m,
    latestDate: last.date,
    earliest: first.groundwater_level_m,
    changePerYear: changePerYear === null ? null : Math.round(changePerYear * 100) / 100,
    totalChange: Math.round(totalChange * 10) / 10,
    direction,
    risk,
    confidence,
    observationCount: valid.length,
  };
}

/** QUALITY RULE: <=1x threshold LOW, <=1.5x MODERATE, <=2.5x HIGH, else CRITICAL. */
export const QUALITY_RULES = [
  { label: "Value at or below reference threshold", result: "low" as RiskLevel },
  { label: "Up to 1.5 × reference threshold", result: "moderate" as RiskLevel },
  { label: "1.5 – 2.5 × reference threshold", result: "high" as RiskLevel },
  { label: "Above 2.5 × reference threshold", result: "critical" as RiskLevel },
  { label: "No measurement available", result: "insufficient" as RiskLevel },
];

export interface ParameterAssessment {
  spec: QualityParameterSpec;
  value: number | null;
  ratio: number | null;
  risk: RiskLevel;
  statusLabel: string;
}

export function assessParameter(
  spec: QualityParameterSpec,
  value: number | null,
): ParameterAssessment {
  if (value === null || Number.isNaN(value)) {
    return {
      spec,
      value: null,
      ratio: null,
      risk: "insufficient",
      statusLabel: "Insufficient data",
    };
  }
  const ratio = value / spec.threshold;
  let risk: RiskLevel = "low";
  if (ratio > 2.5) risk = "critical";
  else if (ratio > 1.5) risk = "high";
  else if (ratio > 1) risk = "moderate";
  return {
    spec,
    value,
    ratio: Math.round(ratio * 100) / 100,
    risk,
    statusLabel: risk === "low" ? "Within reference threshold" : "Above reference threshold",
  };
}

export function assessRecord(record: WaterQualityRecord | undefined): ParameterAssessment[] {
  return QUALITY_PARAMETERS.map((spec) =>
    assessParameter(spec, record ? ((record[spec.key] as number | null) ?? null) : null),
  );
}

/** Haversine distance in metres — sufficient for the prototype duplicate rule. */
export function distanceMeters(
  a: { latitude: number | null; longitude: number | null },
  b: { latitude: number | null; longitude: number | null },
): number | null {
  if (a.latitude === null || a.longitude === null || b.latitude === null || b.longitude === null) {
    return null;
  }
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

export const DUPLICATE_RULE = {
  radiusMeters: 200,
  windowDays: 7,
};
