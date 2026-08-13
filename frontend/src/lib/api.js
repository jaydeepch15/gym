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
};

export const ttsUrl = () => `${API}/tts`;
