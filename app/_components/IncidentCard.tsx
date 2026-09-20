import Link from "next/link";
import type { IncidentSummary } from "@/lib/engine";

const RESOLUTION_LABEL: Record<string, { text: string; tone: string }> = {
  duplicate_blocked: { text: "DUPLICATE BLOCKED", tone: "text-accent-red" },
  cleared: { text: "CLEARED", tone: "text-accent-green" },
  pending_human: { text: "PENDING HUMAN", tone: "text-accent-orange" },
};

export function IncidentCard({ incident }: { incident: IncidentSummary }) {
  const meta = RESOLUTION_LABEL[incident.handoff.resolution];
  return (
    <Link
      href={`/incident/${incident.incidentId}`}
      className="rl-panel block rounded-sm p-5 transition hover:border-border-strong"
    >
      <div className="flex items-center justify-between">
        <span className="rl-mono text-[13px] font-semibold uppercase tracking-widest text-text-dim">{incident.incidentId}</span>
        <span className={`rl-mono text-[13px] font-bold uppercase tracking-widest ${meta.tone}`}>{meta.text}</span>
      </div>
      <div className="mt-2 text-sm font-medium text-text">{incident.handoff.vendorName}</div>
      <div className="mt-1 text-sm text-text-faint">
        {incident.handoff.poId} · {incident.memberEvaluations.length} invoice(s) · ${incident.handoff.amount.toLocaleString()}
      </div>
      <div className="rl-mono mt-3 text-sm text-text-dim">
        score {incident.finalEvaluation.score.total.toFixed(2)} · {incident.finalEvaluation.score.controlVersion} · resolved by{" "}
        {incident.handoff.resolvedBy}
      </div>
    </Link>
  );
}
