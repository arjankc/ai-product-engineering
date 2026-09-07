# Copilot notes (Session 5)

## Lab 5.4 — Option A: Test cases for GET /health

Verified against the running server with `curl`:

1. Happy path:
   - `GET /health` → `HTTP 200`, body `{"ok":true,"timestamp":"2026-09-07T06:42:06.896Z"}`
   - `ok` is a boolean `true`, and `timestamp` is an ISO-8601 string that changes per request.
2. Edge case:
   - No headers, no body, no auth needed — the endpoint is stateless.
   - Extra query params (`/health?x=1`) are ignored, response shape is unchanged.
   - Response is always valid JSON regardless of how it is called.
3. Error case:
   - The endpoint takes no input, so the only real failure mode is the server being down → connection refused (`curl` exit 7).
   - Non-GET methods (e.g. `POST /health`) fall through to Express's default `404 Not Found`.

### Note from the session
Our shell environment sets `PORT=0`, which makes Express bind to an ephemeral port — `process.env.PORT || 3000` does **not** fall back because the string `"0"` is truthy. I ran the server with `PORT=3000 node server.js` to test against a known port. Worth remembering when starting the dev server in this environment (`npm run dev` prints `http://localhost:0`).

## Lab 5.3 — helper function: `normalizeQuery` (in `lib/utils.js`)

Takes a raw text string, trims whitespace, enforces a maximum length of 500 characters (truncates), and returns `{ query }`. Wired into `POST /query` in `server.js`.

## Lab 5.4 — Option A: Test cases for `normalizeQuery`

1. Happy path:
   - `normalizeQuery('  What is RAG?  ')` → `{ query: 'What is RAG?' }` — leading/trailing whitespace trimmed.
   - `normalizeQuery(undefined)` → `{ query: '' }` — missing body never throws; the server turns the empty result into a 400.
2. Edge case:
   - Input of exactly 500 characters → returned unchanged.
   - Input of 501+ characters → truncated to the first 500 characters.
3. Error case:
   - Whitespace-only input (`'   '`) → `{ query: '' }` → `POST /query` responds `400 { error: 'No query provided' }`.

## Lab 5.4 — Option B: Debug write-up

- **What I broke:** In the `GET /health` handler I misspelled `res.json` as `res.jsn` (deliberate, Lab 5.2 Task 5).
- **The error:** `TypeError: res.jsn is not a function` at `server.js:24`, thrown only when the route actually handled a request — the server still started fine, because the typo is inside the handler, not at the top level.
- **Copilot diagnosis:** The method name doesn't exist on Express's `res` object. The stack trace pointed straight at the offending line (`server.js:24:9`), and the fix is to restore the correct `res.json` spelling. The takeaway: Express route handlers are lazy — syntax-level typos inside them don't crash at startup, they surface as 500s at request time, so always exercise each route after writing it.
- **What was right / wrong:** The AI's diagnosis was right and quick — a single-line typo, found in seconds. The lesson from the Evaluate–Refine cycle: AI-generated or AI-edited code must be run and tested, because a subtle typo passes review and only fails at runtime.
