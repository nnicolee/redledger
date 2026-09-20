import { CONTROL_V2 } from "./controls";
import { score as computeScore, pathForScore } from "./scorer";
import type { Invoice, PurchaseOrder, Vendor, ScoreResult } from "./types";

const RISKY_VENDOR_NAMES = ["Cascade Technical Services", "Ironbridge Systems Group", "Halcyon Field Services", "Wren & Colt Partners"];

const PHRASE_POOL = [
  ["Professional services retainer", "Consulting engagement, continued scope", "Advisory services — extended term"],
  ["Implementation support", "Platform configuration assistance", "Technical delivery — phase continuation"],
  ["Managed services fee", "Ongoing operations support", "Service continuation charge"],
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export interface ChaosCandidate {
  vendor: Vendor;
  po: PurchaseOrder;
  invoices: Invoice[];
  finalScore: ScoreResult;
  path: "pass" | "auditor_review" | "auto_hold";
  evaded: boolean;
}

/**
 * Procedurally builds a new split-obligation scenario — different amounts,
 * split count, period offsets, and wording each time — and runs it through
 * the SAME deterministic scorer under the currently active control (v2).
 * No model call: this is what "the adversary looks for a blind spot" means
 * in code, not narration.
 */
export function generateChaosCandidate(): ChaosCandidate {
  const vendorName = pick(RISKY_VENDOR_NAMES);
  const vendor: Vendor = { id: `v-chaos-${vendorName.toLowerCase().replace(/[^a-z]+/g, "-")}`, name: vendorName };

  const splitCount = Math.random() < 0.5 ? 2 : 3;
  const total = Math.round((6000 + Math.random() * 16000) / 100) * 100;
  const shares = Array.from({ length: splitCount }, () => 0.4 + Math.random() * 0.6);
  const shareSum = shares.reduce((a, b) => a + b, 0);
  const amounts = shares.map((s, i) =>
    i === splitCount - 1 ? total - shares.slice(0, -1).reduce((a, b, j) => a + Math.round((shares[j] / shareSum) * total), 0) : Math.round((s / shareSum) * total)
  );

  const poId = `PO-C${Math.floor(1000 + Math.random() * 8999)}`;
  const startBase = "2026-11-01";
  const periodLenDays = 30;

  const phrases = pick(PHRASE_POOL);
  const invoices: Invoice[] = amounts.map((amount, i) => {
    const offsetDays = Math.round(i * (10 + Math.random() * 15));
    const periodStart = addDays(startBase, offsetDays);
    const periodEnd = addDays(periodStart, periodLenDays);
    const submitOffset = offsetDays + Math.round(Math.random() * 4);
    return {
      id: `chaos-${i}-${Date.now()}`,
      invoiceNumber: `CH-${Math.floor(10000 + Math.random() * 89999)}`,
      vendorId: vendor.id,
      poId,
      amount,
      servicePeriod: { start: periodStart, end: periodEnd },
      lineItemDescription: phrases[i % phrases.length],
      submittedAt: addDays(startBase, submitOffset),
    };
  });

  const po: PurchaseOrder = {
    id: poId,
    vendorId: vendor.id,
    amount: amounts.reduce((a, b) => a + b, 0),
    servicePeriod: { start: startBase, end: addDays(startBase, periodLenDays + Math.round(splitCount * 12)) },
    description: `Generated engagement — ${vendorName}`,
  };

  const sorted = [...invoices].sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
  const finalInvoice = sorted[sorted.length - 1];
  const related = sorted.slice(0, -1);
  const finalScore = computeScore(finalInvoice, related, po, CONTROL_V2);
  const path = pathForScore(finalScore.total);

  return { vendor, po, invoices: sorted, finalScore, path, evaded: path !== "auto_hold" };
}
