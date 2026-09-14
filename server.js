import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';
import { checkInputSafety } from './lib/safety.js';
import { normalizeQuery } from './lib/utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) console.warn('Warning: GEMINI_API_KEY is not set. AI routes will fail until .env is configured.');
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (_req, res) => res.json({ ok: true, timestamp: new Date().toISOString() }));

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
app.get('/version', (_req, res) => res.json({ name: pkg.name, version: pkg.version }));

app.post('/query', async (req, res) => {
  const { query: userInput } = normalizeQuery(req.body?.query);
  if (!userInput) return res.status(400).json({ error: 'No query provided' });
  void checkInputSafety;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userInput,
      config: { systemInstruction: 'You are Home Maintenance Helper. Prefer domain-specific answers and clearly state uncertainty.' },
    });
    return res.json({ response: response.text ?? '', sources: [] });
  } catch (error) {
    return res.status(500).json({ error: error.message || String(error) });
  }
});

app.post('/tools', async (req, res) => {
  const userInput = String(req.body?.query ?? '').trim();
  if (!userInput) return res.status(400).json({ error: 'No query provided' });
  return res.status(501).json({ error: 'Phase 4 wires the domain tool while RAG remains on /query.' });
});

app.listen(PORT, () => console.log(`Home Maintenance Helper (Phase 2) → http://localhost:${PORT}`));
