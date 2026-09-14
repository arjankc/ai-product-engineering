# System Architecture & Technical Design

## 1. High-Level Diagram & Overview

```
 [ Client Browser ]
        │
        ├─► GET /health ────────► [ Express Server ]
        ├─► POST /query ────────► [ Safety Filter ] ──► [ RAG Pipeline ] ──► [ Gemini 2.5 Flash ]
        └─► POST /tools ────────► [ Function Declarations ] ──────────────► [ Tool Execution Engine ]
                                        │
                                        ▼
                            [ Local Obsidian Vault / embeddings.json ]
```

Save your diagram link or image in this folder after Session 6: `03-Project/architecture-diagram.png`.

## 2. System Components

| Component | Tech Stack / File | Purpose |
|-----------|-------------------|---------|
| **Frontend UI** | HTML5 / CSS3 / Vanilla JS (`public/index.html`) | User chat interface, query submission, and source reference rendering |
| **Backend Server** | Node.js 20+ / Express (`server.js`) | API route handling, middleware, safety gates, and Gemini API orchestration |
| **RAG Module** | `lib/rag.js` & `lib/embeddings.js` | Text chunking, embedding generation via `gemini-embedding-2`, cosine similarity lookup |
| **Tool Engine** | `lib/tools.js` | Tool declarations (`calculate`, `search_knowledge_base`) and tool call execution loop |
| **Safety Guard** | `lib/safety.js` | Regex injection pattern detector and length limit enforcer |
| **Vector Index** | `embeddings.json` | Local JSON store of note file chunks and 768-dim float vector embeddings |

## 3. Data Flow

1. **Embedding Indexing (`npm run build-embeddings`)**:
   - Markdown files in `sample-vault/` are read and truncated.
   - Embeddings generated via `embedText()` using `gemini-embedding-2`.
   - Resulting array `{ file, content, embedding }` saved to `embeddings.json`.

2. **RAG Query Execution (`POST /query`)**:
   - User query checked via `checkInputSafety()`.
   - Query embedded and matched against `embeddings.json` via `cosineSimilarity()`.
   - Top K chunks built into prompt context sent to `gemini-2.5-flash`.
   - Returns `{ response, sources }`.

3. **Tool Loop (`POST /tools`)**:
   - Message sent to `gemini-2.5-flash` with function declarations.
   - If model returns `functionCalls`, server executes local tool functions (`safeCalculate` or `retrieveRelevantChunks`) and sends results back until final text answer is produced.
