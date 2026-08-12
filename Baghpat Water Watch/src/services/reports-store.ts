/**
 * Community report store.
 *
 * This is the only mutable slice of the prototype. It seeds from the demo
 * dataset and persists locally so a submitted report immediately appears in
 * the Reports dashboard. Replacing this with a FastAPI/DB client only requires
 * swapping the four functions below.
 */
import { useSyncExternalStore } from "react";
import { SEED_COMMUNITY_REPORTS, DISTRICT } from "@/data/demo-dataset";
import type { CommunityReport, ReportPriority, ReportStatus, ReportType } from "@/data/types";
import { DUPLICATE_RULE, distanceMeters } from "@/lib/risk";

const STORAGE_KEY = "bgp.community_reports.v1";

let reports: CommunityReport[] = SEED_COMMUNITY_REPORTS;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    const custom = reports.filter((r) => r.source === "COMMUNITY");
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
  } catch {
    /* storage unavailable — prototype continues in memory */
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CommunityReport[];
      if (Array.isArray(parsed) && parsed.length) {
        reports = [...parsed, ...SEED_COMMUNITY_REPORTS];
        emit();
      }
    }
  } catch {
    /* ignore malformed local data */
  }
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getReports(): CommunityReport[] {
  return reports;
}

export function useCommunityReports(): CommunityReport[] {
  return useSyncExternalStore(subscribe, getReports, () => SEED_COMMUNITY_REPORTS);
}

export interface NewReportInput {
  report_type: ReportType;
  latitude: number | null;
  longitude: number | null;
  block: string;
  location_text: string | null;
  description: string;
  reporter_name: string | null;
  photo_url: string | null;
}

function priorityFor(type: ReportType): ReportPriority {
  if (type === "dry_well" || type === "dry_hand_pump") return "high";
  if (type === "water_quality_concern" || type === "falling_groundwater") return "medium";
  return "low";
}

export function createReport(input: NewReportInput): CommunityReport {
  const seq = 5000 + reports.filter((r) => r.source === "COMMUNITY").length + 1;
  const report: CommunityReport = {
    id: `BGP-CR-${seq}`,
    report_type: input.report_type,
    latitude: input.latitude,
    longitude: input.longitude,
    district: DISTRICT,
    block: input.block,
    description: input.description,
    photo_url: input.photo_url,
    reporter_name: input.reporter_name,
    location_text: input.location_text,
    created_at: new Date().toISOString(),
    status: "new",
    priority: priorityFor(input.report_type),
    source: "COMMUNITY",
  };
  reports = [report, ...reports];
  persist();
  emit();
  return report;
}

export function updateReportStatus(id: string, status: ReportStatus) {
  reports = reports.map((r) => (r.id === id ? { ...r, status } : r));
  persist();
  emit();
}

/**
 * Prototype duplicate rule: same problem type, within ~200 m and ~7 days.
 * Returns, for each report id, the ids of related reports.
 */
export function findRelatedReports(all: CommunityReport[]): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (let i = 0; i < all.length; i += 1) {
    for (let j = i + 1; j < all.length; j += 1) {
      const a = all[i]!;
      const b = all[j]!;
      if (a.report_type !== b.report_type) continue;
      const dist = distanceMeters(a, b);
      if (dist === null || dist > DUPLICATE_RULE.radiusMeters) continue;
      const days =
        Math.abs(new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) / 86_400_000;
      if (days > DUPLICATE_RULE.windowDays) continue;
      (map[a.id] ??= []).push(b.id);
      (map[b.id] ??= []).push(a.id);
    }
  }
  return map;
}
