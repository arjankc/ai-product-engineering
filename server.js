import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { checkInputSafety } from './lib/safety.js';
import { normalizeQuery } from './lib/utils.js';
import { GoogleGenAI } from '@google/genai';
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
    // Lab 7.3: system prompt from prompts.md §1, adapted for Track 3 hardware domain
    // Phase 2: direct Gemini (Phase 3 replaces this with ragQuery)
    const temperature = typeof req.body.temperature === 'number'
      ? Math.min(2, Math.max(0, req.body.temperature))
      : 0.3;
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: userInput,
      config: {
        temperature,
        systemInstruction:
          'You are a local hardware troubleshooting assistant grounded strictly in the provided knowledge base. ' +
          'Answer user questions accurately using only the facts in the CONTEXT section when available. ' +
          'Prefer device-specific, safety-conscious answers. ' +
          'If the information cannot be found in the context, state clearly that the knowledge base does not contain the answer. ' +
          'Always cite the relevant source filenames in your response. ' +
          'If unsure about safety or electrical risk, escalate clearly.',
      },
    });
    return res.json({ response: response.text ?? '', sources: [] });
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) });
  }
});

/**
 * Session 11 Core: tool calling lives here so RAG can stay on /query.
 * After Session 7, create `ai`, then uncomment the body below.
 */
app.post('/tools', async (req, res) => {
  const userInput = String(req.body?.query ?? '').trim();
  if (!userInput) {
    return res.status(400).json({ error: 'No query provided' });
  }

  // TODO Session 11:
  // const text = await queryWithTools(ai, userInput);
  // return res.json({ response: text, sources: [] });
  return res.status(501).json({
    error:
      'TODO Session 11: wire queryWithTools(ai, userInput). Keep RAG on /query.',
  });
});

app.listen(PORT, () => {
  console.log(`Hardware Troubleshooter (Phase 2) → http://localhost:${PORT}`);
});
