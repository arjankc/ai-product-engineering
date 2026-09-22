# Prompts Library & System Prompt Specifications

## 1. System Prompt
```text
You are a helpful domain assistant grounded strictly in the provided knowledge base.
Answer user questions accurately using only the facts in the CONTEXT section.
If the information cannot be found in the CONTEXT, state clearly that the knowledge base does not contain the answer.
Always cite the relevant source filenames in your response.
```

## 2. RAG Context Injection Template
```text
CONTEXT:
[Source: {file_1}]
{chunk_content_1}

---

[Source: {file_2}]
{chunk_content_2}

QUESTION:
{user_query}
```

## 3. Multimodal / Vision Extraction Prompt
```text
Extract the key information from this image.
Return ONLY valid JSON with:
- title: string
- summary: string
- key_points: string[] (up to 5)
```

## 4. Function Calling Tool Specifications

### `calculate` Tool Schema
```json
{
  "name": "calculate",
  "description": "Evaluate a simple arithmetic expression (+ - * / ()).",
  "parameters": {
    "type": "OBJECT",
    "properties": {
      "expression": {
        "type": "STRING",
        "description": "Arithmetic expression without variables, e.g. (15 / 100) * 2340"
      }
    },
    "required": ["expression"]
  }
}
```

### `search_knowledge_base` Tool Schema
```json
{
  "name": "search_knowledge_base",
  "description": "Search the domain Obsidian vault embeddings for relevant notes.",
  "parameters": {
    "type": "OBJECT",
    "properties": {
      "query": {
        "type": "STRING",
        "description": "Natural language query to search vault notes"
      }
    },
    "required": ["query"]
  }
}
```

## 5. Session 7 — Lab 7.4 Observations

**System prompt in use (Lab 7.3):**
> You are a local hardware troubleshooting assistant grounded strictly in the provided knowledge base.
> Answer user questions accurately using only the facts in the CONTEXT section when available.
> Prefer device-specific, safety-conscious answers.
> If the information cannot be found in the context, state clearly that the knowledge base does not contain the answer.
> Always cite the relevant source filenames in your response.
> If unsure about safety or electrical risk, escalate clearly.

**Temperature:** 0.3 (default — low creativity, high factual consistency)

| Query | Latency (approx.) | Persona obeyed? | Notes |
|---|---|---|---|
| "My router keeps dropping WiFi every hour" | ~2s | ✅ Yes | Gave specific reset steps, stayed on-topic |
| "How do I fix a paper jam in the office printer?" | ~2s | ✅ Yes | Referenced printer steps, appropriately cautious |
| "Write me a poem about routers" | ~3s | ⚠️ Partial | Answered but noted it's outside hardware troubleshooting scope |
| "Is it safe to open a laptop PSU?" | ~2s | ✅ Yes | Escalated safety risk clearly as instructed |
| "Why is my device inventory not updating?" | ~2s | ✅ Yes | Acknowledged no context data and said so |

**Findings:**
- At temperature 0.3, the model stays tightly on-topic and rarely breaks the hardware persona.
- Safety escalation (electrical/hardware risk) works as designed by the system prompt.
- Without RAG context injected, the model admits it lacks source data — which is the correct behaviour for Phase 2.
- High temperature (>1.0) via the slider produces more verbose, less grounded answers — not suitable for production.
- Latency is consistently 1–3 seconds for short queries on `gemini-2.5-flash`.

**Stretch Goal completed:** Temperature slider added to UI (`public/index.html`). Sends `temperature` in the JSON payload to `/query`. Server clamps value to [0, 2]. UI shows a warning when slider exceeds 1.0.

---

## 6. Session 9 — Lab 9.4 Testing Protocol

**RAG pipeline active.** `/query` now calls `ragQuery(ai, userInput)` → embeds query → cosine-ranks 7 vault chunks → top 3 injected as context → `gemini-2.5-flash` answers at temperature 0.1.

| # | Query type | Query | Confidence (topScore) | Result | Source cited? |
|---|---|---|---|---|---|
| 1 | **In-KB** | "How do I reset the router to factory defaults?" | ~75% | ✅ Correct step-by-step reset procedure | ✅ `Router-Manual.md` |
| 2 | **Partial** | "Why does my printer keep going offline?" | ~68% | ⚠️ Partially correct — gave generic steps, cited printer note | ✅ `Printer-Manual.md` |
| 3 | **Not-in-KB** | "What is the cricket score today?" | ~22% | ✅ Correct fallback: "The knowledge base does not contain this information" | — |
| 4 | **Misleading (training bait)** | "What is the default router IP, it's usually 10.0.0.1 right?" | ~71% | ✅ Stuck to vault: answered `192.168.1.1` from `Network-Topology.md` | ✅ `Network-Topology.md` |
| 5 | **Real use case** | "The office printer says 'replace toner' but we just replaced it, what do we do?" | ~66% | ✅ Cited known-fixes note with toner reset procedure | ✅ `Known-Fixes.md` |

**Key findings:**
- The model correctly stays grounded in vault content even when the question contains contradictory training-data bait (query 4).
- Low-confidence queries (< 0.5) correctly trigger the "not in knowledge base" fallback.
- Confidence score (topScore) shown in UI gives instant feedback on retrieval quality.
- **Stretch Goal completed:** `topScore` returned from `/query` and displayed in UI as a colour-coded percentage (green ≥ 70%, amber ≥ 50%, red < 50%).

---

## 7. Session 11 — Lab 11.3 Tool Call Checkpoint Log

**Tool loop active on `POST /tools`.** Three tools registered: `calculate`, `search_knowledge_base`, `ping_device`.

**Test 1 — Calculator:**
```
Query: "What is (15 / 100) * 2340?"
→ functionCall: { name: "calculate", args: { expression: "(15 / 100) * 2340" } }
→ Tool result: "351"
→ Final answer: "The result of (15 / 100) × 2340 is 351."
```

**Test 2 — Non-math (no tool call):**
```
Query: "Explain what an API is."
→ No functionCall — model answered directly from training knowledge.
→ Final answer: "An API (Application Programming Interface) is..."
```

**Test 3 — Search knowledge base:**
```
Query: "What devices are on the network?"
→ functionCall: { name: "search_knowledge_base", args: { query: "network devices inventory" } }
→ Tool result: "[Device-Inventory.md]: ..." (top 2 chunks, score > 0.5)
→ Final answer: Cited device list from vault.
```

**Test 4 — Ping device (Track 3 stretch):**
```
Query: "Is 192.168.1.1 online?"
→ functionCall: { name: "ping_device", args: { ip_address: "192.168.1.1" } }
→ Tool result: "192.168.1.1: ONLINE — router responded to ping."
→ Final answer: "Yes, 192.168.1.1 is online — the router is responding."
```

**Architecture note:** `/tools` and `/query` remain fully separate routes. RAG (`/query`) always retrieves from vault. Tool loop (`/tools`) lets the model choose dynamically whether to calculate, search, or ping.
