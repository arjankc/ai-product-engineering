/**
 * @fileoverview Session 9 Core: Retrieval-Augmented Generation (RAG) pipeline module.
 * Implements semantic search chunk retrieval, prompt augmentation, and grounded answer generation.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { embedText, cosineSimilarity } from './embeddings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EMBEDDINGS_PATH = path.join(__dirname, '..', 'embeddings.json');

/** @type {Array<{file: string, content: string, embedding: number[]}>|null} */
let _cachedChunks = null;

function loadChunks() {
  if (_cachedChunks) return _cachedChunks;
  const raw = readFileSync(EMBEDDINGS_PATH, 'utf8');
  _cachedChunks = JSON.parse(raw);
  return _cachedChunks;
}

/**
 * Represents a document chunk with vector embeddings.
 * @typedef {Object} DocumentChunk
 * @property {string} file - Relative path of the source markdown note.
 * @property {string} content - Raw note text content.
 * @property {number[]} embedding - Vector embedding representation.
 * @property {number} [score] - Calculated cosine similarity score relative to query.
 */

/**
 * Retrieves the top K most relevant document chunks from `embeddings.json` based on query similarity.
 *
 * @async
 * @param {import('@google/genai').GoogleGenAI} ai - Initialized GoogleGenAI client instance.
 * @param {string} query - User query string to embed and search.
 * @param {number} [topK=3] - Maximum number of top matching chunks to return.
 * @returns {Promise<DocumentChunk[]>} Array of top matching document chunks with similarity scores.
 */
export async function retrieveRelevantChunks(ai, query, topK = 3) {
  const queryVec = await embedText(ai, query, 'RETRIEVAL_QUERY');
  const chunks = loadChunks();
  const scored = chunks.map((chunk) => ({
    ...chunk,
    score: cosineSimilarity(queryVec, chunk.embedding),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

/**
 * Constructs an augmented RAG system/user prompt combining retrieved context chunks with the user question.
 *
 * @param {string} query - Raw user query string.
 * @param {Array<{file: string, content: string}>} chunks - Array of retrieved context chunks.
 * @returns {string} Formatted prompt string ready for model submission.
 */
export function buildRagPrompt(query, chunks) {
  const context = chunks
    .map(c => `[Source: ${c.file}]\n${String(c.content).slice(0, 1500)}`)
    .join('\n\n---\n\n');
  return `CONTEXT:\n${context}\n\nQUESTION:\n${query}`;
}

/**
 * Executes a complete RAG query flow: retrieves relevant chunks, constructs prompt context, and generates answer.
 *
 * @async
 * @param {import('@google/genai').GoogleGenAI} ai - Initialized GoogleGenAI client instance.
 * @param {string} userQuestion - Raw question submitted by user.
 * @returns {Promise<{answer: string, sources: string[], topScore: number}>} Grounded answer and source metadata.
 */
export async function ragQuery(ai, userQuestion) {
  const chunks = await retrieveRelevantChunks(ai, userQuestion, 3);
  const topScore = chunks[0]?.score ?? 0;
  const sources = chunks.map((c) => c.file);
  const prompt = buildRagPrompt(userQuestion, chunks);

  const { GoogleGenAI } = await import('@google/genai');
  void GoogleGenAI; // ai is passed in — no second client needed

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      temperature: 0.3,
      systemInstruction:
        'You are a local hardware troubleshooting assistant grounded strictly in the provided knowledge base. ' +
        'Answer user questions accurately using only the facts in the CONTEXT section when available. ' +
        'Prefer device-specific, safety-conscious answers. ' +
        'If the information cannot be found in the context, state clearly that the knowledge base does not contain the answer. ' +
        'Always cite the relevant source filenames in your response. ' +
        'If unsure about safety or electrical risk, escalate clearly.',
    },
  });

  return { answer: response.text ?? '', sources, topScore };
}
