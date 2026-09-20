import type { AgentNote, EvaluationResult, HandoffRecord, Invoice, ScoreResult } from "./types";
import { CONTROL_V1, CONTROL_V2, diffControls } from "./controls";
import {
  CLEAN_INVOICES,
  MERIDIAN_INVOICES,
  SEPTEMBER_INVOICES,
  OCTOBER_INVOICES,
  INCIDENT_ID_SEPTEMBER,
  INCIDENT_ID_OCTOBER,
  findVendor,
  findPO,
} from "./seed-data";
import { pathForScore, score as computeScore } from "./scorer";
import { apPreparerNote, auditorNote, closeAgentNote, controlGeneratorNote, treasuryAgentNote } from "./agents";

function activeControlFor(dateIso: string) {
  return dateIso >= CONTROL_V2.createdAt ? CONTROL_V2 : CONTROL_V1;
}

type Verdict = "pass" | "hold_confident" | "review_cleared" | "review_escalate_human";

function verdictFor(scoreResult: ScoreResult, path: ReturnType<typeof pathForScore>): Verdict {
  if (path === "pass") return "pass";
  if (path === "auto_hold") return "hold_confident";
  const agg = scoreResult.features.find((f) => f.feature === "aggregate_amount_match");
  const period = scoreResult.features.find((f) => f.feature === "service_period_overlap");
  if (agg?.active && agg.raw > 0.9 && period?.active && period.raw < 0.3) return "review_cleared";
  return "review_escalate_human";
}

export interface IncidentSummary {
  incidentId: string;
  finalEvaluation: EvaluationResult;
  memberEvaluations: EvaluationResult[];
  handoff: HandoffRecord;
  controlGeneratorNote: AgentNote | null;
  treasuryNote: AgentNote;
  closeNote: AgentNote;
}

export interface SimulationResult {
  all: EvaluationResult[];
  clean: EvaluationResult[];
  septemberIncident: IncidentSummary;
  octoberIncident: IncidentSummary;
  meridianIncident: IncidentSummary;
  controlDiff: ReturnType<typeof diffControls>;
}

function groupByPO(invoices: Invoice[]): Map<string, Invoice[]> {
  const map = new Map<string, Invoice[]>();
  for (const inv of invoices) {
    const list = map.get(inv.poId) ?? [];
    list.push(inv);
    map.set(inv.poId, list);
  }
  for (const list of map.values()) list.sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
  return map;
}

function evaluateGroup(invoices: Invoice[], plantedIncidentId: string | null): EvaluationResult[] {
  const sorted = [...invoices].sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
  const results: EvaluationResult[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const invoice = sorted[i];
    const related = sorted.slice(0, i);
    const vendor = findVendor(invoice.vendorId);
    const po = findPO(invoice.poId);
    const control = activeControlFor(invoice.submittedAt);
    const sc = computeScore(invoice, related, po, control);
    const path = pathForScore(sc.total);
    const notes: AgentNote[] = [apPreparerNote(invoice, po, vendor, related)];
    if (path !== "pass") notes.push(auditorNote(sc, path, invoice, po, vendor, related));
    results.push({
      invoice,
      vendor,
      po,
      relatedInvoices: related,
      score: sc,
      path,
      agentNotes: notes,
      handoff: null,
      isPlantedIncident: plantedIncidentId !== null,
      incidentId: plantedIncidentId,
    });
  }
  return results;
}

function buildIncidentSummary(
  incidentId: string,
  members: EvaluationResult[],
  opts: { forceHumanResolution?: boolean }
): IncidentSummary {
  const final = members[members.length - 1];
  const verdict = verdictFor(final.score, final.path);
  const vendor = final.vendor;
  const po = final.po;
  const invoiceIds = members.map((m) => m.invoice.id);
  const amountTotal = members.reduce((s, m) => s + m.invoice.amount, 0);

  let resolution: HandoffRecord["resolution"];
  let resolvedBy: HandoffRecord["resolvedBy"];
  let reason: string;

  if (opts.forceHumanResolution) {
    resolution = "duplicate_blocked";
    resolvedBy = "human";
    reason = `Human review confirmed: ${vendor.name} split one ${po.id} obligation across ${members.length} invoices. Recognized as a duplicate payable and blocked.`;
  } else if (verdict === "hold_confident") {
    resolution = "duplicate_blocked";
    resolvedBy = "auto";
    reason = final.agentNotes.find((n) => n.role === "auditor")?.text ?? "Auto-held by control.";
  } else if (verdict === "review_cleared") {
    resolution = "cleared";
    resolvedBy = "auto";
    reason = final.agentNotes.find((n) => n.role === "auditor")?.text ?? "Cleared by Auditor.";
  } else {
    resolution = "pending_human";
    resolvedBy = "pending";
    reason = "Awaiting human review.";
  }

  const handoff: HandoffRecord = {
    incidentId,
    vendorId: vendor.id,
    vendorName: vendor.name,
    invoiceIds,
    poId: po.id,
    amount: amountTotal,
    path: final.path,
    resolution,
    resolvedBy,
    reason,
    controlVersionUsed: final.score.controlVersion,
    timestamp: final.invoice.submittedAt,
  };

  const finalWithHandoff: EvaluationResult = { ...final, handoff };

  return {
    incidentId,
    finalEvaluation: finalWithHandoff,
    memberEvaluations: members,
    handoff,
    controlGeneratorNote: opts.forceHumanResolution ? controlGeneratorNote(incidentId, diffControls(CONTROL_V1, CONTROL_V2)) : null,
    treasuryNote: treasuryAgentNote(handoff),
    closeNote: closeAgentNote(handoff),
  };
}

let cached: SimulationResult | null = null;

export function runSimulation(): SimulationResult {
  if (cached) return cached;

  const cleanEvals = evaluateGroup(CLEAN_INVOICES, null);

  const meridianEvals = evaluateGroup(MERIDIAN_INVOICES, "INC-META-MERIDIAN");
  const meridianIncident = buildIncidentSummary("INC-META-MERIDIAN", meridianEvals, {});

  const septEvals = evaluateGroup(SEPTEMBER_INVOICES, INCIDENT_ID_SEPTEMBER);
  const septemberIncident = buildIncidentSummary(INCIDENT_ID_SEPTEMBER, septEvals, { forceHumanResolution: true });

  const octEvals = evaluateGroup(OCTOBER_INVOICES, INCIDENT_ID_OCTOBER);
  const octoberIncident = buildIncidentSummary(INCIDENT_ID_OCTOBER, octEvals, {});

  const result: SimulationResult = {
    all: [...cleanEvals, ...meridianEvals, ...septEvals, ...octEvals],
    clean: cleanEvals,
    septemberIncident,
    octoberIncident,
    meridianIncident,
    controlDiff: diffControls(CONTROL_V1, CONTROL_V2),
  };
  cached = result;
  return result;
}

export interface MonthStats {
  month: string;
  flaggedIncidents: number;
  humanEscalations: number;
  autonomousResolutionPct: number;
}

export function computeStats(): { september: MonthStats; october: MonthStats; totalProcessed: number; cleanPassThrough: number } {
  const sim = runSimulation();
  const incidents = [sim.septemberIncident, sim.octoberIncident, sim.meridianIncident];

  const byMonth = (prefix: string) => incidents.filter((i) => i.finalEvaluation.invoice.submittedAt.startsWith(prefix));

  const build = (month: string, prefix: string): MonthStats => {
    const list = byMonth(prefix);
    const human = list.filter((i) => i.handoff.resolvedBy === "human").length;
    const flagged = list.length;
    return {
      month,
      flaggedIncidents: flagged,
      humanEscalations: human,
      autonomousResolutionPct: flagged === 0 ? 0 : Math.round(((flagged - human) / flagged) * 100),
    };
  };

  return {
    september: build("September", "2026-09"),
    october: build("October", "2026-10"),
    totalProcessed: sim.all.length,
    cleanPassThrough: sim.clean.length,
  };
}

export function getIncidentById(id: string): IncidentSummary | null {
  const sim = runSimulation();
  if (sim.septemberIncident.incidentId === id) return sim.septemberIncident;
  if (sim.octoberIncident.incidentId === id) return sim.octoberIncident;
  if (sim.meridianIncident.incidentId === id) return sim.meridianIncident;
  return null;
}
