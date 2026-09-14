/**
 * @fileoverview Session 8 Core: Embedding utilities and vector distance computation.
 * Provides helper methods for vector cosine similarity and Gemini text embedding generation.
 */

/**
 * Computes the cosine similarity between two numerical vector arrays.
 *
 * @param {number[]} a - The first numerical vector.
 * @param {number[]} b - The second numerical vector.
 * @returns {number} Cosine similarity score ranging from -1.0 to 1.0 (0 if vectors are invalid or orthogonal).
 */
export function cosineSimilarity(a, b) {
  if (!a?.length || !b?.length || a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * Generates vector embeddings for a given text using Google's Gemini embedding model (`gemini-embedding-2`).
 *
 * Important: `gemini-embedding-2` does **not** support `config.taskType`.
 * Put the retrieval task in the text prefix instead (see Session 8 notes).
 *
 * @async
 * @param {import('@google/genai').GoogleGenAI} _ai - Initialized GoogleGenAI client instance.
 * @param {string} _text - The raw text content to be embedded.
 * @param {string} [_taskType='RETRIEVAL_DOCUMENT'] - Maps to text prefixes: DOCUMENT → `title: none | text: …`, QUERY → `task: search result | query: …`.
 * @returns {Promise<number[]>} Array of floating-point embedding dimensions (default size is often 3072).
 * @throws {Error} Throws error if unimplemented or API call fails.
 */
export async function embedText(_ai, _text, _taskType = 'RETRIEVAL_DOCUMENT') {
  throw new Error('TODO Session 8: implement embedText()');
}
