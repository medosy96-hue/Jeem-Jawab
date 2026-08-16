"use client";

/** عداد تنازلي دائري */
export function CountdownRing({
  secondsLeft,
  total,
  size = 88,
}: {
  secondsLeft: number;
  total: number;
  size?: number;
}) {
  const pct = Math.max(0, Math.min(1, secondsLeft / total));
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const secs = Math.max(0, Math.ceil(secondsLeft));
  const danger = secs <= 5;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,255,255,0.18)"
          strokeWidth={9}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={danger ? "#fb7185" : "#34d399"}
          strokeWidth={9}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: "stroke-dashoffset 0.25s linear, stroke 0.3s" }}
        />
      </svg>
      <div
        className={`absolute inset-0 flex items-center justify-center font-black ${
          danger ? "text-rose-300" : "text-emerald-300"
        }`}
        style={{ fontSize: size / 3 }}
      >
        {secs}
      </div>
    </div>
  );
}
