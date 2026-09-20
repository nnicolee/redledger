const NODES = ["Invoice", "PO", "Control", "Auditor", "Resolution"] as const;

export function DependencyGraph({
  contained,
  labels,
}: {
  contained: boolean;
  labels?: Partial<Record<(typeof NODES)[number], string>>;
}) {
  const color = contained ? "var(--accent-green)" : "var(--accent-red)";
  const width = 900;
  const height = 140;
  const baseY = 60;
  const xs = [70, 275, 480, 685, 860];
  const ys = xs.map((_, i) => baseY + (i % 2 === 0 ? -6 : 6));

  const threadD = xs
    .map((x, i) => {
      if (i === 0) return `M${x},${ys[i]}`;
      const prevX = xs[i - 1];
      const prevY = ys[i - 1];
      const midX = (prevX + x) / 2;
      return `C${midX},${prevY} ${midX},${ys[i]} ${x},${ys[i]}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Thread graph from invoice to resolution">
      <defs>
        <filter id="rl-thread-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path d={threadD} fill="none" stroke="var(--border-strong)" strokeWidth={1.25} opacity={0.6} />
      <path d={threadD} fill="none" stroke={color} strokeWidth={1.5} filter="url(#rl-thread-glow)" opacity={0.85} />
      <circle r={4} fill={color}>
        <animateMotion dur="3.2s" repeatCount="indefinite" path={threadD} />
      </circle>
      {xs.map((x, i) => (
        <g key={NODES[i]}>
          <line x1={x - 7} y1={ys[i] - 7} x2={x + 7} y2={ys[i] + 7} stroke={i === xs.length - 1 ? color : "var(--border-strong)"} strokeWidth={2} />
          <line x1={x - 7} y1={ys[i] + 7} x2={x + 7} y2={ys[i] - 7} stroke={i === xs.length - 1 ? color : "var(--border-strong)"} strokeWidth={2} />
          <circle cx={x} cy={ys[i]} r={3} fill="var(--bg-panel)" stroke={i === xs.length - 1 ? color : "var(--border-strong)"} strokeWidth={1.5} />
          <text x={x} y={baseY + 44} textAnchor="middle" className="rl-mono" fontSize="11" fill="var(--text-dim)">
            {NODES[i].toUpperCase()}
          </text>
          {labels?.[NODES[i]] ? (
            <text x={x} y={baseY + 60} textAnchor="middle" className="rl-mono" fontSize="10" fill="var(--text-faint)">
              {labels[NODES[i]]}
            </text>
          ) : null}
        </g>
      ))}
    </svg>
  );
}
