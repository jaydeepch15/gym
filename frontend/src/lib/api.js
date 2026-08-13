import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const client = axios.create({
    baseURL: API,
    timeout: 60_000,
});

export const api = {
    getProgram: () => client.get("/program").then((r) => r.data),
    getSession: (id) => client.get(`/sessions/${id}`).then((r) => r.data),
    getState: () => client.get("/state").then((r) => r.data),
    setWeek: (w) => client.put("/state/week", { current_week: w }).then((r) => r.data),
    createLog: (payload) => client.post("/logs", payload).then((r) => r.data),
    listLogs: (params = {}) => client.get("/logs", { params }).then((r) => r.data),
    deleteLog: (id) => client.delete(`/logs/${id}`).then((r) => r.data),
    getSuggestion: (exercise_name) =>
        client.get("/logs/suggestion", { params: { exercise_name } }).then((r) => r.data),
    listExercises: () => client.get("/exercises").then((r) => r.data),
    listVideos: () => client.get("/videos").then((r) => r.data),
    uploadVideo: (exercise_name, file, onProgress) => {
        const fd = new FormData();
        fd.append("exercise_name", exercise_name);
        fd.append("file", file);
        return client
            .post("/videos", fd, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (e) => {
                    if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
                },
                timeout: 300_000,
            })
            .then((r) => r.data);
    },
    linkYoutube: (exercise_name, url) =>
        client.post("/videos/youtube", { exercise_name, url }).then((r) => r.data),
    deleteVideo: (id) => client.delete(`/videos/${id}`).then((r) => r.data),
};

export const ttsUrl = () => `${API}/tts`;
export const absUrl = (path) => `${BACKEND_URL}${path}`;
