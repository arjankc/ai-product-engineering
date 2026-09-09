/**
 * @fileoverview Session 9 Core: Retrieval-Augmented Generation (RAG) pipeline module.
 * Implements semantic search chunk retrieval, prompt augmentation, and grounded answer generation.
 */

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
 * @param {import('@google/genai').GoogleGenAI} _ai - Initialized GoogleGenAI client instance.
 * @param {string} _query - User query string to embed and search.
 * @param {number} [_topK=3] - Maximum number of top matching chunks to return.
 * @returns {Promise<DocumentChunk[]>} Array of top matching document chunks with similarity scores.
 * @throws {Error} Throws error if embeddings file is missing or unimplemented.
 */
export async function retrieveRelevantChunks(_ai, _query, _topK = 3) {
  throw new Error('TODO Session 9: implement retrieveRelevantChunks()');
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
 * @param {import('@google/genai').GoogleGenAI} _ai - Initialized GoogleGenAI client instance.
 * @param {string} _userQuestion - Raw question submitted by user.
 * @returns {Promise<{answer: string, sources: string[], topScore: number}>} Grounded answer and source metadata.
 * @throws {Error} Throws error if pipeline execution fails or unimplemented.
 */
export async function ragQuery(_ai, _userQuestion) {
  throw new Error('TODO Session 9: implement ragQuery()');
}
