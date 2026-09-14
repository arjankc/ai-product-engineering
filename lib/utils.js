/**
 * @fileoverview Session 5 Lab 5.3: General text normalization and processing utilities.
 */

/**
 * Maximum character limit allowed for normalized user queries.
 * @type {number}
 */
const MAX_QUERY_LENGTH = 500;

/**
 * Normalizes user input query string by trimming whitespace and truncating to maximum length limit.
 *
 * @param {string|unknown} raw - Raw input query value.
 * @returns {{ query: string }} Object containing normalized query string under key `query`.
 */
export function normalizeQuery(raw) {
  const query = String(raw ?? '').trim().slice(0, MAX_QUERY_LENGTH);
  return { query };
}
