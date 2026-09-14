import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';
import { checkInputSafety } from './lib/safety.js';
import { normalizeQuery } from './lib/utils.js';
// import { queryWithTools } from './lib/tools.js';
// import { ragQuery } from './lib/rag.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const MODEL = 'gemini-2.5-flash';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('Warning: GEMINI_API_KEY is not set. /query will fail until .env is configured.');
}
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

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
    // Phase 2: direct Gemini (Phase 3 replaces this with ragQuery)
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: userInput,
      config: {
        systemInstruction:
          'You are a CS101 academic assistant. Prefer course-specific answers. If unsure, say you do not know.',
      },
    });
    return res.json({ response: response.text ?? '', sources: [] });
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) });
  }
});

app.post('/tools', async (req, res) => {
  const userInput = String(req.body?.query ?? '').trim();
  if (!userInput) {
    return res.status(400).json({ error: 'No query provided' });
  }

  return res.status(501).json({
    error:
      'TODO Session 11: wire queryWithTools(ai, userInput). Keep RAG on /query.',
  });
});

app.listen(PORT, () => {
  console.log(`Academic Assistant (Phase 2) → http://localhost:${PORT}`);
});
