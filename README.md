# Track 4: Travel Log & Itinerary Copilot

**Problem:** Trip plans become inconsistent when bookings, budgets, local notes, and accessibility needs are spread across documents and generic AI invents reservations or opening hours.

## Overview

Build a travel copilot grounded **only** in your trip vault. It should distinguish confirmed bookings from ideas, respect budget and accessibility constraints, and cite the notes behind every itinerary recommendation.

Stack: Node/Express starter on this branch + Gemini (`gemini-2.5-flash` / `gemini-embedding-2`) + RAG over `sample-vault/` + optional vision and tool calling.

## Setup

```bash
git fetch --tags
git checkout track-04
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

- Upload a ticket, menu, sign, or landmark photo.
- Interpret it using principles and constraints from the vault only.

### 3. Tool calling (Stretch)

- Declare `convert_currency` with `amount` (number), `from` (string), `to` (string).
- Convert with a small hardcoded FX table covering NPR, USD, EUR, and INR.

## Starter vault

| Note | Role |
|---|---|
| `Trip-Overview.md` | Nepal Trip Overview |
| `Confirmed-Bookings.md` | Confirmed Bookings |
| `Traveler-Preferences.md` | Traveler Preferences |
| `Kathmandu-Ideas.md` | Kathmandu Ideas |
| `Pokhara-Ideas.md` | Pokhara Ideas |
| `Budget-and-Currency.md` | Budget and Currency |
| `Travel-Log.md` | Travel Log |

Replace the examples with your own trustworthy notes before showcase.

## Solution reference

```bash
git fetch --tags
git checkout solution-04-phase-2
```

Full map: [HOW-TO-USE-SOLUTIONS.md](HOW-TO-USE-SOLUTIONS.md).
