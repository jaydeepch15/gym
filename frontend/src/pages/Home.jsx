import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import SessionCard from "../components/SessionCard";
import WeekCalendar from "../components/WeekCalendar";
import { TID } from "../lib/testIds";
import { ChevronLeft, ChevronRight, ClipboardList, Dumbbell, ShieldAlert } from "lucide-react";

const DAY_MAP = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function phaseForWeek(program, week) {
    if (!program) return null;
    return program.phases.find((p) => p.weeks.includes(week)) || program.phases[0];
}

export default function Home() {
    const [program, setProgram] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [state, setState] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                const [p, s] = await Promise.all([api.getProgram(), api.getState()]);
                setProgram(p.program);
                setSessions(p.sessions);
                setState(s);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const todayDay = useMemo(() => DAY_MAP[new Date().getDay()], []);
    const phase = program && state ? phaseForWeek(program, state.current_week) : null;

    const suggestedSessionId = useMemo(() => {
        const row = program?.weekly_schedule?.find((d) => d.day === todayDay && d.session_id);
        return row?.session_id || null;
    }, [program, todayDay]);

    const changeWeek = async (delta) => {
        if (!state || !program) return;
        const next = Math.min(program.total_weeks, Math.max(1, state.current_week + delta));
        if (next === state.current_week) return;
        const updated = await api.setWeek(next);
        setState(updated);
    };

    if (loading || !program || !state) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="stat-label pulse-dot">LOADING PROGRAM…</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen grain relative" data-testid={TID.homeScreen}>
            {/* header ticker */}
            <div className="hairline-b bg-iron/60 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                        <span className="font-mono tracking-[0.4em] text-blaze">42+</span>
                        <span className="text-muted-foreground font-mono tracking-[0.3em] hidden sm:inline">
                            COMEBACK / HOME EDITION
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            to="/logs"
                            data-testid={TID.logsLink}
                            className="flex items-center gap-2 text-muted-foreground hover:text-bone transition-colors"
                        >
                            <ClipboardList size={14} />
                            <span className="font-mono tracking-[0.2em]">LOG</span>
                        </Link>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-14 relative z-10">
                {/* Hero */}
                <section className="mb-12 sm:mb-16">
                    <div className="stat-label mb-4">12-WEEK PROGRAM · SINGLE ATHLETE</div>
                    <h1
                        data-testid={TID.homeHeroTitle}
                        className="font-display text-6xl sm:text-8xl lg:text-9xl leading-[0.85] text-bone"
                    >
                        {program.title.split(" ").map((w, i) => (
                            <span key={i} className={i === 1 ? "text-blaze" : ""}>
                                {w}{" "}
                            </span>
                        ))}
                    </h1>
                    <p className="text-muted-foreground text-lg mt-6 max-w-xl">
                        {program.subtitle}. Two strength days. One mobility day. One cricket day. Same weight across three sets. R I R two to three. No grinding.
                    </p>
                </section>

                {/* Week + Phase */}
                <section className="mb-10 sm:mb-14">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-6">
                        <div>
                            <div className="stat-label mb-3">CURRENT WEEK</div>
                            <div className="flex items-center gap-4">
                                <button
                                    data-testid={TID.weekPickerPrev}
                                    onClick={() => changeWeek(-1)}
                                    disabled={state.current_week <= 1}
                                    className="w-10 h-10 hairline flex items-center justify-center hover:bg-iron transition-colors disabled:opacity-30"
                                    aria-label="previous week"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <div
                                    data-testid={TID.weekPickerLabel}
                                    className="font-display text-6xl sm:text-7xl text-bone tabular-nums"
                                >
                                    {String(state.current_week).padStart(2, "0")}
                                    <span className="text-muted-foreground text-3xl sm:text-4xl">/{program.total_weeks}</span>
                                </div>
                                <button
                                    data-testid={TID.weekPickerNext}
                                    onClick={() => changeWeek(1)}
                                    disabled={state.current_week >= program.total_weeks}
                                    className="w-10 h-10 hairline flex items-center justify-center hover:bg-iron transition-colors disabled:opacity-30"
                                    aria-label="next week"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                        <div>
                            <div className="stat-label mb-2">PHASE</div>
                            <div
                                data-testid={TID.phaseBadge}
                                className="inline-block bg-blaze text-white font-display text-2xl sm:text-3xl px-4 py-2"
                            >
                                {phase?.name}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                                {phase?.focus}
                            </p>
                        </div>
                    </div>

                    <WeekCalendar schedule={program.weekly_schedule} todayDay={todayDay} />
                </section>

                {/* Suggested (today) */}
                {suggestedSessionId && (
                    <section className="mb-10 sm:mb-14">
                        <div className="stripe-bg p-[1px]">
                            <div className="bg-obsidian p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <div className="stat-label text-chalk mb-2">TODAY IS {todayDay}</div>
                                    <div className="font-display text-3xl sm:text-4xl text-bone">
                                        {sessions.find((s) => s.id === suggestedSessionId)?.title}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Suggested for today's schedule.
                                    </p>
                                </div>
                                <button
                                    data-testid={TID.startSessionBtn(suggestedSessionId)}
                                    onClick={() => navigate(`/session/${suggestedSessionId}`)}
                                    className="btn-blaze px-6 py-3 text-sm"
                                >
                                    START →
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {/* Sessions grid */}
                <section className="mb-12">
                    <div className="flex items-baseline justify-between mb-6">
                        <h2 className="font-display text-3xl sm:text-4xl text-bone">
                            THE FIVE SESSIONS
                        </h2>
                        <span className="stat-label hidden sm:inline">TAP TO OPEN</span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {sessions.map((s) => (
                            <SessionCard
                                key={s.id}
                                session={s}
                                suggested={s.id === suggestedSessionId}
                            />
                        ))}
                    </div>
                </section>

                {/* Phases timeline */}
                <section className="mb-12">
                    <h2 className="font-display text-2xl sm:text-3xl text-bone mb-6">
                        12-WEEK ARC
                    </h2>
                    <div className="grid grid-cols-12 gap-1">
                        {Array.from({ length: 12 }).map((_, i) => {
                            const w = i + 1;
                            const p = phaseForWeek(program, w);
                            const isCurrent = w === state.current_week;
                            const bg =
                                p?.name === "RECONDITION"
                                    ? "bg-teal-500/60"
                                    : p?.name === "STRENGTH"
                                    ? "bg-blaze"
                                    : "bg-chalk";
                            return (
                                <div key={w} className="col-span-1 flex flex-col items-center">
                                    <div className={`h-3 w-full ${bg} ${isCurrent ? "outline outline-2 outline-bone" : ""}`} />
                                    <span className="mt-2 font-mono text-[10px] text-muted-foreground">
                                        {w}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex flex-wrap gap-4 mt-4 text-xs">
                        {program.phases.map((p) => (
                            <div key={p.name} className="flex items-center gap-2">
                                <div className={`w-3 h-3 ${
                                    p.name === "RECONDITION" ? "bg-teal-500/60" :
                                    p.name === "STRENGTH" ? "bg-blaze" : "bg-chalk"
                                }`} />
                                <span className="font-mono tracking-[0.2em] text-muted-foreground">{p.name}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Equipment + Principles */}
                <section className="grid md:grid-cols-2 gap-6 mb-16">
                    <div className="hairline p-6 bg-iron">
                        <div className="flex items-center gap-3 mb-4">
                            <Dumbbell size={20} className="text-blaze" />
                            <h3 className="font-display text-xl text-bone">EQUIPMENT</h3>
                        </div>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {program.equipment.map((e) => (
                                <li key={e} className="flex items-start gap-2">
                                    <span className="text-blaze mt-1">▸</span>
                                    <span>{e}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="hairline p-6 bg-iron">
                        <div className="flex items-center gap-3 mb-4">
                            <ShieldAlert size={20} className="text-chalk" />
                            <h3 className="font-display text-xl text-bone">RULES OF THE HOUSE</h3>
                        </div>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {program.principles.map((e) => (
                                <li key={e} className="flex items-start gap-2">
                                    <span className="text-chalk mt-1">▸</span>
                                    <span>{e}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <footer className="hairline-t pt-6 pb-10 text-xs text-muted-foreground font-mono tracking-[0.2em] flex items-center justify-between">
                    <span>BUILT FOR THE WEEKEND CRICKETER</span>
                    <span>V1.0</span>
                </footer>
            </main>
        </div>
    );
}
