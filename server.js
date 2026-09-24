import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { checkInputSafety } from './lib/safety.js';
import { normalizeQuery } from './lib/utils.js';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import { queryWithTools } from './lib/tools.js';
import { ragQuery } from './lib/rag.js';
import { extractImageJsonFromBuffer } from './lib/extraction.js';

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

/**
 * Session 12 Stretch: vision upload endpoint.
 *
 * The upload is held in memory by multer (never written to disk), base64-encoded,
 * and handed to the same prompt/parser/retry stack the CLI scripts use in
 * lib/extraction.js — so the browser and the terminal cannot drift apart.
 */
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.has(file.mimetype)) return cb(null, true);
    return cb(
      new Error(`Unsupported image type: ${file.mimetype}. Use JPEG, PNG, WebP, or HEIC.`)
    );
  },
});

app.post('/extract-image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded. Send a file in the "image" field.' });
  }

  try {
    const { data, rawText, parseError, attempts } = await extractImageJsonFromBuffer(ai, {
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
    });

    if (!data) {
      return res.status(502).json({
        error: 'The model reply was not valid JSON.',
        parseError,
        rawText,
      });
    }

    return res.json({
      file: {
        name: req.file.originalname,
        sizeBytes: req.file.size,
        mimeType: req.file.mimetype,
      },
      attempts,
      data,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) });
  }
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

/**
 * Upload failures (oversized file, rejected type) are passed to next(err) by multer,
 * which Express would otherwise render as an HTML error page. Keep every API
 * response JSON so the frontend can display it.
 */
app.use((err, _req, res, _next) => {
  const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
  res.status(status).json({ error: err.message || 'Upload failed' });
});

const server = app.listen(PORT, () => {
  // Read the bound port, not PORT: an env value of 0 binds an ephemeral port.
  console.log(`Hardware Troubleshooter (Phase 3 RAG) → http://localhost:${server.address().port}`);
});
