/**
 * @fileoverview Session 8 Core: Embedding utilities and vector distance computation.
 * Provides helper methods for vector cosine similarity and Gemini text embedding generation.
 */

const EMBEDDING_MODEL = 'gemini-embedding-2';

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
 * Generates vector embeddings using `gemini-embedding-2`.
 * Task hints go in the text prefix — do not pass `config.taskType`.
 *
 * @async
 * @param {import('@google/genai').GoogleGenAI} ai
 * @param {string} text
 * @param {string} [taskType='RETRIEVAL_DOCUMENT']
 * @returns {Promise<number[]>}
 */
export async function embedText(ai, text, taskType = 'RETRIEVAL_DOCUMENT') {
  const raw = String(text ?? '');
  const contents =
    taskType === 'RETRIEVAL_QUERY'
      ? `task: search result | query: ${raw}`
      : `title: none | text: ${raw}`;

  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents,
  });

  const values = response.embeddings?.[0]?.values;
  if (!values?.length) {
    throw new Error('embedContent returned no embedding values');
  }
  return values;
}
