# Track 10: Home Maintenance & DIY Helper

**Problem:** Renters and homeowners need context-aware maintenance guidance that knows the property history and clearly separates safe checks from work requiring a professional.

## Overview

Build a safety-first household maintenance assistant grounded in appliance manuals, repair logs, landlord responsibilities, and Nepal home conditions. It should cite the household or project vault, identify uncertainty, and avoid inventing records, rules, routes, or actions.

Stack: Node/Express starter on this branch + Gemini (`gemini-2.5-flash` / `gemini-embedding-2`) + RAG over `sample-vault/` + optional vision and tool calling.

## Setup

```bash
git fetch --tags
git checkout track-10
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

- Declare `email_landlord(issue_summary, urgency)`.
- Create a mock landlord email receipt for a maintenance issue; no message is actually sent.
- Expose it through `POST /tools` while keeping grounded RAG on `POST /query`.

## Starter vault

| Note | Role |
|------|------|
| `Home-Profile.md` | Home Profile |
| `Emergency-Shutoffs.md` | Emergency Shutoffs |
| `Tenant-Landlord-Boundaries.md` | Tenant and Landlord Boundaries |
| `Kitchen-Tap-History.md` | Kitchen Tap Repair History |
| `Monsoon-Checklist.md` | Monsoon Home Checklist |
| `Appliance-Care.md` | Appliance Care |
| `Repair-Request-Template.md` | Repair Request Template |

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
git checkout solution-10-phase-2   # example: after Session 7
```

Full phase map: [HOW-TO-USE-SOLUTIONS.md](HOW-TO-USE-SOLUTIONS.md).
