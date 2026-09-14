/**
 * @fileoverview Session 14 Core: Demo input safety & prompt injection filter.
 * Provides heuristic pattern matching to detect adversarial prompt injection and input padding.
 * Note: This is an educational guardrail demonstration and not a complete production security boundary.
 */

/**
 * Common regex signatures used to detect direct prompt injection attempts.
 * @type {RegExp[]}
 */
const INJECTION_PATTERNS = [
  /ignore (all )?previous instructions/i,
  /you are now/i,
  /reveal (your|the) system prompt/i,
  /developer mode/i,
  /jailbreak/i,
];

/**
 * Result returned by the safety filter check.
 * @typedef {Object} SafetyCheckResult
 * @property {boolean} safe - True if input passed all safety patterns; false otherwise.
 * @property {string} [reason] - Explanatory message when safe is false.
 */

/**
 * Validates user input string against prompt injection signatures and character limits.
 *
 * @param {string|unknown} userInput - Raw user prompt input to check.
 * @returns {SafetyCheckResult} Result object indicating safety status and reason if rejected.
 */
export function checkInputSafety(userInput) {
  const text = String(userInput ?? '');
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return {
        safe: false,
        reason: `Potential injection pattern detected: ${pattern}`,
      };
    }
  }
  if (text.length > 2000) {
    return {
      safe: false,
      reason: 'Input too long — possible injection padding',
    };
  }
  return { safe: true };
}
