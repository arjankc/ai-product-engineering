# Track 8: Tabletop RPG & Board Game Master

**Problem:** Game sessions stall when rules, campaign lore, character facts, and random rolls are scattered across notebooks and memory.

## Overview

Build a fair tabletop game master grounded in campaign lore, table rules, encounters, and character sheets. It should cite the household or project vault, identify uncertainty, and avoid inventing records, rules, routes, or actions.

Stack: Node/Express starter on this branch + Gemini (`gemini-2.5-flash` / `gemini-embedding-2`) + RAG over `sample-vault/` + optional vision and tool calling.

## Setup

```bash
git fetch --tags
git checkout track-08
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

- Declare `roll_dice(notation)`.
- Parse and roll standard NdM+K dice notation with bounded inputs.
- Expose it through `POST /tools` while keeping grounded RAG on `POST /query`.

## Starter vault

| Note | Role |
|------|------|
| `Campaign-Premise.md` | Campaign Premise |
| `Table-Rules.md` | Table Rules |
| `Party-Roster.md` | Party Roster |
| `Mustang-Lore.md` | Mustang Lore |
| `Encounter-Guide.md` | Encounter Guide |
| `Conditions-and-Rests.md` | Conditions and Rests |
| `Safety-Tools.md` | Table Safety |

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
git checkout solution-08-phase-2   # example: after Session 7
```

Full phase map: [HOW-TO-USE-SOLUTIONS.md](HOW-TO-USE-SOLUTIONS.md).
