export function StatCard({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "red" | "green" | "orange";
}) {
  const toneClass =
    tone === "red" ? "text-accent-red" : tone === "green" ? "text-accent-green" : tone === "orange" ? "text-accent-orange" : "text-text";
  return (
    <div className="rl-panel rounded-sm p-5">
      <div className="rl-mono text-sm font-semibold uppercase tracking-widest text-text-dim">{label}</div>
      <div className={`rl-mono mt-2 text-4xl font-bold ${toneClass}`}>{value}</div>
      {sub ? <div className="mt-1 text-sm font-medium text-text-faint">{sub}</div> : null}
    </div>
  );
}
