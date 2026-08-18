import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TID } from "../lib/testIds";
import { ChevronDown, ChevronRight, Play } from "lucide-react";

const toneMap = {
    red: "border-blaze/60 hover:border-blaze",
    amber: "border-amber-500/60 hover:border-amber-500",
    teal: "border-teal-500/60 hover:border-teal-500",
    green: "border-emerald-500/60 hover:border-emerald-500",
};

export default function SessionCard({ session, suggested = false }) {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const tone = toneMap[session.color] || toneMap.red;
    const exercises = session.exercises || [];

    const start = () => navigate(`/session/${session.id}`);

    return (
        <div
            data-testid={TID.sessionCard(session.id)}
            className={`group relative block bg-iron hairline transition-all duration-200 ${tone} border-l-4`}
        >
            <button
                type="button"
                onClick={start}
                className="w-full text-left p-6 sm:p-7 hover:bg-secondary/40 transition-colors"
                data-testid={TID.sessionCardStart(session.id)}
                aria-label={`Start ${session.title}`}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                            <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">
                                {session.code}
                            </span>
                            {session.day && (
                                <span className="font-mono text-[10px] tracking-[0.3em] text-blaze">
                                    {session.day}
                                </span>
                            )}
                            {suggested && (
                                <span className="font-mono text-[10px] tracking-[0.24em] bg-chalk text-obsidian px-2 py-[2px]">
                                    TODAY
                                </span>
                            )}
                        </div>
                        <h3 className="font-display text-3xl sm:text-4xl leading-none text-bone">
                            {session.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-2">
                            {session.subtitle}
                        </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                        <Play
                            size={18}
                            className="text-muted-foreground group-hover:text-blaze transition-colors"
                        />
                    </div>
                </div>
                <div className="mt-6 flex items-center gap-6 stat-label">
                    <span>~{session.duration_min} min</span>
                    <span className="text-graphite">|</span>
                    <span>{exercises.length} movements</span>
                    <span className="text-graphite">|</span>
                    <span>Auto-advance</span>
                </div>
            </button>

            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen((v) => !v);
                }}
                data-testid={TID.sessionCardToggle(session.id)}
                aria-expanded={open}
                className="w-full flex items-center justify-between px-6 sm:px-7 py-3 hairline-t text-left hover:bg-secondary/40 transition-colors"
            >
                <span className="stat-label">
                    {open ? "HIDE" : "SHOW"} EXERCISE ORDER
                </span>
                {open ? (
                    <ChevronDown size={16} className="text-muted-foreground" />
                ) : (
                    <ChevronRight size={16} className="text-muted-foreground" />
                )}
            </button>

            {open && (
                <ol
                    data-testid={TID.sessionCardList(session.id)}
                    className="px-6 sm:px-7 pb-6 pt-2 space-y-2"
                >
                    {exercises.map((ex, i) => (
                        <li
                            key={`${ex.name}-${i}`}
                            className="flex items-start gap-3 text-sm"
                        >
                            <span className="font-mono text-[10px] text-muted-foreground w-6 shrink-0 pt-[3px]">
                                {String(i + 1).padStart(2, "0")}
                            </span>
                            <span className="flex-1 min-w-0 text-bone">
                                {ex.name}
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground shrink-0 pt-[3px]">
                                {ex.kind === "exercise"
                                    ? `${ex.sets}×${ex.reps}`
                                    : ex.kind === "timed"
                                    ? `${ex.work}s`
                                    : ""}
                            </span>
                        </li>
                    ))}
                    {exercises.length === 0 && (
                        <li className="text-sm text-muted-foreground italic">
                            Guided walk-through only.
                        </li>
                    )}
                </ol>
            )}
        </div>
    );
}
