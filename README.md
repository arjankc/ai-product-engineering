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

```bash
cp .env.example .env
# paste your key into .env
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). `POST /query` returns a **mock** until Session 7.

Deliverable templates live in **`03-Project/`**. Sample Markdown for embeddings lives in **`sample-vault/`**.

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
