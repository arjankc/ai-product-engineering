import express from 'express';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const app = express();
app.use(express.json());
app.use(express.static('public'));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Extremely simplified RAG mock implementation
function getMockRagContext() {
  const vaultPath = path.join(process.cwd(), 'sample-vault');
  let context = '';
  if (fs.existsSync(vaultPath)) {
    const files = fs.readdirSync(vaultPath).filter(f => f.endsWith('.md'));
    for (const file of files) {
      context += '\n--- ' + file + ' ---\n' + fs.readFileSync(path.join(vaultPath, file), 'utf8');
    }
  }
  return context;
}

app.post('/query', async (req, res) => {
  try {
    const { prompt } = req.body;
    const context = getMockRagContext();
    
    const sysPrompt = "Use the following context to answer the user.\nContext:\n" + context;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { systemInstruction: sysPrompt }
    });
    res.json({ response: response.text });
  } catch (error) {
    res.status(500).json({ response: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));