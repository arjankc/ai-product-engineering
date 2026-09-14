# Track 9: Local Heritage & Architecture Guide

**Problem:** Visitors receive generic summaries that flatten living heritage, miss conservation context, and give impractical routes between Kathmandu Valley sites.

## Overview

Build a respectful Kathmandu Valley heritage guide grounded in site notes, architectural vocabulary, conservation guidance, and walking routes. It should cite the household or project vault, identify uncertainty, and avoid inventing records, rules, routes, or actions.

Stack: Node/Express starter on this branch + Gemini (`gemini-2.5-flash` / `gemini-embedding-2`) + RAG over `sample-vault/` + optional vision and tool calling.

## Setup

```bash
git fetch --tags
git checkout track-09
cp .env.example .env   # add GEMINI_API_KEY
npm install
npm run dev
```

Open http://localhost:3000. Lab map, gates, and solution walkthrough: see `README` history on `main`, plus [BRANCHES.md](BRANCHES.md) and [HOW-TO-USE-SOLUTIONS.md](HOW-TO-USE-SOLUTIONS.md).

## PRD

### 1. RAG (Core)

- Keep **5–10** substantial Markdown notes in Obsidian / `sample-vault/` (seven starter notes are included).
- Embed with `npm run build-embeddings`, retrieve with cosine similarity, and answer through `ragQuery`.
- Cite source filenames in the UI (`sources` from `/query`) and say when the vault is insufficient.

### 2. Multimodal (Stretch)

- Allow an image upload relevant to this domain.
- Extract visible evidence with Gemini Vision, then interpret it using vault context.
- Do not infer hidden facts, professional conclusions, or unsafe actions from an image alone.

### 3. Tool calling (Stretch)

- Declare `get_walking_distance(from, to)`.
- Return mock walking distances and times for selected Kathmandu Valley heritage pairs.
- Expose it through `POST /tools` while keeping grounded RAG on `POST /query`.

## Starter vault

| Note | Role |
|------|------|
| `Patan-Durbar-Square.md` | Patan Durbar Square |
| `Kathmandu-Durbar-Square.md` | Kathmandu Durbar Square |
| `Bhaktapur-Walk.md` | Bhaktapur Heritage Walk |
| `Architecture-Vocabulary.md` | Architecture Vocabulary |
| `Golden-Temple.md` | Hiranya Varna Mahavihar |
| `Conservation-Ethics.md` | Conservation and Interpretation |
| `Visitor-Practicalities.md` | Visitor Practicalities |

Replace or extend these fictional classroom notes with trustworthy local material before showcase.

## Product constraints

- Keep API keys server-side.
- Preserve `/health`, `/version`, input normalization, and safety checks.
- Treat mock tool output as mock output; never claim an external side effect occurred.
- This assistant supports decisions but does not replace a qualified professional or emergency service.

## Solution reference

Attempt labs on this branch first. When stuck:

```bash
git fetch --tags
git checkout solution-09-phase-2   # example: after Session 7
```

Full phase map: [HOW-TO-USE-SOLUTIONS.md](HOW-TO-USE-SOLUTIONS.md).
