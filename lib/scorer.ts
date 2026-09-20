import type {
  ControlVersion,
  FeatureKey,
  FeatureScore,
  Invoice,
  PurchaseOrder,
  ScoreResult,
} from "./types";

function daysBetween(a: string, b: string): number {
  const ms = Math.abs(new Date(a).getTime() - new Date(b).getTime());
  return ms / (1000 * 60 * 60 * 24);
}

function rangeOverlapDays(a: { start: string; end: string }, b: { start: string; end: string }): number {
  const start = Math.max(new Date(a.start).getTime(), new Date(b.start).getTime());
  const end = Math.min(new Date(a.end).getTime(), new Date(b.end).getTime());
  return Math.max(0, (end - start) / (1000 * 60 * 60 * 24));
}

function rangeLengthDays(a: { start: string; end: string }): number {
  return Math.max(1, (new Date(a.end).getTime() - new Date(a.start).getTime()) / (1000 * 60 * 60 * 24));
}

function wordSet(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
  );
}

function jaccard(a: string, b: string): number {
  const sa = wordSet(a);
  const sb = wordSet(b);
  const intersection = [...sa].filter((w) => sb.has(w)).length;
  const union = new Set([...sa, ...sb]).size;
  return union === 0 ? 0 : intersection / union;
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function editSimilarity(a: string, b: string): number {
  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length, 1);
  return Math.max(0, 1 - dist / maxLen);
}

/**
 * Every feature is a pure function of (currentInvoice, relatedInvoices, po).
 * R = other invoices already submitted for the same vendor + PO, within the
 * lookback window the engine builds. An empty R means "nothing to compare
 * against" and every cross-invoice feature is 0 by construction — this is
 * what keeps the clean base set at score 0 without special-casing it.
 */
const featureFns: Record<FeatureKey, (I: Invoice, R: Invoice[], po: PurchaseOrder) => number> = {
  vendor_match: (I, R) => (R.length === 0 ? 0 : R.every((r) => r.vendorId === I.vendorId) ? 1 : 0),

  amount_match: (I, R) => (R.some((r) => Math.abs(r.amount - I.amount) < 0.01) ? 1 : 0),

  aggregate_amount_match: (I, R, po) => {
    if (R.length === 0) return 0;
    const sum = I.amount + R.reduce((s, r) => s + r.amount, 0);
    const diff = Math.abs(sum - po.amount);
    return Math.max(0, 1 - diff / po.amount);
  },

  po_overlap: (I, R) => (R.length === 0 ? 0 : R.every((r) => r.poId === I.poId) ? 1 : 0),

  service_period_overlap: (I, R) => {
    if (R.length === 0) return 0;
    const ratios = R.map((r) => rangeOverlapDays(I.servicePeriod, r.servicePeriod) / rangeLengthDays(I.servicePeriod));
    return Math.min(1, Math.max(...ratios));
  },

  line_item_similarity: (I, R) => {
    if (R.length === 0) return 0;
    return Math.max(...R.map((r) => jaccard(I.lineItemDescription, r.lineItemDescription)));
  },

  invoice_id_similarity: (I, R) => {
    if (R.length === 0) return 0;
    return Math.max(...R.map((r) => editSimilarity(I.invoiceNumber, r.invoiceNumber)));
  },

  timing_similarity: (I, R) => {
    if (R.length === 0) return 0;
    const minDays = Math.min(...R.map((r) => daysBetween(I.submittedAt, r.submittedAt)));
    return Math.max(0, 1 - minDays / 20);
  },
};

/**
 * score(I, R, PO, C) = sum over C.active features of weight_i * f_i(I, R, PO).
 * The control (C) determines which features are summed and at what weight;
 * this function never changes between versions, only the control does.
 */
export function score(invoice: Invoice, related: Invoice[], po: PurchaseOrder, control: ControlVersion): ScoreResult {
  const features: FeatureScore[] = control.features.map((cfg) => {
    const raw = cfg.weight > 0 ? featureFns[cfg.feature](invoice, related, po) : 0;
    return {
      feature: cfg.feature,
      active: cfg.weight > 0,
      raw,
      weight: cfg.weight,
      contribution: raw * cfg.weight,
    };
  });
  const total = features.reduce((s, f) => s + f.contribution, 0);
  return {
    invoiceId: invoice.id,
    controlVersion: control.version,
    controlId: control.controlId,
    total: Math.round(total * 1000) / 1000,
    features,
  };
}

export const THRESHOLDS = {
  pass: 0.45,
  hold: 0.8,
} as const;

export function pathForScore(total: number): "pass" | "auditor_review" | "auto_hold" {
  if (total < THRESHOLDS.pass) return "pass";
  if (total <= THRESHOLDS.hold) return "auditor_review";
  return "auto_hold";
}
