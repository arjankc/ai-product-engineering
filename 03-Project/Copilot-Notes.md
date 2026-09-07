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
