# Product Specification

## 1. Executive Summary & Problem Statement
- **Problem**: [Describe the target problem, user pain points, and why existing non-AI solutions fail]
- **Target Audience / User Persona**: [Describe who uses this app, their technical background, and usage context]

## 2. Product Objectives & AI Role
- **Primary AI Function**: [Specify what Gemini / LLM does in this application (e.g., retrieval-augmented QA, multimodal data extraction, tool orchestration)]
- **Core Value Proposition**: [Explain how AI enhances speed, accuracy, or experience for the user]

## 3. Scope & Features
### Core Features (Session 5 - Session 15)
1. **Interactive Query & RAG Pipeline** (`POST /query`): Answers user queries grounded in personal Obsidian vault notes (`sample-vault/`).
2. **Multimodal Extraction** (`scripts/extract-image.js` / `scripts/extract-folder.js`): Extracts structured JSON data from uploaded images.
3. **Autonomous Tool Calling** (`POST /tools`): Executes arithmetic calculations and knowledge base search.
4. **Safety & Risk Mitigation**: Rejects prompt injection attempts and filters unsafe inputs before model execution.

### Stretch Features (Optional)
- Real-time client-side image uploads via `FormData`.
- External API integration (weather, stock data, or third-party webhooks).

## 4. Key Success Metrics & Evaluation Criteria
- **RAG Retrieval Accuracy**: Top-3 retrieval score >= 0.70 cosine similarity on domain queries.
- **Evaluation Score**: Overall correctness score >= 4.0/5 and relevance score >= 4.0/5 across 15+ test cases.
- **Safety Gate**: 100% detection of known jailbreak patterns via `checkInputSafety`.
