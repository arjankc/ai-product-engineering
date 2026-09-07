import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkInputSafety } from './lib/safety.js';
// Session 7+: uncomment when you create the client
// import { GoogleGenAI } from '@google/genai';
// import { queryWithTools } from './lib/tools.js';
// import { ragQuery } from './lib/rag.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Session 5 Complete: Health check endpoint.
 */
app.get('/health', (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.post('/query', async (req, res) => {
  const userInput = String(req.body?.query ?? '').trim();
  if (!userInput) {
    return res.status(400).json({ error: 'No query provided' });
  }

  // TODO Session 14: call checkInputSafety(userInput) and reject unsafe input
  void checkInputSafety;

  // TODO Session 7: replace mock with Gemini generateContent (server-side only)
  // TODO Session 9: replace direct generate with ragQuery(ai, userInput)
  //   return res.json({ response: result.answer, sources: result.sources });
  const mockResponse = `Mock AI response to: ${userInput}`;
  return res.json({ response: mockResponse, sources: [] });
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
  console.log(`AI Product Engineering starter → http://localhost:${PORT}`);
});
