import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api, absUrl } from "../lib/api";
import { TID } from "../lib/testIds";
import { ArrowLeft, Upload, Trash2, Film, Loader2 } from "lucide-react";
import { toast, Toaster } from "sonner";

export default function Videos() {
    const [exercises, setExercises] = useState([]);
    const [byName, setByName] = useState({}); // name -> video record
    const [uploading, setUploading] = useState({}); // name -> pct
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
                    DROP YOUR FORM CLIPS.
                </h1>
                <p className="text-muted-foreground mb-8 max-w-xl">
                    Record any lift on your phone, upload the clip, and the session player will loop your own video instead of the stick figure. One clip per lift. Under 100 MB. MP4 / MOV / WebM.
                </p>

                <div className="flex gap-6 mb-8 stat-label">
                    <div>
                        <div className="font-display text-4xl text-bone">{stats.uploaded}</div>
                        <div>UPLOADED</div>
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
                            return (
                                <div
                                    key={ex.name}
                                    data-testid={TID.videoRow(ex.name)}
                                    className="hairline bg-iron p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                                >
                                    <div className="w-32 h-20 bg-obsidian hairline flex items-center justify-center overflow-hidden shrink-0">
                                        {rec ? (
                                            <video
                                                data-testid={TID.videoPreview(ex.name)}
                                                src={absUrl(rec.url)}
                                                className="w-full h-full object-cover"
                                                muted
                                                playsInline
                                                loop
                                                autoPlay
                                            />
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
                                            {rec && (
                                                <span className="ml-2 text-chalk">· CUSTOM CLIP</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isBusy ? (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Loader2 size={16} className="animate-spin" />
                                                {pct}%
                                            </div>
                                        ) : (
                                            <>
                                                <label
                                                    className="hairline px-3 py-2 bg-obsidian text-sm hover:bg-secondary cursor-pointer flex items-center gap-2"
                                                >
                                                    <Upload size={14} />
                                                    <span>{rec ? "REPLACE" : "UPLOAD"}</span>
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
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
