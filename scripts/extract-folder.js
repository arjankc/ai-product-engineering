/**
 * Session 12 Core: batch-extract images in a folder → extracted-data.json
 *
 * Uses the shared prompt/parser in lib/extraction.js so batch and single-file
 * extraction produce the same shape, and retries transient 503/429 responses
 * instead of discarding a whole run partway through.
 *
 *   npm run extract-folder
 *   node scripts/extract-folder.js ./sample-images
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';
import { EXTRACTION_MODEL, extractImageJson } from '../lib/extraction.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Set GEMINI_API_KEY in .env');
    process.exit(1);
  }

  const inputDir = path.resolve(process.argv[2] || path.join(root, 'sample-images'));
  if (!fs.existsSync(inputDir)) {
    console.error('Folder not found:', inputDir);
    process.exit(1);
  }

  const files = fs
    .readdirSync(inputDir)
    .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
    .sort();

  if (files.length === 0) {
    console.error('No images found in', inputDir);
    process.exit(1);
  }
  if (files.length < 2) {
    console.warn('Core expects at least two images. Add more under sample-images/.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const results = [];
  let failed = 0;

  for (let i = 0; i < files.length; i += 1) {
    const filename = files[i];
    const full = path.join(inputDir, filename);
    console.log(`Processing ${i + 1}/${files.length}: ${filename} (${EXTRACTION_MODEL})`);

    try {
      const { data, rawText, parseError, attempts } = await extractImageJson(ai, full, {
        onRetry: ({ attempt, waitMs }) =>
          console.warn(`  transient error — retry ${attempt} in ${Math.round(waitMs)}ms`),
      });

      if (data) {
        results.push({ file: filename, data });
        console.log(`  ok${attempts > 1 ? ` (after ${attempts} attempts)` : ''}`);
      } else {
        failed += 1;
        results.push({ file: filename, data: null, parseError, rawText });
        console.warn(`  unparseable reply — raw text kept (${parseError})`);
      }
    } catch (err) {
      failed += 1;
      results.push({ file: filename, data: null, error: err.message });
      console.error(`  failed: ${err.message}`);
    }

    if (i < files.length - 1) await new Promise((r) => setTimeout(r, 1000));
  }

  const outPath = path.join(root, 'extracted-data.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`Saved ${results.length} results (${failed} failed) → ${outPath}`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
