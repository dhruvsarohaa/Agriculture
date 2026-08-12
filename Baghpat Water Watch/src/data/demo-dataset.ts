/**
 * Synthetic demo dataset for the Baghpat prototype.
 *
 * IMPORTANT: every record carries source = "DEMO_DATA". None of these values
 * are real measurements and none originate from CGWB, India-WRIS or NWDP.
 * They exist only so charts, maps, filters and ranking look realistic.
 */
import type {
  CommunityReport,
  GroundwaterObservation,
  MonitoringStation,
  Prediction,
  WaterQualityRecord,
} from "./types";

export const DISTRICT = "Baghpat";
export const STATE = "Uttar Pradesh";

export const BLOCKS = ["Baraut", "Pilana", "Khekada", "Chhaprauli", "Binauli", "Baghpat"] as const;

/** Approximate bounding box used for the demo map projection. */
export const DISTRICT_BOUNDS = {
  minLat: 28.78,
  maxLat: 29.16,
  minLon: 77.03,
  maxLon: 77.44,
};

/** Rough, illustrative block outlines (not survey-accurate boundaries). */
export const BLOCK_SHAPES: { block: string; points: [number, number][] }[] = [
  {
    block: "Chhaprauli",
    points: [
      [29.14, 77.06],
      [29.15, 77.19],
      [29.03, 77.2],
      [29.0, 77.08],
    ],
  },
  {
    block: "Baraut",
    points: [
      [29.03, 77.2],
      [29.15, 77.19],
      [29.13, 77.31],
      [29.0, 77.3],
    ],
  },
  {
    block: "Binauli",
    points: [
      [29.0, 77.08],
      [29.03, 77.2],
      [29.0, 77.3],
      [28.9, 77.26],
      [28.89, 77.11],
    ],
  },
  {
    block: "Baghpat",
    points: [
      [28.9, 77.26],
      [29.0, 77.3],
      [29.0, 77.4],
      [28.89, 77.38],
    ],
  },
  {
    block: "Pilana",
    points: [
      [28.89, 77.11],
      [28.9, 77.26],
      [28.86, 77.3],
      [28.8, 77.16],
    ],
  },
  {
    block: "Khekada",
    points: [
      [28.86, 77.3],
      [28.89, 77.38],
      [28.8, 77.42],
      [28.79, 77.28],
    ],
  },
];

export const STATIONS: MonitoringStation[] = [
  {
    station_id: "BGP-OW-01",
    name: "Baraut Town Observation Well",
    district: DISTRICT,
    block: "Baraut",
    latitude: 29.1,
    longitude: 77.26,
    measurement_frequency: "quarterly",
    source: "DEMO_DATA",
  },
  {
    station_id: "BGP-OW-02",
    name: "Baraut Rural Piezometer",
    district: DISTRICT,
    block: "Baraut",
    latitude: 29.05,
    longitude: 77.22,
    measurement_frequency: "quarterly",
    source: "DEMO_DATA",
  },
  {
    station_id: "BGP-OW-03",
    name: "Pilana Block Well",
    district: DISTRICT,
    block: "Pilana",
    latitude: 28.85,
    longitude: 77.19,
    measurement_frequency: "quarterly",
    source: "DEMO_DATA",
  },
  {
    station_id: "BGP-OW-04",
    name: "Pilana South Piezometer",
    district: DISTRICT,
    block: "Pilana",
    latitude: 28.82,
    longitude: 77.14,
    measurement_frequency: "quarterly",
    source: "DEMO_DATA",
  },
  {
    station_id: "BGP-OW-05",
    name: "Khekada Canal-side Well",
    district: DISTRICT,
    block: "Khekada",
    latitude: 28.84,
    longitude: 77.34,
    measurement_frequency: "quarterly",
    source: "DEMO_DATA",
  },
  {
    station_id: "BGP-OW-06",
    name: "Chhaprauli North Well",
    district: DISTRICT,
    block: "Chhaprauli",
    latitude: 29.11,
    longitude: 77.11,
    measurement_frequency: "quarterly",
    source: "DEMO_DATA",
  },
  {
    station_id: "BGP-OW-07",
    name: "Binauli Village Well",
    district: DISTRICT,
    block: "Binauli",
    latitude: 28.95,
    longitude: 77.18,
    measurement_frequency: "quarterly",
    source: "DEMO_DATA",
  },
  {
    station_id: "BGP-OW-08",
    name: "Binauli East Piezometer",
    district: DISTRICT,
    block: "Binauli",
    latitude: 28.97,
    longitude: 77.27,
    measurement_frequency: "quarterly",
    source: "DEMO_DATA",
  },
  {
    station_id: "BGP-OW-09",
    name: "Baghpat HQ Observation Well",
    district: DISTRICT,
    block: "Baghpat",
    latitude: 28.94,
    longitude: 77.34,
    measurement_frequency: "quarterly",
    source: "DEMO_DATA",
  },
  {
    station_id: "BGP-OW-10",
    name: "Baghpat Yamuna Belt Well",
    district: DISTRICT,
    block: "Baghpat",
    latitude: 28.91,
    longitude: 77.39,
    measurement_frequency: "seasonal",
    source: "DEMO_DATA",
  },
];

export const OBSERVATION_DATES = [
  "2023-01-15",
  "2023-04-15",
  "2023-07-15",
  "2023-10-15",
  "2024-01-15",
  "2024-04-15",
  "2024-07-15",
  "2024-10-15",
  "2025-01-15",
  "2025-04-15",
  "2025-07-15",
  "2025-10-15",
];

/** Deterministic pseudo-random in [0,1) so the demo dataset never shifts. */
function seeded(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Per-station generation profile: starting depth (m bgl), annual decline rate
 * and monsoon recovery amplitude. Purely illustrative.
 */
const STATION_PROFILE: Record<string, { start: number; declinePerYear: number; seasonal: number }> =
  {
    "BGP-OW-01": { start: 10.4, declinePerYear: 0.55, seasonal: 1.1 },
    "BGP-OW-02": { start: 11.2, declinePerYear: 0.62, seasonal: 1.0 },
    "BGP-OW-03": { start: 11.8, declinePerYear: 1.15, seasonal: 0.9 },
    "BGP-OW-04": { start: 12.6, declinePerYear: 1.05, seasonal: 0.8 },
    "BGP-OW-05": { start: 8.2, declinePerYear: 0.15, seasonal: 1.3 },
    "BGP-OW-06": { start: 9.1, declinePerYear: 0.2, seasonal: 1.2 },
    "BGP-OW-07": { start: 10.9, declinePerYear: 0.72, seasonal: 1.0 },
    "BGP-OW-08": { start: 10.1, declinePerYear: 0.45, seasonal: 1.1 },
    "BGP-OW-09": { start: 12.0, declinePerYear: 0.85, seasonal: 0.9 },
    "BGP-OW-10": { start: 7.4, declinePerYear: 0.1, seasonal: 1.4 },
  };

function buildObservations(): GroundwaterObservation[] {
  const rows: GroundwaterObservation[] = [];
  STATIONS.forEach((station, sIdx) => {
    const profile = STATION_PROFILE[station.station_id] ?? {
      start: 10,
      declinePerYear: 0.5,
      seasonal: 1,
    };
    OBSERVATION_DATES.forEach((date, i) => {
      const years = i / 4;
      const month = Number(date.slice(5, 7));
      // Post-monsoon (Oct) water table is shallower; pre-monsoon (Apr) deepest.
      const seasonalOffset =
        month === 10
          ? -profile.seasonal
          : month === 7
            ? -profile.seasonal * 0.35
            : month === 4
              ? profile.seasonal * 0.5
              : 0;
      const noise = (seeded(sIdx * 31 + i * 7 + 3) - 0.5) * 0.32;
      const value = profile.start + profile.declinePerYear * years + seasonalOffset + noise;

      // Deliberate gaps: a seasonal station with missing quarters, plus one
      // sensor outage. Missing data must stay missing, never be back-filled.
      const missing =
        (station.measurement_frequency === "seasonal" && month !== 4 && month !== 10) ||
        (station.station_id === "BGP-OW-08" && date === "2024-07-15");

      rows.push({
        id: `gwo-${station.station_id}-${date}`,
        station_id: station.station_id,
        date,
        latitude: station.latitude,
        longitude: station.longitude,
        district: station.district,
        block: station.block,
        groundwater_level_m: missing ? null : Math.round(value * 10) / 10,
        measurement_frequency: station.measurement_frequency,
        source: "DEMO_DATA",
      });
    });
  });
  return rows;
}

export const GROUNDWATER_OBSERVATIONS: GroundwaterObservation[] = buildObservations();

const QUALITY_PROFILE: Record<
  string,
  {
    nitrate: number | null;
    fluoride: number | null;
    arsenic: number | null;
    iron: number | null;
    ec: number | null;
    confidence: WaterQualityRecord["data_confidence"];
  }
> = {
  "BGP-OW-01": { nitrate: 52, fluoride: 0.9, arsenic: 4, iron: 0.6, ec: 1180, confidence: "high" },
  "BGP-OW-02": {
    nitrate: 47,
    fluoride: 1.1,
    arsenic: 3,
    iron: 1.4,
    ec: 1320,
    confidence: "medium",
  },
  "BGP-OW-03": { nitrate: 61, fluoride: 0.8, arsenic: 6, iron: 1.2, ec: 1610, confidence: "high" },
  "BGP-OW-04": {
    nitrate: 74,
    fluoride: 1.6,
    arsenic: 8,
    iron: 0.9,
    ec: 1740,
    confidence: "medium",
  },
  "BGP-OW-05": { nitrate: 28, fluoride: 0.6, arsenic: 2, iron: 0.4, ec: 780, confidence: "high" },
  "BGP-OW-06": { nitrate: 31, fluoride: 0.7, arsenic: 3, iron: 0.5, ec: 860, confidence: "medium" },
  "BGP-OW-07": {
    nitrate: 44,
    fluoride: 1.0,
    arsenic: 5,
    iron: 1.1,
    ec: 1240,
    confidence: "medium",
  },
  "BGP-OW-08": {
    nitrate: null,
    fluoride: null,
    arsenic: null,
    iron: null,
    ec: null,
    confidence: "insufficient",
  },
  "BGP-OW-09": {
    nitrate: 58,
    fluoride: 1.2,
    arsenic: 12,
    iron: 1.5,
    ec: 1520,
    confidence: "medium",
  },
  "BGP-OW-10": { nitrate: 36, fluoride: 0.5, arsenic: 9, iron: 2.1, ec: 990, confidence: "low" },
};

const QUALITY_DATES = ["2025-04-22", "2025-10-08"];

function buildQuality(): WaterQualityRecord[] {
  const rows: WaterQualityRecord[] = [];
  STATIONS.forEach((station, sIdx) => {
    const p = QUALITY_PROFILE[station.station_id] ?? {
      nitrate: null,
      fluoride: null,
      arsenic: null,
      iron: null,
      ec: null,
      confidence: "insufficient" as const,
    };
    QUALITY_DATES.forEach((date, i) => {
      const drift = i === 0 ? 0.92 : 1;
      const scale = (v: number | null, digits = 1) =>
        v === null ? null : Math.round(v * drift * 10 ** digits) / 10 ** digits;
      rows.push({
        id: `wq-${station.station_id}-${date}`,
        station_id: station.station_id,
        date,
        latitude: station.latitude,
        longitude: station.longitude,
        district: station.district,
        block: station.block,
        nitrate_mg_l: scale(p.nitrate),
        fluoride_mg_l: scale(p.fluoride, 2),
        arsenic_ug_l: scale(p.arsenic),
        iron_mg_l: scale(p.iron, 2),
        ec_us_cm: p.ec === null ? null : Math.round(p.ec * drift),
        source: "DEMO_DATA",
        data_confidence: p.confidence,
      });
      void sIdx;
    });
  });
  return rows;
}

export const WATER_QUALITY_RECORDS: WaterQualityRecord[] = buildQuality();

/**
 * Demo forecasts. These are produced by a transparent persistence + trend
 * placeholder, NOT by a trained model. See src/lib/risk.ts.
 */
export const PREDICTION_MODEL = {
  name: "prototype_trend_baseline",
  version: "0.1.0-demo",
};

export function buildDemoPredictions(
  levels: (stationId: string) => { date: string; value: number | null }[],
): Prediction[] {
  return STATIONS.map((station) => {
    const series = levels(station.station_id).filter((p) => p.value !== null);
    const last = series[series.length - 1];
    const prev = series[series.length - 5] ?? series[0];
    if (!last || !prev) {
      return {
        id: `pred-${station.station_id}`,
        station_id: station.station_id,
        prediction_date: "2025-10-20",
        forecast_date: "2026-01-15",
        predicted_groundwater_level: null,
        risk_level: "insufficient",
        model_name: PREDICTION_MODEL.name,
        model_version: PREDICTION_MODEL.version,
        confidence: "not_validated",
        source: "DEMO_DATA",
      } satisfies Prediction;
    }
    const yearlyChange = (last.value as number) - (prev.value as number);
    const predicted = Math.round(((last.value as number) + yearlyChange / 3.2) * 10) / 10;
    return {
      id: `pred-${station.station_id}`,
      station_id: station.station_id,
      prediction_date: "2025-10-20",
      forecast_date: "2026-01-15",
      predicted_groundwater_level: predicted,
      risk_level:
        yearlyChange >= 1.2
          ? "high"
          : yearlyChange >= 0.5
            ? "moderate"
            : yearlyChange >= 0
              ? "low"
              : "low",
      model_name: PREDICTION_MODEL.name,
      model_version: PREDICTION_MODEL.version,
      confidence: "not_validated",
      source: "DEMO_DATA",
    } satisfies Prediction;
  });
}

type SeedReport = [
  ReportSeedType: CommunityReport["report_type"],
  block: string,
  lat: number,
  lon: number,
  daysAgo: number,
  status: CommunityReport["status"],
  priority: CommunityReport["priority"],
  description: string,
];

const SEED_REPORTS: SeedReport[] = [
  [
    "dry_well",
    "Pilana",
    28.851,
    77.191,
    3,
    "new",
    "high",
    "Village well has no water since last week.",
  ],
  [
    "dry_well",
    "Pilana",
    28.8518,
    77.1918,
    5,
    "new",
    "high",
    "Same well area — still dry, tanker needed.",
  ],
  [
    "dry_hand_pump",
    "Pilana",
    28.842,
    77.176,
    8,
    "under_review",
    "high",
    "Hand pump runs dry after a few strokes.",
  ],
  [
    "falling_groundwater",
    "Pilana",
    28.833,
    77.152,
    12,
    "field_verification",
    "high",
    "Borewell had to be deepened twice this year.",
  ],
  [
    "water_quality_concern",
    "Pilana",
    28.826,
    77.144,
    14,
    "under_review",
    "medium",
    "Water tastes bitter and leaves white marks.",
  ],
  [
    "pipeline_leakage",
    "Pilana",
    28.861,
    77.203,
    20,
    "resolved",
    "low",
    "Leaking joint near the main road.",
  ],
  [
    "dry_hand_pump",
    "Pilana",
    28.845,
    77.181,
    22,
    "resolved",
    "medium",
    "Pump repaired by panchayat team.",
  ],
  [
    "water_quality_concern",
    "Baraut",
    29.103,
    77.262,
    2,
    "new",
    "high",
    "Yellow tint in stored water.",
  ],
  [
    "water_quality_concern",
    "Baraut",
    29.1035,
    77.2626,
    4,
    "new",
    "medium",
    "Neighbouring street reports same colour issue.",
  ],
  [
    "pipeline_leakage",
    "Baraut",
    29.096,
    77.251,
    6,
    "under_review",
    "medium",
    "Continuous leakage in the supply line.",
  ],
  [
    "dry_well",
    "Baraut",
    29.052,
    77.224,
    9,
    "field_verification",
    "high",
    "Open well level dropped sharply.",
  ],
  [
    "falling_groundwater",
    "Baraut",
    29.058,
    77.231,
    16,
    "under_review",
    "medium",
    "Submersible pump losing suction in afternoons.",
  ],
  ["other", "Baraut", 29.09, 77.244, 25, "resolved", "low", "Overflowing storage tank at night."],
  [
    "dry_well",
    "Baghpat",
    28.941,
    77.341,
    4,
    "new",
    "high",
    "Community well dry, women walking further for water.",
  ],
  [
    "dry_hand_pump",
    "Baghpat",
    28.936,
    77.332,
    7,
    "field_verification",
    "high",
    "Two hand pumps not yielding water.",
  ],
  [
    "water_quality_concern",
    "Baghpat",
    28.93,
    77.328,
    11,
    "under_review",
    "high",
    "Metallic smell reported by several houses.",
  ],
  [
    "pipeline_leakage",
    "Baghpat",
    28.913,
    77.388,
    18,
    "under_review",
    "low",
    "Small leak beside the culvert.",
  ],
  [
    "falling_groundwater",
    "Binauli",
    28.952,
    77.183,
    5,
    "new",
    "medium",
    "Irrigation borewell yield reduced.",
  ],
  [
    "dry_hand_pump",
    "Binauli",
    28.969,
    77.271,
    13,
    "under_review",
    "medium",
    "Hand pump dry in the school compound.",
  ],
  [
    "pipeline_leakage",
    "Khekada",
    28.842,
    77.341,
    6,
    "resolved",
    "low",
    "Leak fixed on the branch line.",
  ],
  [
    "water_quality_concern",
    "Khekada",
    28.836,
    77.333,
    17,
    "under_review",
    "low",
    "Slight turbidity after rain.",
  ],
  [
    "pipeline_leakage",
    "Chhaprauli",
    29.112,
    77.113,
    10,
    "under_review",
    "low",
    "Leakage near the water tank valve.",
  ],
  [
    "other",
    "Chhaprauli",
    29.106,
    77.121,
    24,
    "resolved",
    "low",
    "Request for an additional standpost.",
  ],
];

const DEMO_NOW = new Date("2025-10-20T09:00:00.000Z");

export const SEED_COMMUNITY_REPORTS: CommunityReport[] = SEED_REPORTS.map(
  ([report_type, block, lat, lon, daysAgo, status, priority, description], i) => ({
    id: `BGP-CR-${String(1001 + i)}`,
    report_type,
    latitude: lat,
    longitude: lon,
    district: DISTRICT,
    block,
    description,
    photo_url: null,
    reporter_name: null,
    location_text: `${block} block (demo location)`,
    created_at: new Date(DEMO_NOW.getTime() - daysAgo * 86_400_000).toISOString(),
    status,
    priority,
    source: "DEMO_DATA",
  }),
);

/** Illustrative official infrastructure status, used only by the consistency check. */
export const INFRASTRUCTURE_STATUS: {
  block: string;
  status: "functional" | "partial" | "reported_issue";
  source: "DEMO_DATA";
}[] = [
  { block: "Pilana", status: "functional", source: "DEMO_DATA" },
  { block: "Baraut", status: "partial", source: "DEMO_DATA" },
  { block: "Baghpat", status: "functional", source: "DEMO_DATA" },
  { block: "Binauli", status: "partial", source: "DEMO_DATA" },
  { block: "Khekada", status: "functional", source: "DEMO_DATA" },
  { block: "Chhaprauli", status: "functional", source: "DEMO_DATA" },
];

/** Illustrative rainfall context (mm) per observation date — demo only. */
export const RAINFALL_CONTEXT: Record<string, number> = {
  "2023-01-15": 18,
  "2023-04-15": 9,
  "2023-07-15": 214,
  "2023-10-15": 46,
  "2024-01-15": 12,
  "2024-04-15": 6,
  "2024-07-15": 178,
  "2024-10-15": 28,
  "2025-01-15": 10,
  "2025-04-15": 5,
  "2025-07-15": 151,
  "2025-10-15": 21,
};
