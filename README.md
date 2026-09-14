# Track 2: Smart Pantry & Recipe Architect

**Problem:** Meal planning fails when leftovers, expiry, and household allergies are scattered across memory and chatbots invent unsafe recipes.

## Overview

Build a kitchen assistant grounded **only** in household profiles, pantry inventory, and trusted recipes. It must respect allergens and refuse ingredients that violate household rules.

Stack: Node/Express starter on this branch + Gemini (`gemini-2.5-flash` / `gemini-embedding-2`) + RAG over `sample-vault/` + optional vision and tool calling.

## Setup

```bash
git fetch --tags
git checkout track-02
cp .env.example .env   # add GEMINI_API_KEY
npm install
npm run dev
```

Open http://localhost:3000. See also [BRANCHES.md](BRANCHES.md) and [HOW-TO-USE-SOLUTIONS.md](HOW-TO-USE-SOLUTIONS.md).

## PRD

### 1. RAG (Core)

- Keep **5–10** Markdown notes (starter vault included).
- Embed, retrieve, answer with citations (`sources` on `/query`).
- Retrieve dietary restrictions **before** suggesting meals.

### 2. Multimodal (Stretch)

- Upload an open fridge / pantry photo.
- Identify visible ingredients and propose a **safe** meal using vault rules only.

### 3. Tool calling (Stretch)

- Declare `calculate_nutrition` with param `ingredients` (string array or comma-separated list).
- Return a small hardcoded macro estimate via `POST /tools`.

## Starter vault

| Note | Role |
|------|------|
| `Dad-Profile.md` | Lactose intolerance rules |
| `Kid-Profile.md` | Peanut allergy (hard refuse) |
| `Pantry-Inventory.md` | What is on hand |
| `Family-Recipes.md` | Trusted base recipes |
| `Allergen-Rules.md` | Cross-contamination |
| `Expiry-Log.md` | Use-soon items |
| `Shopping-Staples.md` | Usual restocks |

## Solution reference

```bash
git fetch --tags
git checkout solution-02-phase-2
```

Full map: [HOW-TO-USE-SOLUTIONS.md](HOW-TO-USE-SOLUTIONS.md).
