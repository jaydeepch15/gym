import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, absUrl } from "../lib/api";
import { TID } from "../lib/testIds";
import { ArrowLeft, Upload, Trash2, Film, Loader2, Youtube, X, Check } from "lucide-react";
import { toast, Toaster } from "sonner";

export default function Videos() {
    const [exercises, setExercises] = useState([]);
    const [byName, setByName] = useState({}); // name -> video record
    const [uploading, setUploading] = useState({}); // name -> pct
    const [ytOpen, setYtOpen] = useState(null); // exercise name whose youtube input is open
    const [ytUrl, setYtUrl] = useState("");
    const [ytBusy, setYtBusy] = useState(false);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        const [ex, vids] = await Promise.all([api.listExercises(), api.listVideos()]);
        const map = {};
        vids.forEach((v) => (map[v.exercise_name] = v));
        setExercises(ex);
        setByName(map);
        setLoading(false);
    };

    useEffect(() => {
        load().catch(() => {
            setLoading(false);
            toast.error("Could not load exercises");
        });
    }, []);

    const handleUpload = async (name, file) => {
        if (!file) return;
        if (!file.type.startsWith("video/")) {
            toast.error("That's not a video file");
            return;
        }
        setUploading((u) => ({ ...u, [name]: 1 }));
        try {
            const rec = await api.uploadVideo(name, file, (pct) =>
                setUploading((u) => ({ ...u, [name]: pct }))
            );
            setByName((m) => ({ ...m, [name]: rec }));
            toast.success(`Uploaded for ${name}`);
        } catch (e) {
            const msg = e?.response?.data?.detail || "Upload failed";
            toast.error(msg);
        } finally {
            setUploading((u) => {
                const copy = { ...u };
                delete copy[name];
                return copy;
            });
        }
    };

    const handleDelete = async (name) => {
        const rec = byName[name];
        if (!rec) return;
        try {
            await api.deleteVideo(rec.id);
            setByName((m) => {
                const c = { ...m };
                delete c[name];
                return c;
            });
            toast("Removed");
        } catch {
            toast.error("Could not delete");
        }
    };

    const openYt = (name) => {
        setYtOpen(name);
        setYtUrl(byName[name]?.youtube_url || "");
    };
    const closeYt = () => {
        setYtOpen(null);
        setYtUrl("");
    };
    const submitYt = async (name) => {
        if (!ytUrl.trim()) return;
        setYtBusy(true);
        try {
            const rec = await api.linkYoutube(name, ytUrl.trim());
            setByName((m) => ({ ...m, [name]: rec }));
            toast.success(`YouTube linked for ${name}`);
            closeYt();
        } catch (e) {
            const msg = e?.response?.data?.detail || "Could not link that URL";
            toast.error(msg);
        } finally {
            setYtBusy(false);
        }
    };

    const stats = useMemo(() => {
        const total = exercises.length;
        const uploaded = Object.keys(byName).length;
        return { total, uploaded };
    }, [exercises, byName]);

    return (
        <div className="min-h-screen grain" data-testid={TID.videosScreen}>
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
                    <span className="stat-label">FORM CLIPS</span>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
                <div className="stat-label mb-3">YOUR VIDEOS</div>
                <h1 className="font-display text-5xl sm:text-7xl text-bone leading-[0.9] mb-2">
                    DROP A CLIP. OR LINK ONE.
                </h1>
                <p className="text-muted-foreground mb-8 max-w-xl">
                    Record any lift on your phone and upload it, or paste a YouTube link (regular, Shorts, or youtu.be). The session player will loop it muted in place of the stick figure. One source per lift.
                </p>

                <div className="flex gap-6 mb-8 stat-label">
                    <div>
                        <div className="font-display text-4xl text-bone">{stats.uploaded}</div>
                        <div>LINKED</div>
                    </div>
                    <div>
                        <div className="font-display text-4xl text-muted-foreground">{stats.total}</div>
                        <div>TOTAL LIFTS</div>
                    </div>
                </div>

                {loading ? (
                    <div className="stat-label pulse-dot">LOADING…</div>
                ) : (
                    <div className="space-y-3">
                        {exercises.map((ex) => {
                            const rec = byName[ex.name];
                            const pct = uploading[ex.name];
                            const isBusy = pct != null;
                            const isYtOpen = ytOpen === ex.name;
                            return (
                                <div
                                    key={ex.name}
                                    data-testid={TID.videoRow(ex.name)}
                                    className="hairline bg-iron p-4 sm:p-5"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                        <div className="w-32 h-20 bg-obsidian hairline flex items-center justify-center overflow-hidden shrink-0 relative">
                                            {rec?.kind === "upload" ? (
                                                <video
                                                    data-testid={TID.videoPreview(ex.name)}
                                                    src={absUrl(rec.url)}
                                                    className="w-full h-full object-cover"
                                                    muted
                                                    playsInline
                                                    loop
                                                    autoPlay
                                                />
                                            ) : rec?.kind === "youtube" ? (
                                                <>
                                                    <img
                                                        data-testid={TID.videoPreview(ex.name)}
                                                        src={rec.thumbnail_url}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => (e.currentTarget.style.display = "none")}
                                                    />
                                                    <span className="absolute top-1 left-1 bg-blaze text-white text-[9px] font-mono px-1.5 py-[1px] tracking-widest">
                                                        YT
                                                    </span>
                                                </>
                                            ) : (
                                                <Film size={22} className="text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-display text-xl sm:text-2xl text-bone leading-tight">
                                                {ex.name}
                                            </div>
                                            <div className="stat-label mt-1">
                                                {ex.sessions.join(" · ")}
                                                {rec?.kind === "upload" && (
                                                    <span className="ml-2 text-chalk">· UPLOAD</span>
                                                )}
                                                {rec?.kind === "youtube" && (
                                                    <span className="ml-2 text-chalk">· YOUTUBE</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {isBusy ? (
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Loader2 size={16} className="animate-spin" />
                                                    {pct}%
                                                </div>
                                            ) : (
                                                <>
                                                    <label className="hairline px-3 py-2 bg-obsidian text-sm hover:bg-secondary cursor-pointer flex items-center gap-2">
                                                        <Upload size={14} />
                                                        <span>{rec?.kind === "upload" ? "REPLACE" : "UPLOAD"}</span>
                                                        <input
                                                            data-testid={TID.videoUploadInput(ex.name)}
                                                            type="file"
                                                            accept="video/*"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const f = e.target.files?.[0];
                                                                e.target.value = "";
                                                                if (f) handleUpload(ex.name, f);
                                                            }}
                                                        />
                                                    </label>
                                                    <button
                                                        data-testid={TID.videoYoutubeBtn(ex.name)}
                                                        onClick={() => (isYtOpen ? closeYt() : openYt(ex.name))}
                                                        className={`hairline px-3 py-2 text-sm flex items-center gap-2 ${
                                                            isYtOpen ? "bg-blaze text-white" : "bg-obsidian hover:bg-secondary"
                                                        }`}
                                                    >
                                                        <Youtube size={14} />
                                                        <span>YOUTUBE</span>
                                                    </button>
                                                    {rec && (
                                                        <button
                                                            data-testid={TID.videoDeleteBtn(ex.name)}
                                                            onClick={() => handleDelete(ex.name)}
                                                            className="w-9 h-9 hairline flex items-center justify-center text-muted-foreground hover:text-blaze"
                                                            aria-label="delete"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {isYtOpen && (
                                        <div className="mt-4 hairline-t pt-4 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                                            <input
                                                data-testid={TID.videoYoutubeInput(ex.name)}
                                                type="url"
                                                value={ytUrl}
                                                onChange={(e) => setYtUrl(e.target.value)}
                                                placeholder="https://www.youtube.com/shorts/..."
                                                className="flex-1 bg-obsidian hairline p-3 text-bone font-mono text-sm focus:border-blaze outline-none"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") submitYt(ex.name);
                                                    if (e.key === "Escape") closeYt();
                                                }}
                                            />
                                            <button
                                                data-testid={TID.videoYoutubeSubmit(ex.name)}
                                                onClick={() => submitYt(ex.name)}
                                                disabled={ytBusy}
                                                className="btn-blaze px-5 py-3 text-xs flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {ytBusy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                                LINK
                                            </button>
                                            <button
                                                onClick={closeYt}
                                                className="hairline px-3 py-3 bg-obsidian hover:bg-secondary"
                                                aria-label="cancel"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
