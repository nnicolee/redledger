export type FeatureKey =
  | "vendor_match"
  | "amount_match"
  | "aggregate_amount_match"
  | "po_overlap"
  | "service_period_overlap"
  | "line_item_similarity"
  | "invoice_id_similarity"
  | "timing_similarity";

export type MatchRule =
  | "exact_name"
  | "name_or_subsidiary"
  | "exact_amount"
  | "sum_matches_po_obligation"
  | "same_po_id"
  | "date_range_overlap"
  | "text_similarity"
  | "edit_distance"
  | "days_between";

export interface ControlFeatureConfig {
  feature: FeatureKey;
  weight: number;
  matchRule: MatchRule;
}

export interface ControlVersion {
  version: "v1" | "v2";
  controlId: string;
  createdAt: string;
  incidentId: string | null;
  note: string;
  features: ControlFeatureConfig[];
}

export interface DateRange {
  start: string;
  end: string;
}

export interface Vendor {
  id: string;
  name: string;
}

export interface PurchaseOrder {
  id: string;
  vendorId: string;
  amount: number;
  servicePeriod: DateRange;
  description: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  vendorId: string;
  poId: string;
  amount: number;
  servicePeriod: DateRange;
  lineItemDescription: string;
  submittedAt: string;
}

export interface FeatureScore {
  feature: FeatureKey;
  active: boolean;
  raw: number;
  weight: number;
  contribution: number;
}

export interface ScoreResult {
  invoiceId: string;
  controlVersion: "v1" | "v2";
  controlId: string;
  total: number;
  features: FeatureScore[];
}

export type EscalationPath = "pass" | "auditor_review" | "auto_hold";
export type ResolutionState = "cleared" | "duplicate_blocked" | "pending_human";

export interface AgentNote {
  role: "ap_preparer" | "auditor" | "control_generator" | "chaos_cfo" | "treasury_agent" | "close_agent";
  label: string;
  text: string;
}

export interface HandoffRecord {
  incidentId: string;
  vendorId: string;
  vendorName: string;
  invoiceIds: string[];
  poId: string;
  amount: number;
  path: EscalationPath;
  resolution: ResolutionState;
  resolvedBy: "auto" | "human" | "pending";
  reason: string;
  controlVersionUsed: "v1" | "v2";
  timestamp: string;
}

export interface EvaluationResult {
  invoice: Invoice;
  vendor: Vendor;
  po: PurchaseOrder;
  relatedInvoices: Invoice[];
  score: ScoreResult;
  path: EscalationPath;
  agentNotes: AgentNote[];
  handoff: HandoffRecord | null;
  isPlantedIncident: boolean;
  incidentId: string | null;
}
