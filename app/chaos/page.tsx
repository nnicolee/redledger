"use client";

import { useState } from "react";
import Link from "next/link";
import { Shell } from "@/app/_components/Shell";
import { ScoreBreakdown } from "@/app/_components/ScoreBreakdown";
import { StatusBanner } from "@/app/_components/StatusBanner";
import { generateChaosCandidate, type ChaosCandidate } from "@/lib/chaos-generator";

type Phase = "idle" | "searching" | "result";

export default function ChaosPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [candidate, setCandidate] = useState<ChaosCandidate | null>(null);

  function activate() {
    setPhase("searching");
    setCandidate(null);
    window.setTimeout(() => {
      const c = generateChaosCandidate();
      setCandidate(c);
      setPhase("result");
    }, 1600);
  }

  return (
    <Shell>
      <div className="mb-8">
        <div className="rl-mono text-sm uppercase tracking-[0.3em] text-accent-red">Adversarial Review</div>
        <h1 className="rl-serif mt-2 text-4xl font-bold text-text">Chaos CFO</h1>
        <p className="rl-serif mt-1 text-lg italic text-accent-red">Find the blind spot.</p>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-text-dim">
          Reads the currently active control (v2, learned from INC-014) and generates a new split-obligation
          scenario — different amounts, split count, period offsets, and wording — then runs it through the same
          deterministic scorer. No hardcoded outcome: whether it&apos;s caught depends on whether v2 actually
          generalizes, computed live in your browser.
        </p>
      </div>

      <div className="rl-panel mb-8 rounded-sm p-8 text-center">
        {phase === "idle" ? (
          <button
            onClick={activate}
            className="rl-mono rl-glow-red rounded-sm border border-accent-red px-6 py-3 text-sm font-bold uppercase tracking-widest text-accent-red transition hover:bg-accent-red/10"
          >
            Activate Chaos CFO
          </button>
        ) : null}
        {phase === "searching" ? (
          <div className="rl-mono rl-blink text-lg font-bold uppercase tracking-widest text-accent-red">
            Searching for control blind spots...
          </div>
        ) : null}
        {phase === "result" && candidate ? (
          <button
            onClick={activate}
            className="rl-mono rounded-sm border border-border-strong px-4 py-2 text-sm uppercase tracking-widest text-text-dim transition hover:text-text"
          >
            Generate Another
          </button>
        ) : null}
      </div>

      {phase === "result" && candidate ? (
        <div className="space-y-6">
          <StatusBanner
            tone={candidate.evaded ? "red" : "green"}
            title={candidate.evaded ? "BLIND SPOT FOUND" : "THREAT CONTAINED"}
            subtitle={
              candidate.evaded
                ? `Score ${candidate.finalScore.total.toFixed(3)} — under the v2 auto-hold threshold (0.80). Candidate control needed.`
                : `Score ${candidate.finalScore.total.toFixed(3)} — v2 caught it without a new human correction.`
            }
          />

          <div className="rl-panel rounded-sm p-5">
            <div className="rl-mono mb-3 text-[13px] font-semibold uppercase tracking-widest text-text-dim">
              Generated scenario — {candidate.vendor.name} · {candidate.po.id}
            </div>
            <table className="w-full text-left text-sm">
              <thead className="rl-mono text-text-faint">
                <tr>
                  <th className="py-1 pr-3">Invoice</th>
                  <th className="py-1 pr-3">Amount</th>
                  <th className="py-1 pr-3">Service Period</th>
                  <th className="py-1">Submitted</th>
                </tr>
              </thead>
              <tbody className="rl-mono">
                {candidate.invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="py-1 pr-3 text-text">{inv.invoiceNumber}</td>
                    <td className="py-1 pr-3 text-text-dim">${inv.amount.toLocaleString()}</td>
                    <td className="py-1 pr-3 text-text-dim">
                      {inv.servicePeriod.start} → {inv.servicePeriod.end}
                    </td>
                    <td className="py-1 text-text-dim">{inv.submittedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ScoreBreakdown score={candidate.finalScore} />
        </div>
      ) : null}

      <div className="mt-10 rl-panel rounded-sm p-5">
        <div className="rl-mono mb-2 text-[13px] font-semibold uppercase tracking-widest text-text-dim">Rehearsed Case</div>
        <p className="mb-3 text-base leading-relaxed text-text-dim">
          The validated, demo-safe scenario is INC-021 — an N-way rebill with staggered, partially overlapping
          service periods. v2 catches it automatically, citing the control learned from INC-014.
        </p>
        <Link href="/incident/INC-021" className="rl-mono text-sm text-accent-cyan hover:underline">
          → View INC-021
        </Link>
      </div>
    </Shell>
  );
}
