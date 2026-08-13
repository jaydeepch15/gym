from fastapi import FastAPI, APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any, Dict
import uuid
from datetime import datetime, timezone

from seed_data import PROGRAM, ALL_SESSIONS
from tts_service import get_or_generate_audio, DEFAULT_VOICE, DEFAULT_MODEL

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="42+ Home Fitness Comeback")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
log = logging.getLogger(__name__)


# ---------- Models ----------
class WorkoutLogEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    exercise_name: str
    week: int
    weight_kg: float
    reps_top_set: int
    hit_top_of_range: bool = False
    note: Optional[str] = ""
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class WorkoutLogCreate(BaseModel):
    session_id: str
    exercise_name: str
    week: int
    weight_kg: float
    reps_top_set: int
    hit_top_of_range: bool = False
    note: Optional[str] = ""


class AppState(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "singleton"
    current_week: int = 1
    started_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class WeekUpdate(BaseModel):
    current_week: int


class TTSRequest(BaseModel):
    text: str
    voice: Optional[str] = None


# ---------- Startup: nothing to seed in DB (sessions are code-defined) ----------
@app.on_event("startup")
async def on_startup():
    # ensure singleton app_state
    existing = await db.app_state.find_one({"id": "singleton"})
    if not existing:
        state = AppState()
        await db.app_state.insert_one(state.model_dump())
        log.info("initialised app_state singleton")


# ---------- Program + Sessions ----------
@api.get("/program")
async def get_program():
    """Return the full program spec (phases, schedule, equipment, principles) + session summaries."""
    session_summaries = [
        {
            "id": s["id"],
            "code": s["code"],
            "title": s["title"],
            "subtitle": s["subtitle"],
            "day": s["day"],
            "duration_min": s["duration_min"],
            "color": s["color"],
        }
        for s in ALL_SESSIONS
    ]
    return {"program": PROGRAM, "sessions": session_summaries}


@api.get("/sessions/{session_id}")
async def get_session(session_id: str):
    for s in ALL_SESSIONS:
        if s["id"] == session_id:
            return s
    raise HTTPException(status_code=404, detail="session not found")


# ---------- App state (current week) ----------
@api.get("/state")
async def get_state():
    doc = await db.app_state.find_one({"id": "singleton"}, {"_id": 0})
    if not doc:
        state = AppState()
        await db.app_state.insert_one(state.model_dump())
        return state.model_dump()
    return doc


@api.put("/state/week")
async def update_week(payload: WeekUpdate):
    if payload.current_week < 1 or payload.current_week > PROGRAM["total_weeks"]:
        raise HTTPException(status_code=400, detail="week must be 1..12")
    now = datetime.now(timezone.utc).isoformat()
    await db.app_state.update_one(
        {"id": "singleton"},
        {"$set": {"current_week": payload.current_week, "updated_at": now}},
        upsert=True,
    )
    doc = await db.app_state.find_one({"id": "singleton"}, {"_id": 0})
    return doc


# ---------- Workout log ----------
@api.post("/logs", response_model=WorkoutLogEntry)
async def create_log(payload: WorkoutLogCreate):
    entry = WorkoutLogEntry(**payload.model_dump())
    await db.workout_logs.insert_one(entry.model_dump())
    return entry


@api.get("/logs", response_model=List[WorkoutLogEntry])
async def list_logs(session_id: Optional[str] = None, exercise_name: Optional[str] = None, limit: int = 500):
    q: Dict[str, Any] = {}
    if session_id:
        q["session_id"] = session_id
    if exercise_name:
        q["exercise_name"] = exercise_name
    cur = db.workout_logs.find(q, {"_id": 0}).sort("created_at", -1).limit(limit)
    return await cur.to_list(limit)


@api.get("/logs/suggestion")
async def suggestion(exercise_name: str = Query(...)):
    """Suggest progressive overload for the next session of this exercise."""
    cur = db.workout_logs.find({"exercise_name": exercise_name}, {"_id": 0}).sort("created_at", -1).limit(3)
    recent = await cur.to_list(3)
    if not recent:
        return {"exercise_name": exercise_name, "suggestion": "start", "last_weight_kg": None, "message": "Start with a weight you can control cleanly for the top of the rep range."}
    last = recent[0]
    if last["hit_top_of_range"]:
        return {
            "exercise_name": exercise_name,
            "suggestion": "increase",
            "last_weight_kg": last["weight_kg"],
            "next_weight_kg": round(last["weight_kg"] + 2.5, 2),
            "message": "You cleared the top of the range last session. Add the smallest plate (about 2.5 kg).",
        }
    return {
        "exercise_name": exercise_name,
        "suggestion": "hold",
        "last_weight_kg": last["weight_kg"],
        "next_weight_kg": last["weight_kg"],
        "message": "Hold the same weight and try to clear the top of the range with clean form.",
    }


@api.delete("/logs/{log_id}")
async def delete_log(log_id: str):
    res = await db.workout_logs.delete_one({"id": log_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="log not found")
    return {"ok": True}


# ---------- TTS ----------
@api.post("/tts")
async def tts(payload: TTSRequest):
    """Generate (or return cached) TTS audio for a coaching cue. Returns mp3."""
    try:
        text = (payload.text or "").strip()
        if not text:
            raise HTTPException(status_code=400, detail="text required")
        if len(text) > 4000:
            text = text[:4000]
        voice = payload.voice or DEFAULT_VOICE
        fp = await get_or_generate_audio(text, voice=voice, model=DEFAULT_MODEL)
        return FileResponse(fp, media_type="audio/mpeg", headers={"Cache-Control": "public, max-age=31536000"})
    except HTTPException:
        raise
    except Exception as e:
        log.exception("tts failure")
        raise HTTPException(status_code=500, detail=f"tts failed: {e}")


@api.get("/health")
async def health():
    return {"ok": True, "ts": datetime.now(timezone.utc).isoformat()}


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
