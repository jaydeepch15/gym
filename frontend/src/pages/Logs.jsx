import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { TID } from "../lib/testIds";
import { ArrowLeft, TrendingUp, Trash2 } from "lucide-react";
import { toast, Toaster } from "sonner";

// Only include the working sets from strength sessions (exercise-kind blocks in FBA/FBB)
const LIFT_OPTIONS = [
    { session: "full-body-a", name: "Barbell Back Squat" },
    { session: "full-body-a", name: "Bent-Over Barbell Row" },
    { session: "full-body-a", name: "Standing Overhead Press" },
    { session: "full-body-a", name: "Barbell Curl" },
    { session: "full-body-b", name: "Barbell Romanian Deadlift" },
    { session: "full-body-b", name: "Barbell Floor Press" },
    { session: "full-body-b", name: "Reverse Curl" },
    { session: "full-body-b", name: "Barbell Shrug" },
];

export default function Logs() {
    const [state, setState] = useState(null);
    const [selected, setSelected] = useState(LIFT_OPTIONS[0].name);
    const [weight, setWeight] = useState("");
    const [reps, setReps] = useState("");
    const [topRange, setTopRange] = useState(false);
    const [logs, setLogs] = useState([]);
    const [suggestion, setSuggestion] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        api.getState().then(setState).catch(() => {});
    }, []);

    const loadLogs = async (name) => {
        const rows = await api.listLogs({ exercise_name: name, limit: 20 });
        setLogs(rows);
        try {
            const s = await api.getSuggestion(name);
            setSuggestion(s);
        } catch (e) {
            setSuggestion(null);
        }
    };

    useEffect(() => {
        loadLogs(selected);
    }, [selected]);

    const currentLift = useMemo(() => LIFT_OPTIONS.find((l) => l.name === selected), [selected]);

    const submit = async (e) => {
        e.preventDefault();
        if (!state || !currentLift) return;
        const w = parseFloat(weight);
        const r = parseInt(reps, 10);
        if (Number.isNaN(w) || Number.isNaN(r)) {
            toast.error("Enter valid weight & reps");
            return;
        }
        setSubmitting(true);
        try {
            await api.createLog({
                session_id: currentLift.session,
                exercise_name: currentLift.name,
                week: state.current_week,
                weight_kg: w,
                reps_top_set: r,
                hit_top_of_range: topRange,
            });
            setWeight("");
            setReps("");
            setTopRange(false);
            toast.success("Logged. Nice work.");
            await loadLogs(currentLift.name);
        } catch (e) {
            toast.error("Could not save log");
        } finally {
            setSubmitting(false);
        }
    };

    const remove = async (id) => {
        await api.deleteLog(id);
        await loadLogs(currentLift.name);
        toast("Log removed");
    };

    return (
        <div className="min-h-screen grain" data-testid={TID.logsScreen}>
            <Toaster theme="dark" position="top-center" />
            <div className="hairline-b bg-iron/60 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-muted-foreground hover:text-bone text-sm font-mono tracking-[0.2em]"
                    >
                        <ArrowLeft size={16} />
                        HOME
                    </Link>
                    <span className="stat-label">WORKOUT LOG</span>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
                <div className="stat-label mb-3">TRACK YOUR NUMBERS</div>
                <h1 className="font-display text-5xl sm:text-7xl text-bone leading-[0.9] mb-2">
                    LOG THE LIFT.
                </h1>
                <p className="text-muted-foreground mb-10 max-w-xl">
                    Clear the top of the rep range with clean form on all three sets, tick the box, and the coach will bump the weight next session.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-10">
                    <form
                        onSubmit={submit}
                        className="hairline bg-iron p-6 space-y-4"
                    >
                        <div>
                            <label className="stat-label block mb-2">LIFT</label>
                            <select
                                data-testid={TID.logsExerciseSelect}
                                value={selected}
                                onChange={(e) => setSelected(e.target.value)}
                                className="w-full bg-obsidian hairline p-3 text-bone focus:border-blaze outline-none"
                            >
                                {LIFT_OPTIONS.map((l) => (
                                    <option key={l.name} value={l.name}>
                                        {l.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="stat-label block mb-2">WEIGHT (kg)</label>
                                <input
                                    data-testid={TID.logsWeightInput}
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    placeholder="30"
                                    className="w-full bg-obsidian hairline p-3 text-bone focus:border-blaze outline-none font-mono"
                                />
                            </div>
                            <div>
                                <label className="stat-label block mb-2">REPS (top set)</label>
                                <input
                                    data-testid={TID.logsRepsInput}
                                    type="number"
                                    min="0"
                                    value={reps}
                                    onChange={(e) => setReps(e.target.value)}
                                    placeholder="10"
                                    className="w-full bg-obsidian hairline p-3 text-bone focus:border-blaze outline-none font-mono"
                                />
                            </div>
                        </div>
                        <label className="flex items-start gap-3 cursor-pointer pt-2">
                            <input
                                data-testid={TID.logsTopRangeCheckbox}
                                type="checkbox"
                                checked={topRange}
                                onChange={(e) => setTopRange(e.target.checked)}
                                className="mt-1 accent-blaze w-4 h-4"
                            />
                            <span className="text-sm text-bone">
                                <span className="font-semibold">Cleared top of rep range</span> on all 3 sets with clean form
                            </span>
                        </label>
                        <button
                            data-testid={TID.logsSubmitBtn}
                            type="submit"
                            disabled={submitting}
                            className="btn-blaze w-full py-3 text-sm disabled:opacity-50"
                        >
                            {submitting ? "SAVING…" : "SAVE LOG"}
                        </button>
                    </form>

                    <div className="hairline bg-iron p-6" data-testid={TID.logsSuggestion}>
                        <div className="flex items-center gap-3 mb-4">
                            <TrendingUp size={20} className="text-chalk" />
                            <h3 className="font-display text-xl text-bone">NEXT SESSION</h3>
                        </div>
                        {suggestion ? (
                            <>
                                <div className="stat-label mb-1">{suggestion.exercise_name}</div>
                                {suggestion.next_weight_kg != null && (
                                    <div className="font-display text-5xl text-bone leading-none mb-2">
                                        {suggestion.next_weight_kg} <span className="text-xl text-muted-foreground">kg</span>
                                    </div>
                                )}
                                <p className="text-sm text-muted-foreground">{suggestion.message}</p>
                                {suggestion.last_weight_kg != null && (
                                    <div className="mt-4 stat-label">
                                        LAST · {suggestion.last_weight_kg} kg
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Log a set to see the next-session suggestion.
                            </p>
                        )}
                    </div>
                </div>

                <div className="mb-10">
                    <h2 className="font-display text-3xl text-bone mb-4">HISTORY</h2>
                    {logs.length === 0 ? (
                        <p className="text-muted-foreground text-sm">Nothing logged yet for this lift.</p>
                    ) : (
                        <div className="hairline bg-iron divide-y divide-graphite" data-testid={TID.logsList}>
                            {logs.map((l) => (
                                <div key={l.id} className="p-4 flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="stat-label mb-1">WEEK {String(l.week).padStart(2, "0")} · {new Date(l.created_at).toLocaleDateString()}</div>
                                        <div className="font-mono text-bone">
                                            <span className="text-blaze">{l.weight_kg}</span> kg × <span className="text-blaze">{l.reps_top_set}</span> reps
                                            {l.hit_top_of_range && (
                                                <span className="ml-3 text-xs bg-chalk text-obsidian px-2 py-[2px] font-sans">TOP CLEARED</span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => remove(l.id)}
                                        className="w-8 h-8 hairline flex items-center justify-center text-muted-foreground hover:text-blaze"
                                        aria-label="delete"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
