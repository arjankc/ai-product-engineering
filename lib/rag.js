/**
 * @fileoverview Session 9 Core: Retrieval-Augmented Generation (RAG) pipeline module.
 * Implements semantic search chunk retrieval, prompt augmentation, and grounded answer generation.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cosineSimilarity, embedText } from './embeddings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const EMBEDDINGS_PATH = path.join(ROOT, 'embeddings.json');
const MODEL = 'gemini-2.5-flash';

/**
 * @typedef {Object} DocumentChunk
 * @property {string} file
 * @property {string} content
 * @property {number[]} embedding
 * @property {number} [score]
 */

function loadEmbeddings() {
  if (!fs.existsSync(EMBEDDINGS_PATH)) {
    throw new Error(
      'embeddings.json missing. Run: npm run build-embeddings',
    );
  }
  return JSON.parse(fs.readFileSync(EMBEDDINGS_PATH, 'utf8'));
}

/**
 * @param {import('@google/genai').GoogleGenAI} ai
 * @param {string} query
 * @param {number} [topK=3]
 * @returns {Promise<DocumentChunk[]>}
 */
export async function retrieveRelevantChunks(ai, query, topK = 3) {
  const docs = loadEmbeddings();
  const queryEmbedding = await embedText(ai, query, 'RETRIEVAL_QUERY');
  const scored = docs
    .map((doc) => ({
      ...doc,
      score: cosineSimilarity(queryEmbedding, doc.embedding),
    }))
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

/**
 * @param {string} query
 * @param {Array<{file: string, content: string}>} chunks
 */
export function buildRagPrompt(query, chunks) {
  const context = chunks
    .map((c) => `[Source: ${c.file}]\n${String(c.content).slice(0, 1500)}`)
    .join('\n\n---\n\n');
  return `CONTEXT:\n${context}\n\nQUESTION:\n${query}`;
}

/**
 * @param {import('@google/genai').GoogleGenAI} ai
 * @param {string} userQuestion
 * @param {{ base64Image?: string, mimeType?: string }} [media]
 * @returns {Promise<{answer: string, sources: string[], topScore: number}>}
 */
export async function ragQuery(ai, userQuestion, media = {}) {
  const chunks = await retrieveRelevantChunks(ai, userQuestion, 3);
  const topScore = chunks[0]?.score ?? 0;
  const sources = chunks.map((c) => c.file);

  const systemInstruction = [
    'You are the Context-Aware Academic Assistant for CS101.',
    'Answer ONLY using the provided CONTEXT from the course vault.',
    'If the context is insufficient, say you do not have that information in the course notes.',
    'Cite source filenames inline when you use them.',
  ].join(' ');

  const prompt = buildRagPrompt(userQuestion, chunks);
  /** @type {Array<string | { inlineData: { data: string, mimeType: string } }>} */
  const contents = [];
  if (media.base64Image) {
    contents.push({
      inlineData: {
        data: media.base64Image,
        mimeType: media.mimeType || 'image/jpeg',
      },
    });
    contents.push(
      `${prompt}\n\nAlso interpret the attached image (worksheet/handout) using only course principles from CONTEXT.`,
    );
  } else {
    contents.push(prompt);
  }

  const response = await ai.models.generateContent({
    model: MODEL,
    contents,
    config: { systemInstruction },
  });

  return {
    answer: response.text ?? '',
    sources,
    topScore,
  };
}
