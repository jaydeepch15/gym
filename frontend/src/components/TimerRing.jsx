import React from "react";

/**
 * Big brutalist stopwatch. Displays MM:SS with a sweeping ring underneath.
 * Props: seconds (remaining), total (seconds), label, color (css hsl var name)
 */
export default function TimerRing({ seconds, total, label = "WORK", tone = "blaze", testId }) {
    const clamped = Math.max(0, Math.floor(seconds));
    const pct = total > 0 ? Math.min(1, Math.max(0, clamped / total)) : 0;
    const size = 340;
    const stroke = 8;
    const r = (size - stroke * 2) / 2;
    const c = 2 * Math.PI * r;
    const dash = c * pct;
    const mm = String(Math.floor(clamped / 60)).padStart(2, "0");
    const ss = String(clamped % 60).padStart(2, "0");
    const ring = tone === "chalk" ? "hsl(var(--chalk))" : "hsl(var(--blaze))";
    return (
        <div className="relative flex flex-col items-center justify-center select-none">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--graphite))" strokeWidth={stroke} />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke={ring}
                    strokeWidth={stroke}
                    strokeDasharray={`${dash} ${c}`}
                    strokeLinecap="butt"
                    style={{ transition: "stroke-dasharray 250ms linear" }}
                />
                {/* tick marks */}
                {Array.from({ length: 60 }).map((_, i) => {
                    const angle = (i / 60) * Math.PI * 2;
                    const x1 = size / 2 + Math.cos(angle) * (r - 12);
                    const y1 = size / 2 + Math.sin(angle) * (r - 12);
                    const x2 = size / 2 + Math.cos(angle) * (r - (i % 5 === 0 ? 22 : 16));
                    const y2 = size / 2 + Math.sin(angle) * (r - (i % 5 === 0 ? 22 : 16));
                    return (
                        <line
                            key={i}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="hsl(var(--graphite))"
                            strokeWidth={i % 5 === 0 ? 2 : 1}
                        />
                    );
                })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="stat-label text-[10px] sm:text-xs mb-2" data-testid={testId ? `${testId}-label` : undefined}>
                    {label}
                </div>
                <div
                    className="timer-digits text-[128px] sm:text-[160px] text-bone"
                    data-testid={testId}
                >
                    {mm}
                    <span className="text-blaze">:</span>
                    {ss}
                </div>
            </div>
        </div>
    );
}
