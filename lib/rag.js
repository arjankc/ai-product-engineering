import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cosineSimilarity, embedText } from './embeddings.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const EMBEDDINGS_PATH = path.join(ROOT, 'embeddings.json');
const MODEL = 'gemini-2.5-flash';

function loadEmbeddings() {
  if (!fs.existsSync(EMBEDDINGS_PATH)) throw new Error('embeddings.json missing. Run: npm run build-embeddings');
  return JSON.parse(fs.readFileSync(EMBEDDINGS_PATH, 'utf8'));
}

export async function retrieveRelevantChunks(ai, query, topK = 3) {
  const docs = loadEmbeddings();
  const queryEmbedding = await embedText(ai, query, 'RETRIEVAL_QUERY');
  return docs.map((doc) => ({ ...doc, score: cosineSimilarity(queryEmbedding, doc.embedding) }))
    .sort((a, b) => b.score - a.score).slice(0, topK);
}

export function buildRagPrompt(query, chunks) {
  const context = chunks.map((chunk) => `[Source: ${chunk.file}]\n${String(chunk.content).slice(0, 1500)}`).join('\n\n---\n\n');
  return `CONTEXT:\n${context}\n\nQUESTION:\n${query}`;
}

export async function ragQuery(ai, userQuestion, media = {}) {
  const chunks = await retrieveRelevantChunks(ai, userQuestion, 3);
  const prompt = buildRagPrompt(userQuestion, chunks);
  const contents = [];
  if (media.base64Image) {
    contents.push({ inlineData: { data: media.base64Image, mimeType: media.mimeType || 'image/jpeg' } });
    contents.push(`${prompt}\n\nDescribe only visible evidence in the image, then interpret it using the CONTEXT.`);
  } else {
    contents.push(prompt);
  }
  const response = await ai.models.generateContent({
    model: MODEL,
    contents,
    config: { systemInstruction: 'You are Home Maintenance & DIY Helper. Answer only from the supplied vault context, cite source filenames inline, distinguish mock data, and say when evidence is insufficient.' },
  });
  return { answer: response.text ?? '', sources: chunks.map((chunk) => chunk.file), topScore: chunks[0]?.score ?? 0 };
}
