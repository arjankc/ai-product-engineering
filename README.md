# Track 1: Context-Aware Academic Assistant

**Problem:** Generic AI invents syllabus details and teaches methods that differ from the professor's.

## Overview

Build a study assistant grounded **only** in your course materials (syllabus, lectures, assignments, rubrics). It should refuse or clearly hedge when a question is outside the vault.

Stack: Node/Express starter on this branch + Gemini (`gemini-2.5-flash` / `gemini-embedding-2`) + RAG over `sample-vault/` + optional vision and tool calling.

## Setup

```bash
git fetch --tags
git checkout track-01
cp .env.example .env   # add GEMINI_API_KEY
npm install
npm run dev
```

Open http://localhost:3000. Lab map, gates, and solution walkthrough: see `README` history on `main`, plus [BRANCHES.md](BRANCHES.md) and [HOW-TO-USE-SOLUTIONS.md](HOW-TO-USE-SOLUTIONS.md).

## PRD

### 1. RAG (Core)

- Keep **5–10** Markdown notes in Obsidian / `sample-vault/` (starter notes are included).
- Embed with `npm run build-embeddings`, retrieve with cosine similarity, answer via RAG.
- Cite source filenames in the UI (`sources` from `/query`).

### 2. Multimodal (Stretch)

- Allow image upload (worksheet / handout photo).
- Extract text/structure with Gemini Vision and explain using principles from the vault only.

### 3. Tool calling (Stretch)

- Declare `get_upcoming_deadlines` (optional `course_code`).
- Return hardcoded JSON deadlines (e.g. Assignment 1, midterm) via `POST /tools` or the tool loop.

## Starter vault

| Note | Role |
|------|------|
| `Syllabus.md` | Grading, late policy, contact |
| `Lecture-01-Big-O.md` | Professor's preferred Big-O framing |
| `Lecture-02-Recursion.md` | Recursion teaching rules |
| `Assignment-1.md` | JS assignment constraints |
| `Assignment-2.md` | Data-structures assignment |
| `Rubric-Exams.md` | How exams are scored |
| `Office-Hours.md` | When/how to get help |
| `FAQ-Course.md` | Common policy Q&A |

Replace these with your real course notes before showcase.

## Solution reference

Attempt labs on this branch first. When stuck:

```bash
git fetch --tags
git checkout solution-01-phase-2   # example: after Session 7
```

Full phase map: [HOW-TO-USE-SOLUTIONS.md](HOW-TO-USE-SOLUTIONS.md).
