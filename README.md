# AI Product Engineering — starter kit

**Download (live site):** [ai-product-engineering.zip](/blog/assets/course-kits/ai-product-engineering.zip)

Or copy this folder from the Git repo: `course-kits/ai-product-engineering/`. **Node.js 20+** required.

Read **[GATES.md](GATES.md)** when a lab is blocked or the API is down.

## Stack as of August 2026

If Google renamed a model or the AI Studio UI moved, follow [ai.google.dev](https://ai.google.dev) and update these IDs in one place (your notes + this kit):

| Piece | Value |
|--------|--------|
| npm package | `@google/genai` (`GoogleGenAI`) |
| Chat / generate | `gemini-2.5-flash` |
| Embeddings | `gemini-embedding-2` |
| API key | Google AI Studio → `GEMINI_API_KEY` in `.env` (never in the browser) |

## Setup

**If you chose a numbered project track**, check out that track first (exact names and tags: **[BRANCHES.md](BRANCHES.md)**):

```bash
git clone https://github.com/arjankc/ai-product-engineering.git
cd ai-product-engineering
git fetch --tags
git checkout track-01    # or track-02 … track-10 — your assigned track
cp .env.example .env
# paste your key into .env
npm install
npm run dev
```

Stay on **`main`** only for the shared lab kit / generic vault. Your graded product should live on your **track** branch (PRD + domain `sample-vault/`).

Open [http://localhost:3000](http://localhost:3000). `POST /query` returns a **mock** until Session 7.

Deliverable templates live in **`03-Project/`**. Sample Markdown for embeddings lives in **`sample-vault/`**.

## Repository & branch structure

| Ref | Who uses it | What it is |
|-----|-------------|------------|
| `main` | Everyone | Shared starter: server TODOs, libs, eval scripts, generic vault |
| `track-01` … `track-10` (tags) / `track-NN-…` (branches) | Students | Track PRD + domain seed vault — **start here for your product** |
| `solution-NN-phase-1` … `phase-4` (tags) / `solution-track-NN-…` | Students + instructors | **Step-by-step** reference (one commit per phase); tip = full build |

How to walk solutions commit-by-commit (and the full name table): **[BRANCHES.md](BRANCHES.md)**.

### Track domain summary

1. **Track 01**: Context-Aware Academic Assistant → `track-01` / `track-01-context-aware-academic-assistant`
2. **Track 02**: Smart Pantry Recipe Architect → `track-02` / `track-02-smart-pantry-recipe-architect`
3. **Track 03**: Local Hardware Troubleshooting Bot → `track-03` / `track-03-local-hardware-troubleshooting-bot`
4. **Track 04**: Travel Log & Itinerary Copilot → `track-04` / `track-04-travel-log-itinerary-copilot`
5. **Track 05**: Personal Fitness & Rehab Coach → `track-05` / `track-05-personal-fitness-rehab-coach`
6. **Track 06**: Automated Expense & Tax Analyst → `track-06` / `track-06-automated-expense-tax-analyst`
7. **Track 07**: Household Plant Care & Botany Assistant → `track-07` / `track-07-household-plant-care-botany-assistant`
8. **Track 08**: Tabletop RPG & Board Game Master → `track-08` / `track-08-tabletop-rpg-board-game-master`
9. **Track 09**: Local Heritage & Architecture Guide → `track-09` / `track-09-local-heritage-architecture-guide`
10. **Track 10**: Home Maintenance & DIY Helper → `track-10` / `track-10-home-maintenance-diy-helper`

### Solution phases (same for every track)

| Tag | Commit | Labs (approx.) |
|-----|--------|----------------|
| `solution-NN-phase-1` | UI & Mock Backend | Sessions 5–6 |
| `solution-NN-phase-2` | Vanilla Gemini Integration | Session 7 |
| `solution-NN-phase-3` | The RAG Pipeline | Sessions 8–9 |
| `solution-NN-phase-4` | Multimodal & Tools | Sessions 10–12 |
| `solution-NN` | Full solution tip | Showcase reference |

Example: after Session 7, `git checkout solution-01-phase-2` to inspect the Gemini step for Track 1—then return to your track branch to keep building.
## Lab map

| Session | What you do in this kit |
|---------|-------------------------|
| 5 | Explain `server.js`. Implement `GET /health` → `{ ok: true }`. Write `03-Project/Copilot-Notes.md`. |
| 6 | **Replace** starter UI for your product (unchanged starter fails Core). Diagram → `03-Project/Architecture.md`. |
| 7 | Load `GEMINI_API_KEY` on the **server**. Replace the mock with `generateContent`. |
| 8 | Implement `embedText`; `npm run build-embeddings` (uses `sample-vault/` by default; max 10 notes). |
| 9 | Gate: `embeddings.json` exists. Implement `lib/rag.js`; point `/query` at `ragQuery()`. |
| 10 | `npm run agent-task -- "your goal"` — chained steps, not ReAct. |
| 11 | Uncomment `POST /tools` body; calculator warm-up; Core: enable `search_knowledge_base`. Keep RAG `/query`. |
| 12 | Two images + `03-Project/Extraction-Notes.md`; `npm run extract-folder`. FormData upload is Stretch. |
| 13 | Copy `test-suite.example.json` → `test-suite.json`; `npm run eval`. Gate ≥15 for showcase. |
| 14 | Call `checkInputSafety` in `/query`. Demo filter only. Fill `03-Project/AI-Risk-Report.md`. |

## Mixed-semester tracks

- **Core:** finish the TODOs so the product answers from your vault and survives the Session 15 checklist.
- **Stretch:** after the Core checkpoint only.

Pair an early-semester student with a later-semester student when you can.
