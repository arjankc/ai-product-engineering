import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const app = express();
app.use(express.json({limit: '50mb'}));
app.use(express.static('public'));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

const trackTool = {
  name: "check_local_weather",
  description: "Checks weather forecast",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING, description: "Information needed" }
    }
  }
};

app.post('/query', async (req, res) => {
  try {
    const { prompt, base64Image, mimeType } = req.body;
    const context = getMockRagContext();
    const sysPrompt = "Use the following context to answer the user.\nContext:\n" + context;
    
    let contents = [];
    if (base64Image) {
      contents.push({ inlineData: { data: base64Image, mimeType: mimeType }});
    }
    contents.push(prompt);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: { 
        systemInstruction: sysPrompt,
        tools: [{ functionDeclarations: [trackTool] }]
      }
    });

    if (response.functionCalls && response.functionCalls.length > 0) {
       // Mock handling the tool call
       const finalResponse = await ai.models.generateContent({
         model: 'gemini-2.5-flash',
         contents: [
            { text: prompt },
            { functionCall: response.functionCalls[0] },
            { functionResponse: { name: "check_local_weather", response: { "temp_c": 8, "forecast": "frost warning" } } }
         ]
       });
       res.json({ response: finalResponse.text });
    } else {
       res.json({ response: response.text });
    }
  } catch (error) {
    res.status(500).json({ response: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));