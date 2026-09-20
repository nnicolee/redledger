import type { AgentNote, FeatureScore, HandoffRecord, Invoice, PurchaseOrder, ScoreResult, Vendor } from "./types";
import type { ControlDiffRow } from "./controls";
import { FEATURE_LIBRARY } from "./controls";

function feat(score: ScoreResult, key: string): FeatureScore | undefined {
  return score.features.find((f) => f.feature === key);
}

function money(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

/** AP Preparer: sees only this invoice, its PO, and this vendor's history. */
export function apPreparerNote(invoice: Invoice, po: PurchaseOrder, vendor: Vendor, related: Invoice[]): AgentNote {
  const text =
    related.length === 0
      ? `Invoice ${invoice.invoiceNumber} references ${po.id} for ${vendor.name}, ${money(invoice.amount)}. No prior invoice on record for this PO. Vendor and PO fields match. Appears valid.`
      : `Invoice ${invoice.invoiceNumber} references ${po.id} for ${vendor.name}, ${money(invoice.amount)}. ${related.length} prior invoice(s) already on record for this PO. Extracted fields match vendor and PO records; no exact prior-invoice match at this amount.`;
  return { role: "ap_preparer", label: "AP Preparer", text };
}

/** Auditor: broader context (bank activity, prior controls, prior close decisions,
 * cross-vendor anomaly signals) — but the escalation path is decided by the fixed
 * thresholds, never by a number the Auditor invents. */
export function auditorNote(
  score: ScoreResult,
  path: "pass" | "auditor_review" | "auto_hold",
  invoice: Invoice,
  po: PurchaseOrder,
  vendor: Vendor,
  related: Invoice[]
): AgentNote {
  if (path === "pass") {
    return { role: "auditor", label: "Auditor", text: `Score ${score.total.toFixed(2)} — below review threshold. No action.` };
  }

  const agg = feat(score, "aggregate_amount_match");
  const period = feat(score, "service_period_overlap");
  const line = feat(score, "invoice_id_similarity");

  if (agg && agg.active && agg.raw > 0.9 && period && period.active && period.raw < 0.3) {
    return {
      role: "auditor",
      label: "Auditor",
      text: `${vendor.name}'s invoices against ${po.id} sum to the recognized obligation (${money(po.amount)}), but the service periods don't overlap — ${related
        .map((r) => `${r.servicePeriod.start}–${r.servicePeriod.end}`)
        .join(", ")} vs. ${invoice.servicePeriod.start}–${invoice.servicePeriod.end}. Reads as sequential phased billing, not a duplicate. Clearing.`,
    };
  }

  if (path === "auto_hold") {
    return {
      role: "auditor",
      label: "Auditor",
      text: `${vendor.name}: ${related.length + 1} invoices against ${po.id} sum to ${money(po.amount)} with overlapping service periods and near-identical line items. Control ${score.controlId} ${score.controlVersion} fired at ${score.total.toFixed(2)}. Holding automatically.`,
    };
  }

  return {
    role: "auditor",
    label: "Auditor",
    text: `${vendor.name}: invoice ${invoice.invoiceNumber} against ${po.id} scores ${score.total.toFixed(
      2
    )} — vendor, PO, and timing line up with a prior invoice, but ${line && line.active ? "invoice numbering differs and " : ""}nothing in the active control confirms it outright. Escalating for human review.`,
  };
}

export function controlGeneratorNote(incidentId: string, diff: ControlDiffRow[]): AgentNote {
  const added = diff.filter((d) => d.status === "added").map((d) => FEATURE_LIBRARY[d.feature].label);
  const removed = diff.filter((d) => d.status === "removed").map((d) => FEATURE_LIBRARY[d.feature].label);
  return {
    role: "control_generator",
    label: "Control Generator",
    text: `Human correction on ${incidentId}: obligation was split across multiple invoices, evading per-invoice matching. Deactivating ${removed.join(
      ", "
    )}. Activating ${added.join(", ")}. Validated against the feature schema. Publishing as v2.`,
  };
}

export function chaosCfoNote(reasoning: string): AgentNote {
  return { role: "chaos_cfo", label: "Chaos CFO", text: reasoning };
}

export function treasuryAgentNote(handoff: HandoffRecord): AgentNote {
  if (handoff.resolution === "duplicate_blocked") {
    return {
      role: "treasury_agent",
      label: "Treasury / Forecast Agent",
      text: `Held ${money(handoff.amount)} for ${handoff.vendorName} pending review. 13-week cash forecast and AP balance unchanged until ${handoff.incidentId} resolves.`,
    };
  }
  return {
    role: "treasury_agent",
    label: "Treasury / Forecast Agent",
    text: `${money(handoff.amount)} for ${handoff.vendorName} cleared into the payment run. Cash forecast and AP balance updated.`,
  };
}

export function closeAgentNote(handoff: HandoffRecord): AgentNote {
  if (handoff.resolution === "duplicate_blocked") {
    return {
      role: "close_agent",
      label: "Close / Audit-Evidence Agent",
      text: `Close exception opened and resolved for ${handoff.incidentId}: duplicate payment prevented, ${money(
        handoff.amount
      )}. Audit note written citing ${handoff.controlVersionUsed} and resolver "${handoff.resolvedBy}".`,
    };
  }
  return {
    role: "close_agent",
    label: "Close / Audit-Evidence Agent",
    text: `No close exception for ${handoff.incidentId} — invoice cleared under ${handoff.controlVersionUsed}.`,
  };
}
