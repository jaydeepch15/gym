import React, { useState } from "react";
import { TID } from "../lib/testIds";
import { Check } from "lucide-react";

/**
 * Match-day readiness checklist, shown inline as a "block" inside the session player.
 * items: string[]
 */
export default function MatchDayChecklist({ items, onDone }) {
    const [state, setState] = useState(() => items.map(() => false));
    const toggle = (i) =>
        setState((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="mb-6 text-center">
                <div className="stat-label mb-3">READINESS CHECK</div>
                <h2 className="font-display text-4xl sm:text-5xl text-bone">
                    ARE YOU READY?
                </h2>
                <p className="text-muted-foreground mt-2 text-sm">
                    Tick each honestly. If two or more are off, take it easy today.
                </p>
            </div>
            <ul className="space-y-3">
                {items.map((it, i) => (
                    <li key={i}>
                        <button
                            data-testid={TID.checklistItem(i)}
                            onClick={() => toggle(i)}
                            className={`w-full text-left flex items-center gap-4 p-4 hairline transition-colors ${
                                state[i] ? "bg-blaze/10 border-blaze" : "bg-iron hover:bg-secondary"
                            }`}
                        >
                            <span
                                className={`w-6 h-6 flex items-center justify-center border-2 ${
                                    state[i] ? "bg-blaze border-blaze" : "border-graphite"
                                }`}
                            >
                                {state[i] && <Check size={16} className="text-white" />}
                            </span>
                            <span className="text-bone">{it}</span>
                        </button>
                    </li>
                ))}
            </ul>
            <div className="mt-8 flex justify-center">
                <button
                    data-testid={TID.checklistDone}
                    onClick={onDone}
                    className="btn-blaze px-8 py-4 text-sm"
                >
                    START WARM-UP →
                </button>
            </div>
        </div>
    );
}
