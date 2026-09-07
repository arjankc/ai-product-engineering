/**
 * Session 5 Lab 5.3: normalize user input before it reaches the AI.
 * Trims whitespace and enforces a maximum length of 500 characters
 * (longer input is truncated), then returns { query }.
 */

const MAX_QUERY_LENGTH = 500;

export function normalizeQuery(raw) {
  const query = String(raw ?? '').trim().slice(0, MAX_QUERY_LENGTH);
  return { query };
}