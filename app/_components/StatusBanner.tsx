export function StatusBanner({
  tone,
  title,
  subtitle,
}: {
  tone: "red" | "green" | "orange";
  title: string;
  subtitle?: string;
}) {
  const toneClasses =
    tone === "green"
      ? "border-accent-green text-accent-green rl-glow-green"
      : tone === "orange"
        ? "border-accent-orange text-accent-orange rl-glow-orange"
        : "border-accent-red text-accent-red rl-glow-red";

  return (
    <div className={`rounded-sm border bg-bg-panel px-6 py-5 ${toneClasses}`}>
      <div className="rl-serif text-3xl font-bold tracking-wide">{title}</div>
      {subtitle ? <div className="rl-mono mt-2 text-sm text-text-dim">{subtitle}</div> : null}
    </div>
  );
}
