import type { ScoreResult } from "@/lib/types";
import { FEATURE_LIBRARY } from "@/lib/controls";

function pathColor(total: number) {
  if (total < 0.45) return "text-accent-green";
  if (total <= 0.8) return "text-accent-orange";
  return "text-accent-red";
}

export function ScoreBreakdown({ score }: { score: ScoreResult }) {
  return (
    <div className="rl-panel rounded-sm p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <div className="rl-mono text-[13px] font-semibold uppercase tracking-widest text-text-dim">
          {score.controlId} · {score.controlVersion}
        </div>
        <div className={`rl-mono text-2xl font-bold ${pathColor(score.total)}`}>{score.total.toFixed(3)}</div>
      </div>
      <div className="space-y-2.5">
        {score.features.map((f) => (
          <div key={f.feature} className={f.active ? "" : "opacity-35"}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="rl-mono text-text-dim">{FEATURE_LIBRARY[f.feature].label}</span>
              <span className="rl-mono text-text-faint">
                {f.active ? `${f.raw.toFixed(2)} × ${f.weight.toFixed(2)} = ${f.contribution.toFixed(3)}` : "inactive"}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-panel-raised">
              <div
                className="h-full rounded-full bg-accent-cyan transition-all"
                style={{ width: `${Math.round(f.raw * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
