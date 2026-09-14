import { retrieveRelevantChunks } from './rag.js';

function tokenize(expression) {
  const tokens=[]; const source=String(expression).replace(/\s+/g,''); let index=0;
  while(index<source.length) {
    const char=source[index];
    if('+-*/()'.includes(char)) { tokens.push(char); index+=1; continue; }
    if(/[\d.]/.test(char)) { let value=''; while(index<source.length&&/[\d.]/.test(source[index])) value+=source[index++]; tokens.push(Number(value)); continue; }
    throw new Error('Unsupported expression');
  }
  return tokens;
}
function parse(tokens) {
  let position=0; const peek=()=>tokens[position]; const take=()=>tokens[position++];
  const factor=()=>{ const token=peek(); if(token==='('){take();const value=add();if(take()!==')')throw new Error('Unsupported expression');return value;} if(typeof token==='number')return take();if(token==='-'){take();return-factor();}throw new Error('Unsupported expression'); };
  const multiply=()=>{let value=factor();while(peek()==='*'||peek()==='/'){const op=take();const right=factor();value=op==='*'?value*right:value/right;}return value;};
  const add=()=>{let value=multiply();while(peek()==='+'||peek()==='-'){const op=take();const right=multiply();value=op==='+'?value+right:value-right;}return value;};
  const value=add(); if(position!==tokens.length||!Number.isFinite(value))throw new Error('Unsupported expression'); return value;
}
export function safeCalculate(expression) { return parse(tokenize(expression)); }

export function get_walking_distance(from, to) {
  const normalize = (value) => String(value ?? '').trim().toLowerCase();
  const key = [normalize(from), normalize(to)].sort().join('|');
  const pairs = {
    'golden temple|patan durbar square': { distance_km: 0.7, duration_minutes: 10 },
    'kathmandu durbar square|swayambhunath': { distance_km: 2.6, duration_minutes: 38 },
    'dattatreya square|pottery square': { distance_km: 1.1, duration_minutes: 16 },
  };
  const result = pairs[key];
  if (!result) return { error: 'No mock route is available for that landmark pair.' };
  return { from, to, ...result, source: 'mock', note: 'Verify live street access locally.' };
}

export async function executeTool(name, args, context = {}) {
  if (name === 'calculate') {
    try { return String(safeCalculate(args.expression)); } catch (error) { return `Error: ${error.message}`; }
  }
  if (name === 'search_knowledge_base') {
    const chunks = await retrieveRelevantChunks(context.ai, String(args.query ?? ''), 2);
    if (!chunks.length || (chunks[0].score ?? 0) < 0.25) return 'No relevant information found in knowledge base.';
    return chunks.map((chunk) => `[${chunk.file} | score=${(chunk.score ?? 0).toFixed(3)}]: ${String(chunk.content).slice(0, 500)}`).join('\n\n');
  }
  if (name === 'get_walking_distance') {
    try { return JSON.stringify(get_walking_distance(args.from, args.to)); } catch (error) { return `Error: ${error.message}`; }
  }
  return `Unknown tool: ${name}`;
}

export const calculatorTool = {
  name: 'calculate',
  description: 'Evaluate arithmetic containing only + - * / and parentheses.',
  parametersJsonSchema: { type: 'object', properties: { expression: { type: 'string' } }, required: ['expression'] },
};
export const searchKnowledgeBaseTool = {
  name: 'search_knowledge_base',
  description: 'Search this product knowledge vault for relevant grounded notes.',
  parametersJsonSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
};
export const domainTool = {
  name: 'get_walking_distance',
  description: 'Return mock walking distances and times for selected Kathmandu Valley heritage pairs.',
  parametersJsonSchema: { type: 'object', properties: { from: { type: 'string', description: 'Starting landmark' }, to: { type: 'string', description: 'Destination landmark' } }, required: ['from', 'to'] },
};

export async function queryWithTools(ai, userMessage, maxRounds = 4) {
  const contents=[{ role:'user', parts:[{ text:userMessage }] }];
  const config={ tools:[{ functionDeclarations:[calculatorTool,searchKnowledgeBaseTool,domainTool] }] };
  for(let round=0;round<maxRounds;round+=1) {
    const response=await ai.models.generateContent({ model:'gemini-2.5-flash', contents, config });
    const calls=response.functionCalls;
    if(!calls?.length)return response.text??'';
    const modelContent=response.candidates?.[0]?.content; if(modelContent)contents.push(modelContent);
    const parts=[];
    for(const call of calls) {
      const result=await executeTool(call.name,call.args??{},{ai});
      parts.push({ functionResponse:{ name:call.name,response:{result},id:call.id } });
    }
    contents.push({role:'user',parts});
  }
  return 'Tool loop stopped after the maximum number of rounds.';
}
