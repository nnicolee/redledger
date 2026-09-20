import type { ControlDiffRow } from "@/lib/controls";
import { FEATURE_LIBRARY } from "@/lib/controls";

export function ControlDiffBlock({ diff, title }: { diff: ControlDiffRow[]; title?: string }) {
  return (
    <div className="rl-panel-raised rounded-sm p-5">
      {title ? <div className="rl-mono mb-3 text-[13px] font-semibold uppercase tracking-widest text-text-dim">{title}</div> : null}
      <pre className="rl-mono overflow-x-auto text-[13px] leading-6">
        {diff.map((row) => {
          const label = FEATURE_LIBRARY[row.feature].label;
          if (row.status === "unchanged") {
            return (
              <div key={row.feature} className="text-text-faint">
                {"  "}
                {row.feature} <span className="text-text-faint">({label}, w={row.after})</span>
              </div>
            );
          }
          if (row.status === "removed") {
            return (
              <div key={row.feature} className="text-accent-red">
                {"- "}
                {row.feature} <span className="text-text-faint">({label})</span>
              </div>
            );
          }
          if (row.status === "added") {
            return (
              <div key={row.feature} className="text-accent-green">
                {"+ "}
                {row.feature} <span className="text-text-faint">({label}, w={row.after})</span>
              </div>
            );
          }
          return (
            <div key={row.feature} className="text-accent-orange">
              {"~ "}
              {row.feature} <span className="text-text-faint">(w {row.before} → {row.after})</span>
            </div>
          );
        })}
      </pre>
    </div>
  );
}
