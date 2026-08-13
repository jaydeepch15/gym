import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@/index.css";
import Home from "./pages/Home";
import SessionPlayer from "./pages/SessionPlayer";
import Logs from "./pages/Logs";
import Videos from "./pages/Videos";

function App() {
    return (
        <div className="App dark min-h-screen bg-obsidian text-bone">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/session/:id" element={<SessionPlayer />} />
                    <Route path="/logs" element={<Logs />} />
                    <Route path="/videos" element={<Videos />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
