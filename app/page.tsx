import { Shell } from "./_components/Shell";
import { StatCard } from "./_components/StatCard";
import { IncidentCard } from "./_components/IncidentCard";
import { DependencyGraph } from "./_components/DependencyGraph";
import { Mascot } from "./_components/Mascot";
import { runSimulation, computeStats } from "@/lib/engine";

export default function Home() {
  const sim = runSimulation();
  const stats = computeStats();
  const incidents = [sim.septemberIncident, sim.octoberIncident, sim.meridianIncident].sort((a, b) =>
    a.finalEvaluation.invoice.submittedAt.localeCompare(b.finalEvaluation.invoice.submittedAt)
  );

  return (
    <Shell>
      <div className="mb-10 flex items-start justify-between gap-6">
        <div>
          <div className="rl-mono text-sm uppercase tracking-[0.3em] text-accent-cyan">Autonomous Finance Control System</div>
          <h1 className="rl-serif mt-2 text-5xl font-bold tracking-tight text-text">
            Red<span className="text-accent-red">Ledger</span>
          </h1>
          <p className="rl-serif mt-2 text-xl italic text-text-dim">Autonomous finance that learns from failure.</p>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-text-dim">
            RedLedger runs accounts payable end to end: three-way match, a deterministic duplicate-risk scorer, an
            Auditor with broader context, and a Control Generator that turns human corrections into versioned,
            auditable controls. The Chaos CFO tries to find the next blind spot before it costs real money.
          </p>
        </div>
        <Mascot size={220} className="hidden shrink-0 md:block" />
      </div>

      <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Invoices Processed" value={String(stats.totalProcessed)} />
        <StatCard label="Clean Pass-Through" value={String(stats.cleanPassThrough)} sub="0 false holds" tone="green" />
        <StatCard
          label="Human Escalations"
          value={`${stats.september.humanEscalations} → ${stats.october.humanEscalations}`}
          sub="September → October"
          tone={stats.october.humanEscalations < stats.september.humanEscalations ? "green" : "orange"}
        />
        <StatCard
          label="Autonomous Resolution"
          value={`${stats.september.autonomousResolutionPct}% → ${stats.october.autonomousResolutionPct}%`}
          sub="September → October"
          tone="green"
        />
      </div>

      <div className="rl-panel mb-10 rounded-sm p-6">
        <div className="rl-mono mb-4 text-[13px] font-semibold uppercase tracking-widest text-text-dim">
          Invoice → PO → Control → Auditor → Resolution
        </div>
        <DependencyGraph contained={stats.october.humanEscalations === 0} />
      </div>

      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="rl-mono text-sm font-bold uppercase tracking-widest text-text">Flagged Incidents</h2>
        <span className="text-sm text-text-faint">Sorted chronologically — click through for the full trace</span>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {incidents.map((incident) => (
          <IncidentCard key={incident.incidentId} incident={incident} />
        ))}
      </div>
    </Shell>
  );
}
