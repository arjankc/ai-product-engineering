import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { checkInputSafety } from './lib/safety.js';
import { normalizeQuery } from './lib/utils.js';
import { GoogleGenAI } from '@google/genai';
import { queryWithTools } from './lib/tools.js';
import { ragQuery } from './lib/rag.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('Warning: GEMINI_API_KEY is not set. /query will fail until .env is configured.');
}
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Session 5 Complete: Health check endpoint.
 */
app.get('/health', (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
});

/**
 * Session 5 Stretch: read the app version from package.json.
 */
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
app.get('/version', (_req, res) => {
  res.json({ name: pkg.name, version: pkg.version });
});

app.post('/query', async (req, res) => {
  const { query: userInput } = normalizeQuery(req.body?.query);
  if (!userInput) {
    return res.status(400).json({ error: 'No query provided' });
  }

  // TODO Session 14: call checkInputSafety(userInput) and reject unsafe input
  void checkInputSafety;

  try {
    // Lab 9.4: RAG pipeline replaces the direct Gemini call from Session 7
    const result = await ragQuery(ai, userInput);
    return res.json({
      response: result.answer,   // frontend reads data.response
      sources: result.sources,   // frontend reads data.sources
      topScore: result.topScore, // Lab 9.4 stretch: confidence score
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) });
  }
});

/**
 * Session 11 Core: tool calling on POST /tools — separate from RAG on POST /query.
 */
app.post('/tools', async (req, res) => {
  const userInput = String(req.body?.query ?? '').trim();
  if (!userInput) {
    return res.status(400).json({ error: 'No query provided' });
  }
  try {
    // Lab 11.1: wire queryWithTools — calculator + search_knowledge_base + ping_device
    const text = await queryWithTools(ai, userInput);
    return res.json({ response: text, sources: [] });
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Hardware Troubleshooter (Phase 3 RAG) → http://localhost:${PORT}`);
});
