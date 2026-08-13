# 42+ HOME FITNESS COMEBACK

A follow-along guided workout web app for the 42-year-old weekend cricketer with a five-year training gap. It delivers a 5-session, 12-week program as a **video-series experience** — huge timer, illustrated form diagrams (or your own clips), calm male voiceover — instead of one long AI-generated trainer video that can't hold form or rep counts.

Live URL (this deployment): **https://cricket-fit-program.preview.emergentagent.com**

---

## The Program

- **Duration:** 12 weeks, three phases
  - Weeks 1–4 · **RECONDITION** · rebuild movement patterns
  - Weeks 5–8 · **STRENGTH** · real load, honest RIR 2–3
  - Weeks 9–12 · **STRENGTH + ATHLETICISM** · layer in power for cricket

- **Weekly schedule:**
  | Day | Session |
  |---|---|
  | MON | Recovery / walk |
  | TUE | Full Body Strength A |
  | WED | Active recovery |
  | THU | Full Body Strength B |
  | FRI | Mobility + Core |
  | SAT / SUN | Cricket Day (warm-up + cool-down + match-day readiness checklist) |

- **The five sessions:**
  1. Program Intro & How To Use
  2. Full Body Strength A (Tue): back squat, bent row, overhead press, curl
  3. Full Body Strength B (Thu): RDL, floor press, reverse curl, shrug
  4. Mobility + Core (Fri): mobility flow + 3-round core circuit
  5. Cricket Day: 5-item readiness checklist → 8-min dynamic warm-up → post-match cool-down

- **Equipment (locked):** 5-ft straight bar · 3-ft curl bar · 3 dumbbell handles · 4 × 2.5 kg + 4 × 5 kg plates · bodyweight. No bench, no rack.

- **Progression rule (locked):** Same weight across three working sets. When you clear the top of the rep range on all three with clean form → next session, add the smallest plate (~2.5 kg).

---

## Features

| Feature | Where |
|---|---|
| 12-week overview + weekly Mon–Sun calendar + today’s suggestion | Home |
| Phase badge + week picker (1–12) | Home |
| Auto-advancing session player with title / coach-say / timed / exercise / ending blocks | `/session/:id` |
| Huge Anton timer digits over a swept progress ring | Session player |
| Per-exercise cues, common mistakes, safety warning | Exercise blocks |
| Illustrated chalk-line SVG figures with per-movement CSS animation (35+ movements) | Session player |
| **Upload your own form clip** (mp4/mov/webm/m4v, up to 100 MB) — one per exercise | `/videos` |
| **Link a YouTube video** (regular, Shorts, `youtu.be`, embed) — plays muted / looped in place of the figure | `/videos` |
| TTS voiceover with OpenAI **`onyx`** (deep neutral male), on-disk cached | Session player |
| Optional ambient music with automatic voice ducking | Session player |
| Match-day readiness checklist (5 items) before cricket warm-up | Cricket Day session |
| Workout log with progressive-overload suggestions (+2.5 kg when top of range cleared) | `/logs` |
| Keyboard shortcuts: `space` pause / `←→` skip / `esc` exit | Session player |
| Single-user, no login (personal tool) | — |

---

## Tech Stack

- **Frontend:** React 19, React Router 7, Tailwind CSS, shadcn/ui, `lucide-react`, `sonner`
- **Backend:** FastAPI (Python 3.11), Motor (async MongoDB driver), Pydantic v2
- **Database:** MongoDB (single `test_database`)
- **AI voice:** OpenAI TTS via `emergentintegrations` (Universal Emergent LLM key), file-cached at `backend/tts_cache/`
- **User video storage:** local disk at `backend/uploads/`, served via FastAPI `StaticFiles`
- **Typography:** Anton (display) · IBM Plex Sans (body) · JetBrains Mono (timer / labels)
- **Aesthetic:** athletic brutalist — Obsidian black · Bone off-white · Blaze red · Chalk yellow · sharp corners · thin hairlines · grain overlay

---

## Backend API

All routes are prefixed with `/api`.

### Program & sessions
- `GET /api/program` — program metadata, 3 phases, 7-day schedule, equipment, principles, session summaries
- `GET /api/sessions/{id}` — full block sequence for a session (`intro`, `full-body-a`, `full-body-b`, `mobility-core`, `cricket-day`)
- `GET /api/exercises` — de-duplicated list of every named movement in the program

### State (single user)
- `GET /api/state` — `{ current_week, started_at, updated_at }`
- `PUT /api/state/week` — body `{ current_week: 1..12 }`

### Workout log
- `POST /api/logs` — `{ session_id, exercise_name, week, weight_kg, reps_top_set, hit_top_of_range }`
- `GET /api/logs?exercise_name=…` — recent entries
- `GET /api/logs/suggestion?exercise_name=…` — `{ suggestion: "start"|"hold"|"increase", next_weight_kg, message }`
- `DELETE /api/logs/{id}`

### Voiceover
- `POST /api/tts` — `{ text, voice? }` returns `audio/mpeg`, cached by hash

### User videos
- `POST /api/videos` — multipart: `exercise_name` (form field) + `file` (mp4/mov/webm/m4v, ≤ 100 MB)
- `POST /api/videos/youtube` — JSON: `{ exercise_name, url }` — accepts Shorts / `watch?v=` / `youtu.be` / embed
- `GET /api/videos` — all records
- `GET /api/videos/by-exercise?exercise_name=…` — single lookup
- `DELETE /api/videos/{id}` — removes record + unlinks the file for uploads
- `GET /api/uploads/{filename}` — StaticFiles serving

- `GET /api/health` — service check

---

## Frontend Routes

- `/` — Home (calendar, weeks, phases, session cards)
- `/session/:id` — Session player
- `/logs` — Workout log with progressive-overload suggestion
- `/videos` — Form-clip manager (upload or paste a YouTube link per lift)

---

## Project Layout

```
/app
├── backend
│   ├── server.py         # FastAPI app + all /api routes
│   ├── seed_data.py      # program + all 5 sessions (code-defined content)
│   ├── tts_service.py    # OpenAI TTS + disk cache
│   ├── requirements.txt
│   ├── tts_cache/        # generated .mp3 files (persisted)
│   ├── uploads/          # user-uploaded form videos (persisted)
│   └── .env              # MONGO_URL, DB_NAME, EMERGENT_LLM_KEY, CORS_ORIGINS
├── frontend
│   ├── src
│   │   ├── App.js
│   │   ├── index.css     # theme, fonts, per-exercise CSS animations
│   │   ├── pages
│   │   │   ├── Home.jsx
│   │   │   ├── SessionPlayer.jsx
│   │   │   ├── Logs.jsx
│   │   │   └── Videos.jsx
│   │   ├── components
│   │   │   ├── TimerRing.jsx
│   │   │   ├── SessionCard.jsx
│   │   │   ├── WeekCalendar.jsx
│   │   │   ├── MatchDayChecklist.jsx
│   │   │   ├── ExerciseSvg.jsx    # 35+ chalk-line animated figures
│   │   │   └── ui/                # shadcn primitives
│   │   ├── lib
│   │   │   ├── api.js             # axios client for /api
│   │   │   ├── audio.js           # TTS player + music ducking
│   │   │   ├── testIds.js         # data-testid registry
│   │   │   └── utils.js
│   │   └── constants/
│   ├── tailwind.config.js
│   └── .env              # REACT_APP_BACKEND_URL
├── memory/PRD.md
└── tests/
```

---

## Content Model (session block kinds)

A session is an ordered list of `blocks`. The player renders one block at a time and auto-advances.

| `kind` | Fields | Player behavior |
|---|---|---|
| `title` | `heading`, `sub`, `duration` | Big display card, auto-advances |
| `say` | `heading`, `body`, `voice`, `duration` | Coach-says panel with TTS |
| `checklist` | `heading`, `items[]` | User taps each item, then continues |
| `timed` | `name`, `work`, `rest`, `cues[]`, `mistakes[]`, `safety`, `svg`, `voice` | Countdown WORK → optional REST → next |
| `exercise` | `name`, `sets`, `reps`, `rest`, `equipment`, `cues[]`, `mistakes[]`, `safety`, `svg`, `voice` | Loops WORK (user taps SET DONE) → REST countdown × `sets` |
| `ending` | `heading`, `sub` | Session-complete card |

---

## Running Locally

The workspace is already wired up under supervisor; you shouldn't need to start anything manually.

```bash
# restart backend after .env or dependency changes
sudo supervisorctl restart backend

# restart frontend
sudo supervisorctl restart frontend

# logs
tail -f /var/log/supervisor/backend.err.log
tail -f /var/log/supervisor/frontend.err.log
```

**Never** hardcode URLs — the frontend always reads `REACT_APP_BACKEND_URL`, the backend always reads `MONGO_URL` / `DB_NAME`.

---

## Testing

- Backend integration tests live in `/app/backend/tests/` (pytest)
- End-to-end reports land in `/app/test_reports/iteration_<n>.json`
- Two iterations covered so far — all 27 backend tests passed (13 in v1 core, 14 in v2 videos)

---

## Design Language

- **Palette:** Obsidian `#0B0B0D` background · Bone `#F0EAD9` foreground · Blaze `#DC2626` primary · Chalk `#F5C842` accent
- **Type:** Anton for display (heading, timer digits) · IBM Plex Sans for body · JetBrains Mono for stat labels
- **Motifs:** thin 1 px hairlines, sharp corners (`--radius: 0.25rem`), grain overlay, blaze-red pulse dot, striped mat backgrounds behind exercise figures
- **Motion:** every exercise SVG has a bespoke keyframe animation matched to the movement (squats descend, RDL hinges, curls rotate the forearms, etc.)

---

## Not Included in v1

- Auth / multi-device sync (deferred, single-user personal tool)
- Real AI-generated exercise videos (SVGs + user upload / YouTube link cover it)
- Wearables / heart-rate integration
- Nutrition guidance

---

## License

Personal project. Program content authored for the target athlete described above.
