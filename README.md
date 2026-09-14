# Track 7: Household Plant Care & Botany Assistant

**Problem:** Generic plant advice ignores local weather, pot conditions, and a household's actual care history, leading to overwatering and preventable plant stress.

## Overview

Build a household plant-care assistant grounded in species cards, watering logs, pest notes, and Kathmandu Valley conditions. It should cite the household or project vault, identify uncertainty, and avoid inventing records, rules, routes, or actions.

Stack: Node/Express starter on this branch + Gemini (`gemini-2.5-flash` / `gemini-embedding-2`) + RAG over `sample-vault/` + optional vision and tool calling.

## Setup

```bash
git fetch --tags
git checkout track-07
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

- Declare `check_local_weather(city)`.
- Return mock local growing conditions for Kathmandu or Pokhara.
- Expose it through `POST /tools` while keeping grounded RAG on `POST /query`.

## Starter vault

| Note | Role |
|------|------|
| `Plant-Inventory.md` | Household Plant Inventory |
| `Watering-Protocol.md` | Watering Protocol |
| `Monsoon-Care.md` | Kathmandu Monsoon Care |
| `Winter-Care.md` | Winter Care |
| `Pest-Guide.md` | Common Household Pests |
| `Fertilizer-Notes.md` | Fertilizer Notes |
| `Safety-and-Toxicity.md` | Household Safety |

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
git checkout solution-07-phase-2   # example: after Session 7
```

Full phase map: [HOW-TO-USE-SOLUTIONS.md](HOW-TO-USE-SOLUTIONS.md).
