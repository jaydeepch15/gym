"""Backend tests for iteration 3: YouTube orientation (portrait for Shorts, landscape otherwise)."""
import os
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().strip('"').rstrip("/")
                break
API = f"{BASE_URL}/api"

SHORTS_URL = "https://www.youtube.com/shorts/omXcDmLBtzc"
REG_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
SHORT_ALIAS = "https://youtu.be/dQw4w9WgXcQ"


def _cleanup(names):
    r = requests.get(f"{API}/videos")
    if r.status_code == 200:
        for v in r.json():
            if v["exercise_name"] in names:
                requests.delete(f"{API}/videos/{v['id']}")


class TestYoutubeOrientation:
    ex_portrait = "Neck rolls"
    ex_landscape = "TEST_Landscape_Ex"
    ex_short_alias = "TEST_ShortAlias_Ex"

    @classmethod
    def setup_class(cls):
        _cleanup([cls.ex_portrait, cls.ex_landscape, cls.ex_short_alias])

    @classmethod
    def teardown_class(cls):
        _cleanup([cls.ex_portrait, cls.ex_landscape, cls.ex_short_alias])

    def test_shorts_orientation_portrait(self):
        r = requests.post(f"{API}/videos/youtube", json={
            "exercise_name": self.ex_portrait, "url": SHORTS_URL
        })
        assert r.status_code == 200, r.text
        rec = r.json()
        assert rec["kind"] == "youtube"
        assert rec["orientation"] == "portrait"
        assert rec["youtube_id"] == "omXcDmLBtzc"
        assert "embed_url" in rec and "/embed/omXcDmLBtzc" in rec["embed_url"]

    def test_regular_watch_url_landscape(self):
        r = requests.post(f"{API}/videos/youtube", json={
            "exercise_name": self.ex_landscape, "url": REG_URL
        })
        assert r.status_code == 200, r.text
        rec = r.json()
        assert rec["orientation"] == "landscape"
        assert rec["youtube_id"] == "dQw4w9WgXcQ"

    def test_youtu_be_alias_landscape(self):
        r = requests.post(f"{API}/videos/youtube", json={
            "exercise_name": self.ex_short_alias, "url": SHORT_ALIAS
        })
        assert r.status_code == 200, r.text
        rec = r.json()
        assert rec["orientation"] == "landscape"

    def test_list_videos_includes_orientation(self):
        r = requests.get(f"{API}/videos")
        assert r.status_code == 200
        yts = [v for v in r.json() if v.get("kind") == "youtube"]
        assert len(yts) >= 1
        for v in yts:
            assert "orientation" in v
            assert v["orientation"] in ("portrait", "landscape")

    def test_by_exercise_includes_orientation(self):
        r = requests.get(f"{API}/videos/by-exercise", params={"exercise_name": self.ex_portrait})
        assert r.status_code == 200
        v = r.json().get("video")
        assert v is not None
        assert v.get("orientation") == "portrait"

    def test_invalid_url_returns_400(self):
        r = requests.post(f"{API}/videos/youtube", json={
            "exercise_name": "TEST_bad", "url": "https://example.com/foo"
        })
        assert r.status_code == 400
