# Track 5: Personal Fitness & Rehab Coach

**Problem:** Generic workout advice ignores injury history, clinician restrictions, equipment limits, and gradual progression, creating avoidable risk.

## Overview

Build a conservative coaching assistant grounded **only** in your approved rehab plan, training log, equipment list, and recovery notes. It must prioritize clinician restrictions and escalate red-flag symptoms.

Stack: Node/Express starter on this branch + Gemini (`gemini-2.5-flash` / `gemini-embedding-2`) + RAG over `sample-vault/` + optional vision and tool calling.

## Setup

```bash
git fetch --tags
git checkout track-05
cp .env.example .env   # add GEMINI_API_KEY
npm install
npm run dev
```

Open http://localhost:3000. See also [BRANCHES.md](BRANCHES.md) and [HOW-TO-USE-SOLUTIONS.md](HOW-TO-USE-SOLUTIONS.md).

## PRD

### 1. RAG (Core)

- Keep **5–10** Markdown notes (seven starter notes are included).
- Embed with `npm run build-embeddings`, retrieve with cosine similarity, and answer with source citations.
- Treat explicit safety, booking, or restriction notes as higher priority than general suggestions.

### 2. Multimodal (Stretch)

- Upload a exercise setup or equipment photo.
- Interpret it using principles and constraints from the vault only.

### 3. Tool calling (Stretch)

- Declare `generate_workout_timer` with `rest_seconds` (number).
- Return JSON with `rest_seconds`, `started_at`, and `ends_at`; do not invent a timer URL.

## Starter vault

| Note | Role |
|---|---|
| `Client-Profile.md` | Client Profile |
| `Clinician-Restrictions.md` | Clinician Restrictions |
| `Approved-Rehab-Plan.md` | Approved Rehab Plan |
| `Pain-and-Effort-Scale.md` | Pain and Effort Scale |
| `Progression-Rules.md` | Progression Rules |
| `Training-Log.md` | Training Log |
| `Recovery-Checklist.md` | Recovery Checklist |

Replace the examples with your own trustworthy notes before showcase.

## Solution reference

```bash
git fetch --tags
git checkout solution-05-phase-2
```

Full map: [HOW-TO-USE-SOLUTIONS.md](HOW-TO-USE-SOLUTIONS.md).
