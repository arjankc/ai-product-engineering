# Track 3: Local Hardware Troubleshooting Bot

**Problem:** Device troubleshooting becomes unreliable when generic assistants invent reset steps, ignore the local network layout, or recommend procedures for the wrong model.

## Overview

Build a support assistant grounded **only** in your home or lab device manuals, topology notes, and known fixes. It should diagnose cautiously, cite the relevant note, and clearly escalate electrical or hardware-safety risks.

Stack: Node/Express starter on this branch + Gemini (`gemini-2.5-flash` / `gemini-embedding-2`) + RAG over `sample-vault/` + optional vision and tool calling.

## Setup

```bash
git fetch --tags
git checkout track-03
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

- Upload a device label, cable layout, or indicator-light photo.
- Interpret it using principles and constraints from the vault only.

### 3. Tool calling (Stretch)

- Declare `ping_device` with `ip_address` (string).
- Return mock connectivity status: `192.168.1.1` is online, `192.168.1.50` is offline, and all other addresses are unknown.

## Starter vault

| Note | Role |
|---|---|
| `Network-Topology.md` | Network Topology |
| `Router-Manual.md` | Router Manual |
| `Printer-Manual.md` | Office Printer Manual |
| `Known-Fixes.md` | Known Fixes |
| `Safety-Escalation.md` | Safety and Escalation |
| `Device-Inventory.md` | Device Inventory |
| `Troubleshooting-Checklist.md` | Troubleshooting Checklist |

Replace the examples with your own trustworthy notes before showcase.

## Solution reference

```bash
git fetch --tags
git checkout solution-03-phase-2
```

Full map: [HOW-TO-USE-SOLUTIONS.md](HOW-TO-USE-SOLUTIONS.md).
