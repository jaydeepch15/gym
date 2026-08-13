import React from "react";
import { Link } from "react-router-dom";
import { TID } from "../lib/testIds";
import { ChevronRight } from "lucide-react";

const toneMap = {
    red: "border-blaze/60 hover:border-blaze",
    amber: "border-amber-500/60 hover:border-amber-500",
    teal: "border-teal-500/60 hover:border-teal-500",
    green: "border-emerald-500/60 hover:border-emerald-500",
};

export default function SessionCard({ session, suggested = false }) {
    const tone = toneMap[session.color] || toneMap.red;
    return (
        <Link
            to={`/session/${session.id}`}
            data-testid={TID.sessionCard(session.id)}
            className={`group relative block bg-iron hairline p-6 sm:p-7 transition-all duration-200 hover:-translate-y-0.5 ${tone} border-l-4`}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-3">
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
                    <p className="text-sm text-muted-foreground mt-2">{session.subtitle}</p>
                </div>
                <ChevronRight
                    className="text-muted-foreground group-hover:text-blaze transition-colors"
                    size={28}
                />
            </div>
            <div className="mt-6 flex items-center gap-6 stat-label">
                <span>~{session.duration_min} min</span>
                <span className="text-graphite">|</span>
                <span>Auto-advance</span>
            </div>
        </Link>
    );
}
