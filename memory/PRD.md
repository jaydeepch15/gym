# 42+ Home Fitness Comeback — PRD

## Original Problem Statement
A React web app that delivers a 5-session, 12-week program as a follow-along guided experience (title cards + timers + voiceover + form illustrations) instead of long AI-generated trainer videos. Home screen with 12-week overview and weekly Mon-Sun calendar. 5 sessions (Intro, Full Body A, Full Body B, Mobility+Core, Cricket Day). Auto-advancing sequence with per-exercise data, countdown timer, illustrated figures, TTS voiceover, ambient music (duckable), workout log with progressive overload suggestions, week tracker, match-day checklist.

## User
42-year-old male, 5-year training gap, weekend turf cricketer (~4h Sat + Sun). Wants strength, mobility, core, cricket support, low injury risk.

## User Choices Locked
- **TTS**: OpenAI `onyx` (deep male voice) via Emergent LLM key, cached on disk
- **Visuals**: Chalk-line SVG figures with subtle CSS motion
- **Auth**: Single user, no login (personal tool)
- **Friday auto-suggest + match-day checklist**: enabled (checklist runs at start of Cricket Day session)

## Architecture
- FastAPI backend (Motor/MongoDB) at `/api/*`
- React 19 frontend (Anton display + IBM Plex Sans + JetBrains Mono for timer)
- OpenAI TTS via emergentintegrations, on-disk `tts_cache/` for mp3 reuse
- Session content code-defined (`backend/seed_data.py`) — swap-friendly
- Singleton `app_state` doc tracks current week

## Endpoints
- `GET /api/program` — program + phases + weekly schedule + session summaries
- `GET /api/sessions/{id}` — full block sequence for a session
- `GET /api/state` / `PUT /api/state/week` — week tracker
- `POST /api/logs` / `GET /api/logs` / `DELETE /api/logs/{id}` — workout log
- `GET /api/logs/suggestion?exercise_name=` — progressive overload prompt
- `POST /api/tts` — cached mp3 stream

## Implemented (v1 — 2026-02-13)
- Home screen: hero, week picker (1-12), phase badge, weekly Mon-Sun calendar, TODAY suggestion, 5 session cards, 12-week arc timeline, equipment & principles panels, log link
- SessionPlayer: full-screen, huge Anton timer digits, ring progress, per-block screens (title / say / checklist / timed / exercise / ending), auto-advance, mark-set-done, add-30s-rest, TTS voice with music ducking, keyboard shortcuts (space, arrows, esc)
- Match-day checklist block for Cricket Day
- Workout log page: form + auto-suggested next weight (progressive overload rule: cleared top → +2.5 kg)
- OpenAI TTS `onyx` voice, disk-cached
- Chalk-line SVG figures for 35+ exercise types

## Backlog / Nice-to-have (v2)
- P1: Session completion → auto-log prompt for lifts done today
- P1: Weekly summary email / share card
- P2: Multi-user optional login for phone/laptop sync
- P2: Alternate voices (ElevenLabs Indian-English male)
- P2: Sora 2 short motion clips per lift (would replace SVG)
- P2: Deload week detection + prompt
