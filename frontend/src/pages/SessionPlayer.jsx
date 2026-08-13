import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { tts } from "../lib/audio";
import TimerRing from "../components/TimerRing";
import ExerciseSvg from "../components/ExerciseSvg";
import MatchDayChecklist from "../components/MatchDayChecklist";
import { TID } from "../lib/testIds";
import {
    ChevronLeft,
    ChevronRight,
    Pause,
    Play,
    Plus,
    Volume2,
    VolumeX,
    X,
    CheckCircle2,
    Music,
} from "lucide-react";

/**
 * Session Player - full-screen guided sequence.
 *
 * Block types:
 *  - title:  { heading, sub, duration }
 *  - say:    { heading, body, voice, duration }
 *  - checklist: { heading, items, duration } — waits for user
 *  - exercise: { name, sets, reps, rest, equipment, cues, mistakes, safety, svg, voice }
 *      Handled as a loop: WORK (indefinite, user taps "SET DONE") → REST (countdown) x sets
 *  - timed: { name, work, rest, cues, mistakes, safety, svg, voice } — WORK countdown → REST countdown
 *  - ending: { heading, sub, duration }
 */

function useCurrentWeek() {
    const [week, setWeek] = useState(1);
    useEffect(() => {
        api.getState().then((s) => setWeek(s.current_week)).catch(() => {});
    }, []);
    return week;
}

function useInterval(cb, ms, running) {
    const ref = useRef(cb);
    ref.current = cb;
    useEffect(() => {
        if (!running) return;
        const t = setInterval(() => ref.current(), ms);
        return () => clearInterval(t);
    }, [ms, running]);
}

export default function SessionPlayer() {
    const { id } = useParams();
    const nav = useNavigate();
    const week = useCurrentWeek();

    const [session, setSession] = useState(null);
    const [idx, setIdx] = useState(0);
    const [phase, setPhase] = useState("intro"); // intro | work | rest | done
    const [setIdxState, setSetIdx] = useState(1);
    const [remaining, setRemaining] = useState(0);
    const [paused, setPaused] = useState(false);
    const [muted, setMuted] = useState(false);
    const [musicOn, setMusicOn] = useState(false);
    const musicRef = useRef(null);
    const spokenRef = useRef(new Set());

    // Load session
    useEffect(() => {
        api.getSession(id).then(setSession).catch(() => nav("/"));
    }, [id, nav]);

    useEffect(() => {
        tts.setMusic(musicRef);
        tts.setEnabled(!muted);
    }, [muted]);

    const block = session?.blocks?.[idx] || null;

    // Speak the block's voice line once when block enters
    useEffect(() => {
        if (!block) return;
        const key = `${idx}-${phase}`;
        if (spokenRef.current.has(key)) return;
        spokenRef.current.add(key);
        if (phase === "work" || phase === "intro") {
            const line = block.voice || block.body || null;
            if (line) tts.play(line);
        }
        if (phase === "rest") {
            tts.play("Rest.");
        }
    }, [idx, phase, block]);

    // Initialize phase/timer when block changes
    useEffect(() => {
        if (!block) return;
        spokenRef.current = new Set(); // reset per block
        if (block.kind === "title" || block.kind === "say" || block.kind === "ending") {
            setPhase("intro");
            setRemaining(block.duration || 6);
        } else if (block.kind === "checklist") {
            setPhase("work");
            setRemaining(0); // user driven
        } else if (block.kind === "timed") {
            setPhase("work");
            setRemaining(block.work || 30);
            setSetIdx(1);
        } else if (block.kind === "exercise") {
            setPhase("work");
            setRemaining(0); // user driven ("SET DONE")
            setSetIdx(1);
        }
    }, [idx, block]);

    // Timer tick
    useInterval(
        () => {
            setRemaining((r) => {
                if (r <= 1) return 0;
                return r - 1;
            });
        },
        1000,
        !paused && (phase === "intro" || phase === "rest" || (block?.kind === "timed" && phase === "work" && remaining > 0))
    );

    // Auto-advance / phase transitions
    useEffect(() => {
        if (paused || !block) return;
        if (remaining !== 0) return;

        if (block.kind === "title" || block.kind === "say" || block.kind === "ending") {
            if (phase === "intro") {
                if (block.kind === "ending") {
                    setPhase("done");
                    return;
                }
                gotoNext();
            }
            return;
        }
        if (block.kind === "timed") {
            if (phase === "work") {
                if ((block.rest || 0) > 0) {
                    setPhase("rest");
                    setRemaining(block.rest);
                } else {
                    gotoNext();
                }
            } else if (phase === "rest") {
                gotoNext();
            }
        }
        if (block.kind === "exercise") {
            if (phase === "rest") {
                if (setIdxState >= block.sets) {
                    gotoNext();
                } else {
                    setSetIdx((s) => s + 1);
                    setPhase("work");
                    setRemaining(0);
                }
            }
        }
        // checklist waits for user
        // exercise work waits for user "SET DONE"
    }, [remaining, phase, block, paused, setIdxState]);

    const gotoNext = useCallback(() => {
        if (!session) return;
        tts.stop();
        setIdx((i) => Math.min((session.blocks?.length || 1) - 1, i + 1));
    }, [session]);

    const gotoPrev = useCallback(() => {
        tts.stop();
        setIdx((i) => Math.max(0, i - 1));
    }, []);

    const add30s = () => setRemaining((r) => r + 30);

    const markSetDone = () => {
        if (!block || block.kind !== "exercise") return;
        // move to rest
        setPhase("rest");
        setRemaining(block.rest || 60);
    };

    const toggleMusic = async () => {
        const el = musicRef.current;
        if (!el) return;
        if (musicOn) {
            el.pause();
            setMusicOn(false);
        } else {
            el.volume = 0.22;
            try {
                await el.play();
                setMusicOn(true);
            } catch (e) {}
        }
    };

    // Keyboard shortcuts
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === " ") {
                e.preventDefault();
                setPaused((p) => !p);
            }
            if (e.key === "ArrowRight") gotoNext();
            if (e.key === "ArrowLeft") gotoPrev();
            if (e.key === "Escape") nav("/");
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [gotoNext, gotoPrev, nav]);

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="stat-label pulse-dot">LOADING SESSION…</div>
            </div>
        );
    }

    const total = session.blocks.length;
    const progress = ((idx + 1) / total) * 100;

    return (
        <div className="min-h-screen bg-obsidian text-bone grain relative" data-testid={TID.playerRoot}>
            {/* Ambient music */}
            <audio ref={musicRef} loop preload="none">
                {/* Royalty-free calm background beep-free — start silent, user opts in */}
                <source src="https://cdn.pixabay.com/audio/2022/10/25/audio_9c3d1b3f7f.mp3" type="audio/mpeg" />
            </audio>

            {/* Top bar */}
            <div className="fixed inset-x-0 top-0 z-30 hairline-b bg-obsidian/70 backdrop-blur-sm">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
                    <button
                        data-testid={TID.playerExitBtn}
                        onClick={() => nav("/")}
                        className="flex items-center gap-2 text-muted-foreground hover:text-bone text-sm font-mono"
                        aria-label="exit"
                    >
                        <X size={18} />
                        <span className="tracking-[0.2em] hidden sm:inline">EXIT</span>
                    </button>
                    <div className="flex-1 min-w-0">
                        <div className="stat-label flex items-center justify-between mb-1">
                            <span>{session.code} · {session.title}</span>
                            <span>WEEK {String(week).padStart(2, "0")}</span>
                        </div>
                        <div className="h-1 bg-graphite w-full">
                            <div
                                data-testid={TID.playerProgress}
                                className="h-full bg-blaze transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleMusic}
                            className={`w-9 h-9 hairline flex items-center justify-center hover:bg-iron ${musicOn ? "text-chalk" : "text-muted-foreground"}`}
                            aria-label={musicOn ? "mute music" : "play music"}
                            data-testid="player-music-btn"
                        >
                            <Music size={16} />
                        </button>
                        <button
                            data-testid={TID.playerMuteBtn}
                            onClick={() => setMuted((m) => !m)}
                            className="w-9 h-9 hairline flex items-center justify-center hover:bg-iron"
                            aria-label={muted ? "unmute voice" : "mute voice"}
                        >
                            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="pt-24 pb-40 max-w-5xl mx-auto px-4 sm:px-6 min-h-screen flex items-start justify-center">
                {phase === "done" ? (
                    <EndingScreen block={block} onExit={() => nav("/")} sessionId={session.id} />
                ) : block?.kind === "title" ? (
                    <TitleScreen block={block} />
                ) : block?.kind === "say" ? (
                    <SayScreen block={block} />
                ) : block?.kind === "ending" ? (
                    <TitleScreen block={block} ending />
                ) : block?.kind === "checklist" ? (
                    <MatchDayChecklist items={block.items} onDone={gotoNext} />
                ) : block?.kind === "timed" ? (
                    <TimedScreen block={block} phase={phase} remaining={remaining} />
                ) : block?.kind === "exercise" ? (
                    <ExerciseScreen block={block} phase={phase} remaining={remaining} setIdx={setIdxState} />
                ) : null}
            </main>

            {/* Bottom controls */}
            <div className="fixed inset-x-0 bottom-0 z-30 hairline-t bg-obsidian/80 backdrop-blur-sm">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 h-24 flex items-center justify-between gap-3">
                    <button
                        data-testid={TID.playerPrevBtn}
                        onClick={gotoPrev}
                        className="w-12 h-12 hairline flex items-center justify-center hover:bg-iron"
                        aria-label="previous"
                    >
                        <ChevronLeft size={22} />
                    </button>
                    <div className="flex items-center gap-3 flex-wrap justify-center">
                        {block?.kind === "exercise" && phase === "work" && (
                            <button
                                data-testid={TID.playerMarkSetBtn}
                                onClick={markSetDone}
                                className="btn-blaze px-5 sm:px-8 py-3 sm:py-4 text-sm flex items-center gap-2"
                            >
                                <CheckCircle2 size={18} />
                                <span>SET {setIdxState} DONE</span>
                            </button>
                        )}
                        {(phase === "rest" || (block?.kind === "timed" && phase === "work")) && (
                            <button
                                data-testid={TID.playerAdd30sBtn}
                                onClick={add30s}
                                className="hairline px-4 py-3 text-sm bg-iron hover:bg-secondary flex items-center gap-2"
                            >
                                <Plus size={16} /> 30s
                            </button>
                        )}
                        <button
                            data-testid={TID.playerPlayPauseBtn}
                            onClick={() => setPaused((p) => !p)}
                            className="hairline w-14 h-12 flex items-center justify-center bg-iron hover:bg-secondary"
                            aria-label={paused ? "play" : "pause"}
                        >
                            {paused ? <Play size={20} /> : <Pause size={20} />}
                        </button>
                    </div>
                    <button
                        data-testid={TID.playerNextBtn}
                        onClick={gotoNext}
                        className="w-12 h-12 hairline flex items-center justify-center hover:bg-iron"
                        aria-label="next"
                    >
                        <ChevronRight size={22} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// -------- sub screens --------

function TitleScreen({ block, ending }) {
    return (
        <div className="w-full text-center animate-fade-up">
            <div className="stat-label mb-4">{ending ? "SESSION COMPLETE" : "SESSION"}</div>
            <h1
                data-testid={TID.playerBlockTitle}
                className={`font-display leading-[0.85] ${
                    ending ? "text-6xl sm:text-8xl text-chalk" : "text-7xl sm:text-9xl text-bone"
                }`}
            >
                {block.heading}
            </h1>
            {block.sub && (
                <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto">
                    {block.sub}
                </p>
            )}
        </div>
    );
}

function SayScreen({ block }) {
    return (
        <div className="w-full max-w-3xl mx-auto text-left animate-fade-up">
            <div className="stat-label mb-4">COACH SAYS</div>
            <h2
                data-testid={TID.playerBlockTitle}
                className="font-display text-5xl sm:text-7xl leading-[0.9] text-bone mb-6"
            >
                {block.heading}
            </h2>
            <p className="text-lg sm:text-2xl text-muted-foreground leading-relaxed">
                {block.body}
            </p>
        </div>
    );
}

function EndingScreen({ block, onExit }) {
    return (
        <div className="w-full text-center animate-fade-up">
            <div className="stat-label mb-4 text-chalk">DONE</div>
            <h1 className="font-display text-7xl sm:text-9xl text-bone leading-[0.85]">
                {block?.heading || "SESSION COMPLETE"}
            </h1>
            <p className="mt-6 text-muted-foreground">{block?.sub}</p>
            <button
                onClick={onExit}
                className="btn-blaze px-8 py-4 mt-10"
                data-testid="player-finish-exit-btn"
            >
                BACK TO HOME
            </button>
        </div>
    );
}

function TimedScreen({ block, phase, remaining }) {
    const isRest = phase === "rest";
    return (
        <div className="w-full grid lg:grid-cols-2 gap-8 items-center animate-fade-up">
            <div className="flex flex-col items-center">
                <TimerRing
                    seconds={remaining}
                    total={isRest ? block.rest : block.work}
                    label={isRest ? "REST" : "WORK"}
                    tone={isRest ? "chalk" : "blaze"}
                    testId={TID.playerTimerDigits}
                />
            </div>
            <div>
                <div className="stat-label mb-3">{isRest ? "REST" : "MOVEMENT"}</div>
                <h2
                    data-testid={TID.playerBlockTitle}
                    className="font-display text-5xl sm:text-6xl leading-[0.9] text-bone mb-4"
                >
                    {block.name}
                </h2>
                <div className="w-40 sm:w-56 mb-4">
                    <ExerciseSvg id={block.svg} />
                </div>
                {block.cues?.length > 0 && (
                    <div className="mb-4">
                        <div className="stat-label mb-1">CUES</div>
                        <ul className="space-y-1 text-sm text-bone">
                            {block.cues.map((c, i) => (
                                <li key={i} className="flex gap-2">
                                    <span className="text-blaze">▸</span>
                                    <span>{c}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {block.equipment && (
                    <div className="stat-label mt-4">{block.equipment}</div>
                )}
            </div>
        </div>
    );
}

function ExerciseScreen({ block, phase, remaining, setIdx }) {
    const isRest = phase === "rest";
    return (
        <div className="w-full animate-fade-up">
            <div className="flex flex-wrap items-baseline gap-4 mb-6">
                <div className="stat-label">EXERCISE</div>
                <div
                    data-testid={TID.playerSetCount}
                    className="font-mono text-sm bg-iron px-3 py-1 hairline"
                >
                    SET {setIdx} / {block.sets}
                </div>
                <div className="font-mono text-sm bg-iron px-3 py-1 hairline">
                    {block.reps} REPS
                </div>
                <div className="font-mono text-sm bg-iron px-3 py-1 hairline">
                    REST {block.rest}s
                </div>
            </div>

            <h2
                data-testid={TID.playerBlockTitle}
                className="font-display text-5xl sm:text-7xl leading-[0.9] text-bone mb-8"
            >
                {block.name}
            </h2>

            <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="flex flex-col items-center">
                    {isRest ? (
                        <TimerRing
                            seconds={remaining}
                            total={block.rest}
                            label="REST"
                            tone="chalk"
                            testId={TID.playerTimerDigits}
                        />
                    ) : (
                        <div className="w-72 sm:w-96">
                            <ExerciseSvg id={block.svg} />
                        </div>
                    )}
                    {!isRest && (
                        <div className="mt-6 stat-label text-chalk">
                            HIT REPS · TAP "SET {setIdx} DONE" WHEN FINISHED
                        </div>
                    )}
                </div>

                <div className="space-y-5">
                    {block.equipment && (
                        <div>
                            <div className="stat-label mb-1">EQUIPMENT</div>
                            <div className="text-bone">{block.equipment}</div>
                        </div>
                    )}
                    <div>
                        <div className="stat-label mb-2">FORM CUES</div>
                        <ul className="space-y-1 text-bone">
                            {(block.cues || []).map((c, i) => (
                                <li key={i} className="flex gap-2">
                                    <span className="text-blaze">▸</span>
                                    <span>{c}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    {block.mistakes?.length > 0 && (
                        <div>
                            <div className="stat-label mb-2 text-chalk">COMMON MISTAKES</div>
                            <ul className="space-y-1 text-muted-foreground">
                                {block.mistakes.map((c, i) => (
                                    <li key={i} className="flex gap-2">
                                        <span className="text-chalk">×</span>
                                        <span>{c}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {block.safety && (
                        <div className="hairline bg-iron/70 p-4 border-l-4 border-blaze">
                            <div className="stat-label mb-1 text-blaze">SAFETY</div>
                            <p className="text-sm text-bone">{block.safety}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
