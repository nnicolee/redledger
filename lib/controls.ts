import type { ControlVersion, FeatureKey, MatchRule } from "./types";

export const FEATURE_LIBRARY: Record<FeatureKey, { label: string; description: string; defaultRule: MatchRule }> = {
  vendor_match: {
    label: "Vendor match",
    description: "Same vendor as a prior invoice already on record for this PO.",
    defaultRule: "exact_name",
  },
  amount_match: {
    label: "Amount match",
    description: "This invoice's amount exactly matches an already-recognized invoice for the PO.",
    defaultRule: "exact_amount",
  },
  aggregate_amount_match: {
    label: "Aggregate amount match",
    description: "Sum of this invoice plus related invoices matches the PO's obligation.",
    defaultRule: "sum_matches_po_obligation",
  },
  po_overlap: {
    label: "PO overlap",
    description: "Shares a purchase order with a prior invoice on record.",
    defaultRule: "same_po_id",
  },
  service_period_overlap: {
    label: "Service period overlap",
    description: "Invoiced service dates overlap an already-recognized period for the PO.",
    defaultRule: "date_range_overlap",
  },
  line_item_similarity: {
    label: "Line-item similarity",
    description: "Text similarity between this invoice's line items and a related invoice's.",
    defaultRule: "text_similarity",
  },
  invoice_id_similarity: {
    label: "Invoice ID similarity",
    description: "Edit distance between this invoice's number and a related invoice's.",
    defaultRule: "edit_distance",
  },
  timing_similarity: {
    label: "Timing similarity",
    description: "How close in time this invoice was submitted to a related invoice.",
    defaultRule: "days_between",
  },
};

const ALLOWED_MATCH_RULES: MatchRule[] = [
  "exact_name",
  "name_or_subsidiary",
  "exact_amount",
  "sum_matches_po_obligation",
  "same_po_id",
  "date_range_overlap",
  "text_similarity",
  "edit_distance",
  "days_between",
];

export const CONTROL_V1: ControlVersion = {
  version: "v1",
  controlId: "DUPLICATE_VENDOR_PAYMENT",
  createdAt: "2026-09-01",
  incidentId: null,
  note: "Initial control. Checks each invoice individually against prior invoices for the same vendor and PO.",
  features: [
    { feature: "vendor_match", weight: 0.25, matchRule: "exact_name" },
    { feature: "amount_match", weight: 0.25, matchRule: "exact_amount" },
    { feature: "aggregate_amount_match", weight: 0, matchRule: "sum_matches_po_obligation" },
    { feature: "po_overlap", weight: 0.2, matchRule: "same_po_id" },
    { feature: "service_period_overlap", weight: 0, matchRule: "date_range_overlap" },
    { feature: "line_item_similarity", weight: 0, matchRule: "text_similarity" },
    { feature: "invoice_id_similarity", weight: 0.1, matchRule: "edit_distance" },
    { feature: "timing_similarity", weight: 0.05, matchRule: "days_between" },
  ],
};

export const CONTROL_V2: ControlVersion = {
  version: "v2",
  controlId: "DUPLICATE_VENDOR_PAYMENT",
  createdAt: "2026-09-30",
  incidentId: "INC-014",
  note: "Learned after INC-014: a vendor obligation split across multiple invoices evaded per-invoice matching. Deactivates amount_match and invoice_id_similarity; activates aggregate_amount_match, service_period_overlap, and line_item_similarity.",
  features: [
    { feature: "vendor_match", weight: 0.25, matchRule: "exact_name" },
    { feature: "amount_match", weight: 0, matchRule: "exact_amount" },
    { feature: "aggregate_amount_match", weight: 0.25, matchRule: "sum_matches_po_obligation" },
    { feature: "po_overlap", weight: 0.2, matchRule: "same_po_id" },
    { feature: "service_period_overlap", weight: 0.15, matchRule: "date_range_overlap" },
    { feature: "line_item_similarity", weight: 0.1, matchRule: "text_similarity" },
    { feature: "invoice_id_similarity", weight: 0, matchRule: "edit_distance" },
    { feature: "timing_similarity", weight: 0.05, matchRule: "days_between" },
  ],
};

export interface ControlDiffRow {
  feature: FeatureKey;
  before: number;
  after: number;
  status: "added" | "removed" | "unchanged" | "reweighted";
}

export function diffControls(before: ControlVersion, after: ControlVersion): ControlDiffRow[] {
  return after.features.map((afterCfg) => {
    const beforeCfg = before.features.find((f) => f.feature === afterCfg.feature)!;
    let status: ControlDiffRow["status"] = "unchanged";
    if (beforeCfg.weight === 0 && afterCfg.weight > 0) status = "added";
    else if (beforeCfg.weight > 0 && afterCfg.weight === 0) status = "removed";
    else if (beforeCfg.weight !== afterCfg.weight) status = "reweighted";
    return { feature: afterCfg.feature, before: beforeCfg.weight, after: afterCfg.weight, status };
  });
}

/**
 * Guardrail on Control Generator output: a candidate control may only select
 * predefined feature keys, assign a weight in [0, 1], and pick a supported
 * match rule. Anything else is rejected rather than stored.
 */
export function validateControl(candidate: ControlVersion): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const knownFeatures = Object.keys(FEATURE_LIBRARY) as FeatureKey[];
  for (const cfg of candidate.features) {
    if (!knownFeatures.includes(cfg.feature)) errors.push(`Unknown feature key: ${cfg.feature}`);
    if (cfg.weight < 0 || cfg.weight > 1) errors.push(`Weight out of range for ${cfg.feature}: ${cfg.weight}`);
    if (!ALLOWED_MATCH_RULES.includes(cfg.matchRule)) errors.push(`Unsupported match rule for ${cfg.feature}: ${cfg.matchRule}`);
  }
  return { valid: errors.length === 0, errors };
}
