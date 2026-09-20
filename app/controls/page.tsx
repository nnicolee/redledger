import { Shell } from "@/app/_components/Shell";
import { ControlDiffBlock } from "@/app/_components/ControlDiffBlock";
import { CONTROL_V1, CONTROL_V2, FEATURE_LIBRARY } from "@/lib/controls";
import { runSimulation } from "@/lib/engine";
import Link from "next/link";

function ControlTable({ version }: { version: typeof CONTROL_V1 }) {
  return (
    <div className="rl-panel rounded-sm p-5">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="rl-mono text-lg font-bold text-text">{version.version}</span>
        <span className="rl-mono text-[13px] text-text-faint">{version.createdAt}</span>
      </div>
      <p className="mb-4 text-sm text-text-dim">{version.note}</p>
      <table className="w-full text-left text-sm">
        <thead className="rl-mono text-text-faint">
          <tr>
            <th className="py-1 pr-2">Feature</th>
            <th className="py-1 pr-2">Weight</th>
            <th className="py-1">Match rule</th>
          </tr>
        </thead>
        <tbody className="rl-mono">
          {version.features.map((f) => (
            <tr key={f.feature} className={f.weight === 0 ? "opacity-30" : ""}>
              <td className="py-1 pr-2 text-text">{FEATURE_LIBRARY[f.feature].label}</td>
              <td className="py-1 pr-2 text-accent-cyan">{f.weight.toFixed(2)}</td>
              <td className="py-1 text-text-dim">{f.matchRule}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ControlsPage() {
  const sim = runSimulation();
  return (
    <Shell>
      <h1 className="rl-serif mb-2 text-4xl font-bold text-text">Control History</h1>
      <p className="mb-8 max-w-2xl text-base leading-relaxed text-text-dim">
        A control is a stored record — a set of predefined features, each with a weight and a match rule — never
        executable code a model writes at runtime. Every version is validated against that fixed schema before
        it&apos;s stored.
      </p>

      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <ControlTable version={CONTROL_V1} />
        <ControlTable version={CONTROL_V2} />
      </div>

      <h2 className="rl-mono mb-3 text-sm font-bold uppercase tracking-widest text-text">v1 → v2 Diff</h2>
      <ControlDiffBlock diff={sim.controlDiff} />

      <div className="mt-6">
        <Link href="/incident/INC-014" className="rl-mono text-sm text-accent-cyan hover:underline">
          → INC-014 — the incident that produced v2
        </Link>
      </div>
    </Shell>
  );
}
