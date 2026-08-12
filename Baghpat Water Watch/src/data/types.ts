/**
 * Canonical data model for the district groundwater prototype.
 *
 * Field names intentionally mirror the shape expected from real Indian
 * groundwater datasets (CGWB / India-WRIS / NWDP exports) so the demo
 * records can later be swapped for verified CSV/API data without any
 * UI redesign. See src/services/* for the data-access seam.
 */

export type DataSource = "DEMO_DATA" | "CGWB" | "INDIA_WRIS" | "NWDP" | "IMD" | "COMMUNITY";

export type DataConfidence = "high" | "medium" | "low" | "insufficient";

export type RiskLevel = "low" | "moderate" | "high" | "critical" | "insufficient";

export type TrendDirection = "declining" | "stable" | "rising" | "unknown";

export interface MonitoringStation {
  station_id: string;
  name: string;
  district: string;
  block: string;
  latitude: number;
  longitude: number;
  measurement_frequency: "monthly" | "quarterly" | "seasonal";
  source: DataSource;
}

export interface GroundwaterObservation {
  id: string;
  station_id: string;
  date: string; // ISO date (YYYY-MM-DD)
  latitude: number;
  longitude: number;
  district: string;
  block: string;
  /** Depth to water table, metres below ground level (higher = deeper water). */
  groundwater_level_m: number | null;
  measurement_frequency: MonitoringStation["measurement_frequency"];
  source: DataSource;
}

export interface WaterQualityRecord {
  id: string;
  station_id: string;
  date: string;
  latitude: number;
  longitude: number;
  district: string;
  block: string;
  nitrate_mg_l: number | null;
  fluoride_mg_l: number | null;
  arsenic_ug_l: number | null;
  iron_mg_l: number | null;
  ec_us_cm: number | null;
  source: DataSource;
  data_confidence: DataConfidence;
}

export interface Prediction {
  id: string;
  station_id: string;
  prediction_date: string;
  forecast_date: string;
  predicted_groundwater_level: number | null;
  risk_level: RiskLevel;
  model_name: string;
  model_version: string;
  confidence: DataConfidence | "not_validated";
  source: DataSource;
}

export type ReportType =
  | "pipeline_leakage"
  | "dry_well"
  | "dry_hand_pump"
  | "water_quality_concern"
  | "falling_groundwater"
  | "other";

export type ReportStatus = "new" | "under_review" | "field_verification" | "resolved";

export type ReportPriority = "low" | "medium" | "high";

export interface CommunityReport {
  id: string;
  report_type: ReportType;
  latitude: number | null;
  longitude: number | null;
  district: string;
  block: string;
  description: string;
  photo_url: string | null;
  reporter_name: string | null;
  location_text: string | null;
  created_at: string; // ISO timestamp
  status: ReportStatus;
  priority: ReportPriority;
  source: DataSource;
}

export interface QualityParameterSpec {
  key: "nitrate_mg_l" | "fluoride_mg_l" | "arsenic_ug_l" | "iron_mg_l" | "ec_us_cm";
  label: string;
  unit: string;
  /** Reference/permissible limit used only as a prototype comparison value. */
  threshold: number;
  referenceNote: string;
}

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  pipeline_leakage: "Pipeline leakage",
  dry_well: "Dry well",
  dry_hand_pump: "Dry hand pump",
  water_quality_concern: "Water-quality concern",
  falling_groundwater: "Falling groundwater",
  other: "Other",
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  new: "New",
  under_review: "Under Review",
  field_verification: "Field Verification",
  resolved: "Resolved",
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
  critical: "Critical",
  insufficient: "Insufficient data",
};

export const CONFIDENCE_LABELS: Record<DataConfidence | "not_validated", string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  insufficient: "Insufficient",
  not_validated: "Prototype / not validated",
};

export const QUALITY_PARAMETERS: QualityParameterSpec[] = [
  {
    key: "nitrate_mg_l",
    label: "Nitrate",
    unit: "mg/L",
    threshold: 45,
    referenceNote: "Commonly cited drinking-water reference value for nitrate (as NO₃).",
  },
  {
    key: "fluoride_mg_l",
    label: "Fluoride",
    unit: "mg/L",
    threshold: 1.5,
    referenceNote: "Commonly cited permissible upper reference value for fluoride.",
  },
  {
    key: "arsenic_ug_l",
    label: "Arsenic",
    unit: "µg/L",
    threshold: 10,
    referenceNote: "Commonly cited reference value for arsenic in drinking water.",
  },
  {
    key: "iron_mg_l",
    label: "Iron",
    unit: "mg/L",
    threshold: 1,
    referenceNote: "Commonly cited acceptable/permissible reference value for iron.",
  },
  {
    key: "ec_us_cm",
    label: "Electrical Conductivity",
    unit: "µS/cm",
    threshold: 1500,
    referenceNote: "Indicative salinity screening value used for this prototype only.",
  },
];
