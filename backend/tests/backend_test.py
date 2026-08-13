"""Backend API tests for 42+ Home Fitness Comeback app."""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # Fallback: read from frontend/.env
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().strip('"').rstrip("/")
                break

API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Health ----------
class TestHealth:
    def test_health_ok(self, client):
        r = client.get(f"{API}/health", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert data.get("ok") is True


# ---------- Program & Sessions ----------
class TestProgram:
    def test_get_program(self, client):
        r = client.get(f"{API}/program", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert "program" in data and "sessions" in data
        prog = data["program"]
        assert prog["title"] == "42+ HOME FITNESS COMEBACK"
        phase_names = [p["name"] for p in prog["phases"]]
        assert phase_names == ["RECONDITION", "STRENGTH", "STRENGTH + ATHLETICISM"]
        days = [d["day"] for d in prog["weekly_schedule"]]
        assert days == ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
        session_ids = {s["id"] for s in data["sessions"]}
        assert session_ids == {"intro", "full-body-a", "full-body-b", "mobility-core", "cricket-day"}

    def test_get_full_body_a(self, client):
        r = client.get(f"{API}/sessions/full-body-a", timeout=30)
        assert r.status_code == 200
        s = r.json()
        blocks = s["blocks"]
        assert len(blocks) == 18, f"expected 18 blocks, got {len(blocks)}"
        kinds = {b["kind"] for b in blocks}
        for required in ["title", "say", "timed", "exercise", "ending"]:
            assert required in kinds, f"missing kind {required}"
        # Validate exercise fields
        exercises = [b for b in blocks if b["kind"] == "exercise"]
        assert len(exercises) >= 1
        for ex in exercises:
            for field in ["name", "sets", "reps", "rest", "cues", "mistakes", "safety", "svg", "voice"]:
                assert field in ex, f"exercise missing field {field}"

    def test_get_cricket_day_checklist(self, client):
        r = client.get(f"{API}/sessions/cricket-day", timeout=30)
        assert r.status_code == 200
        blocks = r.json()["blocks"]
        checklists = [b for b in blocks if b["kind"] == "checklist"]
        assert len(checklists) == 1
        assert isinstance(checklists[0].get("items"), list)
        assert len(checklists[0]["items"]) > 0

    def test_get_session_nonexistent(self, client):
        r = client.get(f"{API}/sessions/nonexistent", timeout=30)
        assert r.status_code == 404


# ---------- App State ----------
class TestState:
    def test_get_state(self, client):
        r = client.get(f"{API}/state", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert data.get("id") == "singleton"
        assert "current_week" in data
        assert isinstance(data["current_week"], int)

    def test_update_week_valid(self, client):
        r = client.put(f"{API}/state/week", json={"current_week": 5}, timeout=30)
        assert r.status_code == 200
        assert r.json()["current_week"] == 5
        # Verify persistence
        r2 = client.get(f"{API}/state", timeout=30)
        assert r2.json()["current_week"] == 5
        # Reset
        client.put(f"{API}/state/week", json={"current_week": 1}, timeout=30)

    def test_update_week_boundary_zero(self, client):
        r = client.put(f"{API}/state/week", json={"current_week": 0}, timeout=30)
        assert r.status_code == 400

    def test_update_week_boundary_thirteen(self, client):
        r = client.put(f"{API}/state/week", json={"current_week": 13}, timeout=30)
        assert r.status_code == 400


# ---------- Workout Logs & Suggestion ----------
class TestLogs:
    def _clean_exercise(self, client, name):
        r = client.get(f"{API}/logs", params={"exercise_name": name}, timeout=30)
        if r.status_code == 200:
            for log in r.json():
                client.delete(f"{API}/logs/{log['id']}", timeout=30)

    def test_full_log_flow_and_suggestion(self, client):
        ex = "TEST_Barbell Back Squat"
        self._clean_exercise(client, ex)

        # No logs -> suggestion 'start'
        r = client.get(f"{API}/logs/suggestion", params={"exercise_name": ex}, timeout=30)
        assert r.status_code == 200
        assert r.json()["suggestion"] == "start"

        # Create log with hit_top_of_range=false -> suggestion 'hold'
        payload = {
            "session_id": "full-body-a",
            "exercise_name": ex,
            "week": 1,
            "weight_kg": 40.0,
            "reps_top_set": 8,
            "hit_top_of_range": False,
        }
        r = client.post(f"{API}/logs", json=payload, timeout=30)
        assert r.status_code == 200
        entry = r.json()
        assert entry["exercise_name"] == ex
        assert entry["weight_kg"] == 40.0
        log_id_1 = entry["id"]

        # Filter by exercise_name
        r = client.get(f"{API}/logs", params={"exercise_name": ex}, timeout=30)
        assert r.status_code == 200
        logs = r.json()
        assert len(logs) == 1
        assert logs[0]["exercise_name"] == ex

        r = client.get(f"{API}/logs/suggestion", params={"exercise_name": ex}, timeout=30)
        data = r.json()
        assert data["suggestion"] == "hold"
        assert data["next_weight_kg"] == 40.0

        # Add hit_top_of_range=true log -> suggestion 'increase' by 2.5
        time.sleep(1.1)  # ensure created_at ordering
        payload2 = {**payload, "weight_kg": 42.5, "hit_top_of_range": True}
        r = client.post(f"{API}/logs", json=payload2, timeout=30)
        assert r.status_code == 200
        log_id_2 = r.json()["id"]

        r = client.get(f"{API}/logs/suggestion", params={"exercise_name": ex}, timeout=30)
        data = r.json()
        assert data["suggestion"] == "increase"
        assert data["last_weight_kg"] == 42.5
        assert data["next_weight_kg"] == 45.0

        # Delete both
        r = client.delete(f"{API}/logs/{log_id_1}", timeout=30)
        assert r.status_code == 200
        r = client.delete(f"{API}/logs/{log_id_2}", timeout=30)
        assert r.status_code == 200

        # Verify empty
        r = client.get(f"{API}/logs", params={"exercise_name": ex}, timeout=30)
        assert r.json() == []

    def test_delete_nonexistent_log(self, client):
        r = client.delete(f"{API}/logs/nonexistent-id-xyz", timeout=30)
        assert r.status_code == 404


# ---------- TTS ----------
class TestTTS:
    def test_tts_generates_and_caches(self, client):
        text = "Squat."
        # First call (may generate)
        t0 = time.time()
        r = client.post(f"{API}/tts", json={"text": text}, timeout=60)
        dt1 = time.time() - t0
        assert r.status_code == 200, f"tts failed: {r.status_code} {r.text[:400]}"
        assert r.headers.get("content-type", "").startswith("audio/mpeg")
        assert len(r.content) > 100

        # Second call should be cache-hit and fast
        t0 = time.time()
        r2 = client.post(f"{API}/tts", json={"text": text}, timeout=60)
        dt2 = time.time() - t0
        assert r2.status_code == 200
        assert r2.headers.get("content-type", "").startswith("audio/mpeg")
        # Cache hit should be reasonably fast
        print(f"TTS first={dt1:.2f}s second={dt2:.2f}s")
        assert dt2 < max(2.0, dt1)  # second call at least not slower

    def test_tts_empty_text(self, client):
        r = client.post(f"{API}/tts", json={"text": ""}, timeout=30)
        assert r.status_code == 400
