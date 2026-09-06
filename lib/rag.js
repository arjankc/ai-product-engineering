/**
 * Session 9 Core: retrieve → augment → generate.
 */

/** TODO Session 9: load embeddings.json, embed the query, return top K chunks. */
export async function retrieveRelevantChunks(_ai, _query, _topK = 3) {
  throw new Error('TODO Session 9: implement retrieveRelevantChunks()');
}

export function buildRagPrompt(query, chunks) {
  const context = chunks
    .map(c => `[Source: ${c.file}]\n${String(c.content).slice(0, 1500)}`)
    .join('\n\n---\n\n');
  return `CONTEXT:\n${context}\n\nQUESTION:\n${query}`;
}

/** TODO Session 9: retrieve, build prompt, generateContent, return { answer, sources, topScore }. */
export async function ragQuery(_ai, _userQuestion) {
  throw new Error('TODO Session 9: implement ragQuery()');
}
