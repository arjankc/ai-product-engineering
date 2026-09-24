/**
 * @fileoverview Session 12 (Lab 12.1/12.2): shared multimodal extraction helpers.
 *
 * One prompt and one parser for both `scripts/extract-image.js` (single file) and
 * `scripts/extract-folder.js` (batch), so the two paths can never drift apart.
 * Also centralises retry-on-capacity-error handling and JSON-fence stripping,
 * both of which the models reliably need in practice.
 */
import fs from 'node:fs';
import path from 'node:path';

/**
 * Vision-capable model used for image extraction.
 * @type {string}
 */
export const EXTRACTION_MODEL = 'gemini-2.5-flash';

/**
 * HTTP statuses that indicate a transient backend condition worth retrying.
 * @type {Set<number>}
 */
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

/**
 * Domain-specific extraction prompt for the local hardware troubleshooting bot.
 *
 * Deliberately strict: the assistant must never invent a model number, reset
 * procedure, or reading that is not visibly present in the image. Fields that are
 * absent stay null rather than being filled with a plausible guess, and anything
 * ambiguous is surfaced in `uncertain` instead of being silently promoted to fact.
 * @type {string}
 */
export const EXTRACTION_PROMPT = `You are the intake step of a local hardware troubleshooting assistant.
Read the attached image and transcribe ONLY what is visibly present in it.

Hard rules:
1. Never guess, infer, or complete missing data. If a field is not visible in the
   image, use null for it (or omit the item from an array). Do not invent
   plausible values, dates, names, or model numbers.
2. Copy identifiers character-for-character (vendor, model, serial, MAC, SSID,
   IP address, time). Do not reformat, reorder, or "correct" them.
3. Keep stated facts separate from anything you inferred; put every guess or
   unreadable region in "uncertain" with a short reason.
4. Read the whole image, including handwriting and any diagram, boxes, or labels.
5. Return ONLY the raw JSON object as your entire reply: no markdown code
   fences, no commentary before or after.

Return a JSON object with exactly these fields:
{
  "doc_type": string,   // one of: device_label, handwritten_note, screenshot, chart, photo, unknown
  "title": string,      // headline exactly as written; if none, a short neutral name
  "summary": string,    // 1-2 sentences using only facts visible in the image
  "device": {
    "vendor": string or null,
    "model": string or null,
    "serial": string or null,
    "mac_address": string or null,
    "ip_addresses": string[]  // every IP address found anywhere, including a diagram
  },
  "symptoms": string[],
  "actions_attempted": string[],
  "warnings": string[],             // explicit do-not / never / hazard statements
  "next_steps": string[],
  "measurements_and_times": string[], // timestamps, durations, LED states, voltages, counts
  "diagram": string[] or null,      // nodes and links, if the image contains a sketch
  "uncertain": string[]             // anything unreadable, ambiguous, or guessed
}`;

/**
 * Resolves the MIME type Gemini should use for a local image file.
 *
 * @param {string} filePath - Path to an image file.
 * @returns {string} MIME type string for the image format.
 */
export function mimeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  return 'image/jpeg';
}

/**
 * Extracts the JSON object from a model reply that may be wrapped in markdown
 * fences or padded with prose. Falls back to locating the outermost braces.
 *
 * @param {string} text - Raw model response text.
 * @returns {{ data: Object|null, rawText: string, parseError?: string }} Parsed result.
 */
export function parseModelJson(text) {
  const rawText = String(text ?? '');
  const unfenced = rawText
    .replace(/^\s*```(?:json)?\s*/i, '')
    .replace(/```\s*$/, '')
    .trim();

  const start = unfenced.indexOf('{');
  const end = unfenced.lastIndexOf('}');
  const candidate = start !== -1 && end > start ? unfenced.slice(start, end + 1) : unfenced;

  try {
    return { data: JSON.parse(candidate), rawText };
  } catch (err) {
    return { data: null, rawText, parseError: err.message };
  }
}

/**
 * Reports whether an error looks like a transient capacity or rate-limit failure
 * rather than a permanent request problem.
 *
 * @param {Error & { status?: number }} err - Error thrown by the SDK.
 * @returns {boolean} True when the call is worth retrying.
 */
export function isRetryableError(err) {
  if (RETRYABLE_STATUSES.has(err?.status)) return true;
  const text = String(err?.message ?? '');
  const code = /"(?:code|status)"\s*:\s*"?(\d{3})"?/.exec(text);
  if (code && RETRYABLE_STATUSES.has(Number(code[1]))) return true;
  return /UNAVAILABLE|RESOURCE_EXHAUSTED|high demand|overloaded/i.test(text);
}

/**
 * @typedef {Object} ExtractionResult
 * @property {Object|null} data - Parsed extraction object, or null if the reply was not JSON.
 * @property {string} rawText - Raw model reply, always preserved.
 * @property {string} [parseError] - Why parsing failed, when data is null.
 * @property {number} attempts - How many model calls were used (including retries).
 */

/**
 * Sends one image payload to Gemini, retrying transient failures with exponential
 * backoff plus jitter so a single 503 cannot discard an otherwise-good result.
 *
 * @param {import('@google/genai').GoogleGenAI} ai - Configured Gemini client.
 * @param {Array<Object>} parts - Gemini content parts (prompt text plus inline image data).
 * @param {{ retries?: number, baseDelayMs?: number, onRetry?: Function }} options - Retry tuning.
 * @returns {Promise<ExtractionResult>} Parsed extraction result.
 */
async function generateWithRetry(ai, parts, options = {}) {
  const { retries = 4, baseDelayMs = 1500, onRetry } = options;
  let lastError;

  for (let attempt = 1; attempt <= retries + 1; attempt += 1) {
    try {
      const response = await ai.models.generateContent({
        model: EXTRACTION_MODEL,
        contents: [{ role: 'user', parts }],
      });
      return { ...parseModelJson(response.text), attempts: attempt };
    } catch (err) {
      lastError = err;
      if (attempt > retries || !isRetryableError(err)) throw err;
      const waitMs = baseDelayMs * 2 ** (attempt - 1) + Math.floor(Math.random() * 400);
      if (onRetry) onRetry({ attempt, waitMs, error: err });
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }

  throw lastError;
}

/**
 * Extracts structured data from an in-memory image buffer — the upload path, where
 * the file never touches disk.
 *
 * @param {import('@google/genai').GoogleGenAI} ai - Configured Gemini client.
 * @param {{ buffer: Buffer, mimeType: string }} image - Image bytes and their MIME type.
 * @param {{ retries?: number, baseDelayMs?: number, onRetry?: Function }} [options] - Retry tuning.
 * @returns {Promise<ExtractionResult>} Parsed extraction result.
 */
export async function extractImageJsonFromBuffer(ai, { buffer, mimeType }, options = {}) {
  return generateWithRetry(
    ai,
    [
      { text: EXTRACTION_PROMPT },
      { inlineData: { mimeType, data: Buffer.from(buffer).toString('base64') } },
    ],
    options
  );
}

/**
 * Extracts structured data from one image on disk (the script path).
 *
 * @param {import('@google/genai').GoogleGenAI} ai - Configured Gemini client.
 * @param {string} filePath - Path to the image to extract.
 * @param {{ retries?: number, baseDelayMs?: number, onRetry?: Function }} [options] - Retry tuning.
 * @returns {Promise<ExtractionResult>} Parsed extraction result.
 */
export async function extractImageJson(ai, filePath, options = {}) {
  return extractImageJsonFromBuffer(
    ai,
    { buffer: fs.readFileSync(filePath), mimeType: mimeFor(filePath) },
    options
  );
}
