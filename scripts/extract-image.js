/**
 * Session 12 Core: read one local image, send it to Gemini, print JSON-ish text.
 * Put a jpeg/png in sample-images/ (see sample-images/README.md).
 *
 *   node scripts/extract-image.js
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';
import { EXTRACTION_PROMPT, EXTRACTION_MODEL, mimeFor } from '../lib/extraction.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SAMPLE_DIR = path.join(__dirname, '..', 'sample-images');

function findSampleImage() {
  if (!fs.existsSync(SAMPLE_DIR)) return null;
  const files = fs
    .readdirSync(SAMPLE_DIR)
    .filter(f => /\.(png|jpe?g|webp)$/i.test(f));
  return files[0] ? path.join(SAMPLE_DIR, files[0]) : null;
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Set GEMINI_API_KEY in .env');
    process.exit(1);
  }

  const imagePath = process.argv[2] || findSampleImage();
  if (!imagePath) {
    console.error(
      'No image found. Add a .jpg or .png under sample-images/ or pass a path.'
    );
    process.exit(1);
  }

  const buffer = fs.readFileSync(imagePath);
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: EXTRACTION_MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          { text: EXTRACTION_PROMPT },
          {
            inlineData: {
              mimeType: mimeFor(imagePath),
              data: buffer.toString('base64'),
            },
          },
        ],
      },
    ],
  });

  console.log('File:', imagePath);
  console.log(response.text);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
