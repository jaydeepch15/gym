"""Backend tests for iteration 2: exercises catalog, video upload/serve, regression checks."""
import os
import io
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://cricket-fit-program.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"
TINY_MP4 = "/tmp/tiny.mp4"


@pytest.fixture(scope="module")
def tiny_mp4_bytes():
    with open(TINY_MP4, "rb") as f:
        return f.read()


# ---------- Regression (iteration 1) ----------
class TestRegression:
    def test_health(self):
        r = requests.get(f"{API}/health")
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_program(self):
        r = requests.get(f"{API}/program")
        assert r.status_code == 200
        d = r.json()
        assert "program" in d and "sessions" in d
        assert isinstance(d["sessions"], list) and len(d["sessions"]) > 0

    def test_session_full_body_a(self):
        r = requests.get(f"{API}/sessions/full-body-a")
        assert r.status_code == 200
        assert r.json().get("id") == "full-body-a"

    def test_state(self):
        r = requests.get(f"{API}/state")
        assert r.status_code == 200
        assert "current_week" in r.json()

    def test_logs_list(self):
        r = requests.get(f"{API}/logs")
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ---------- Exercises catalog ----------
class TestExercises:
    def test_exercises_list(self):
        r = requests.get(f"{API}/exercises")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list) and len(data) > 0
        names = {e["name"] for e in data}
        expected = {"Barbell Back Squat", "Bent-Over Barbell Row", "Standing Overhead Press",
                    "Barbell Curl", "Dead Bug"}
        missing = expected - names
        assert not missing, f"Missing exercises: {missing}"
        # Field shape
        for e in data:
            assert "name" in e and "kind" in e and "sessions" in e
            assert isinstance(e["sessions"], list) and len(e["sessions"]) >= 1
            assert "svg" in e


# ---------- Videos ----------
class TestVideos:
    created_ids = []

    def test_upload_video_success(self, tiny_mp4_bytes):
        files = {"file": ("tiny.mp4", tiny_mp4_bytes, "video/mp4")}
        data = {"exercise_name": "Barbell Back Squat"}
        r = requests.post(f"{API}/videos", files=files, data=data)
        assert r.status_code == 200, r.text
        rec = r.json()
        for k in ("id", "exercise_name", "filename", "url", "size_bytes"):
            assert k in rec, f"missing key {k}"
        assert rec["exercise_name"] == "Barbell Back Squat"
        assert rec["size_bytes"] > 0
        assert rec["url"].startswith("/api/uploads/")
        TestVideos.created_ids.append(rec["id"])
        TestVideos.first_url = rec["url"]
        TestVideos.first_filename = rec["filename"]
        TestVideos.first_id = rec["id"]

    def test_list_videos_contains_upload(self):
        r = requests.get(f"{API}/videos")
        assert r.status_code == 200
        rows = r.json()
        assert any(v["id"] == TestVideos.first_id for v in rows)

    def test_by_exercise_lookup(self):
        r = requests.get(f"{API}/videos/by-exercise", params={"exercise_name": "Barbell Back Squat"})
        assert r.status_code == 200
        j = r.json()
        assert j.get("video") is not None
        assert j["video"]["id"] == TestVideos.first_id

    def test_static_serve(self):
        r = requests.get(f"{BASE_URL}{TestVideos.first_url}")
        assert r.status_code == 200, f"static serve failed: {r.status_code} {r.text[:200]}"
        assert len(r.content) > 0

    def test_replace_video_for_same_exercise(self, tiny_mp4_bytes):
        old_id = TestVideos.first_id
        old_filename = TestVideos.first_filename
        files = {"file": ("tiny2.mp4", tiny_mp4_bytes, "video/mp4")}
        data = {"exercise_name": "Barbell Back Squat"}
        r = requests.post(f"{API}/videos", files=files, data=data)
        assert r.status_code == 200, r.text
        rec = r.json()
        assert rec["id"] != old_id
        TestVideos.created_ids.append(rec["id"])
        TestVideos.first_id = rec["id"]
        TestVideos.first_url = rec["url"]

        # Only one record for that exercise
        r2 = requests.get(f"{API}/videos")
        rows = [v for v in r2.json() if v["exercise_name"] == "Barbell Back Squat"]
        assert len(rows) == 1
        assert rows[0]["id"] == rec["id"]

        # Old static file should now 404
        r3 = requests.get(f"{BASE_URL}/api/uploads/{old_filename}")
        assert r3.status_code == 404, f"old file still served: {r3.status_code}"

    def test_upload_bad_type(self):
        files = {"file": ("bad.txt", b"hello world", "text/plain")}
        data = {"exercise_name": "Barbell Curl"}
        r = requests.post(f"{API}/videos", files=files, data=data)
        assert r.status_code == 400, f"expected 400, got {r.status_code}: {r.text}"

    def test_delete_video(self):
        vid = TestVideos.first_id
        r = requests.delete(f"{API}/videos/{vid}")
        assert r.status_code == 200
        assert r.json().get("ok") is True

        r2 = requests.get(f"{API}/videos/by-exercise", params={"exercise_name": "Barbell Back Squat"})
        assert r2.status_code == 200
        assert r2.json().get("video") is None

    def test_cleanup(self):
        # Best-effort cleanup of any remaining
        r = requests.get(f"{API}/videos")
        for v in r.json():
            if v["exercise_name"] in ("Barbell Back Squat", "Barbell Curl"):
                requests.delete(f"{API}/videos/{v['id']}")
