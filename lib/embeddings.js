/**
 * Session 8 Core: generate embeddings and cosine similarity.
 * Session 9 uses retrieveRelevantChunks() from here (or from rag.js).
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

/** TODO Session 8: call Gemini embedContent and return number[]. */
export async function embedText(_ai, _text, _taskType = 'RETRIEVAL_DOCUMENT') {
  throw new Error('TODO Session 8: implement embedText()');
}
