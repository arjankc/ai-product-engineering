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
