import { notFound } from "next/navigation";
import Link from "next/link";
import { Shell } from "@/app/_components/Shell";
import { StatusBanner } from "@/app/_components/StatusBanner";
import { DependencyGraph } from "@/app/_components/DependencyGraph";
import { ScoreBreakdown } from "@/app/_components/ScoreBreakdown";
import { AgentNoteList } from "@/app/_components/AgentNoteList";
import { ControlDiffBlock } from "@/app/_components/ControlDiffBlock";
import { getIncidentById, runSimulation } from "@/lib/engine";

export function generateStaticParams() {
  return [{ id: "INC-014" }, { id: "INC-021" }, { id: "INC-META-MERIDIAN" }];
}

export default async function IncidentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const incident = getIncidentById(id);
  if (!incident) notFound();

  const sim = runSimulation();
  const isOctoberCatch = incident.incidentId === "INC-021";
  const isSeptemberMiss = incident.incidentId === "INC-014";
  const isCleared = incident.handoff.resolution === "cleared";

  const banner = isOctoberCatch
    ? { tone: "green" as const, title: "THREAT CONTAINED", subtitle: `Triggered by ${incident.finalEvaluation.score.controlId} ${incident.finalEvaluation.score.controlVersion} — learned from INC-014` }
    : isCleared
      ? { tone: "green" as const, title: "CLEARED — LEGITIMATE", subtitle: "Auditor judgment: phased billing, not a duplicate" }
      : { tone: "orange" as const, title: "DUPLICATE CONFIRMED — HUMAN REVIEW", subtitle: `${incident.finalEvaluation.score.controlVersion} did not catch this automatically` };

  return (
    <Shell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="rl-mono text-sm uppercase tracking-widest text-text-dim">{incident.incidentId}</div>
          <h1 className="rl-serif mt-1 text-3xl font-bold text-text">
            {incident.handoff.vendorName} <span className="rl-mono text-xl text-text-faint">· {incident.handoff.poId}</span>
          </h1>
        </div>
        <Link href="/" className="rl-mono text-sm text-text-dim hover:text-text">
          ← Control Room
        </Link>
      </div>

      <div className="mb-8">
        <StatusBanner {...banner} />
      </div>

      <div className="rl-panel mb-8 rounded-sm p-6">
        <DependencyGraph contained={incident.handoff.resolution !== "pending_human"} />
      </div>

      <div className="mb-8">
        <h2 className="rl-mono mb-3 text-sm font-bold uppercase tracking-widest text-text">Invoice Timeline</h2>
        <div className="rl-panel overflow-hidden rounded-sm">
          <table className="w-full text-left text-sm">
            <thead className="rl-mono border-b border-border text-[13px] font-semibold uppercase tracking-widest text-text-dim">
              <tr>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Service Period</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Path</th>
              </tr>
            </thead>
            <tbody>
              {incident.memberEvaluations.map((ev) => (
                <tr key={ev.invoice.id} className="rl-mono border-b border-border text-sm last:border-0">
                  <td className="px-4 py-3 text-text">{ev.invoice.invoiceNumber}</td>
                  <td className="px-4 py-3 text-text-dim">${ev.invoice.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-text-dim">
                    {ev.invoice.servicePeriod.start} → {ev.invoice.servicePeriod.end}
                  </td>
                  <td className="px-4 py-3 text-text-dim">{ev.invoice.submittedAt}</td>
                  <td className="px-4 py-3 text-text">{ev.score.total.toFixed(3)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        ev.path === "auto_hold" ? "text-accent-red" : ev.path === "auditor_review" ? "text-accent-orange" : "text-text-faint"
                      }
                    >
                      {ev.path}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="rl-mono mb-3 text-sm font-bold uppercase tracking-widest text-text">
            Final Score — {incident.finalEvaluation.invoice.invoiceNumber}
          </h2>
          <ScoreBreakdown score={incident.finalEvaluation.score} />
        </div>
        <div>
          <h2 className="rl-mono mb-3 text-sm font-bold uppercase tracking-widest text-text">Agent Trace</h2>
          <AgentNoteList
            notes={[
              ...incident.finalEvaluation.agentNotes,
              ...(incident.controlGeneratorNote ? [incident.controlGeneratorNote] : []),
              incident.treasuryNote,
              incident.closeNote,
            ]}
          />
        </div>
      </div>

      {isSeptemberMiss ? (
        <div className="mb-8">
          <h2 className="rl-mono mb-3 text-sm font-bold uppercase tracking-widest text-text">
            Control Generated From This Incident
          </h2>
          <ControlDiffBlock diff={sim.controlDiff} title="DUPLICATE_VENDOR_PAYMENT v1 → v2" />
        </div>
      ) : null}

      {isOctoberCatch ? (
        <div className="mb-8">
          <h2 className="rl-mono mb-3 text-sm font-bold uppercase tracking-widest text-text">Control That Fired</h2>
          <ControlDiffBlock diff={sim.controlDiff} title="Active control: DUPLICATE_VENDOR_PAYMENT v2 (from INC-014)" />
          <Link href="/incident/INC-014" className="rl-mono mt-3 inline-block text-sm text-accent-cyan hover:underline">
            → View the September incident that produced this control
          </Link>
        </div>
      ) : null}

      <div className="rl-panel rounded-sm p-5">
        <div className="rl-mono mb-2 text-[13px] font-semibold uppercase tracking-widest text-text-dim">Handoff Record</div>
        <pre className="rl-mono overflow-x-auto text-sm text-text-dim">
{JSON.stringify(incident.handoff, null, 2)}
        </pre>
      </div>
    </Shell>
  );
}
