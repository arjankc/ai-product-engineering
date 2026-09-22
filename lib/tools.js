/**
 * @fileoverview Session 11 Core: Tool calling and action execution engine.
 * Defines function schemas, safe expression arithmetic evaluation, and agentic tool call loop.
 */

import { retrieveRelevantChunks } from './rag.js';

/**
 * Tokenizes a string expression into numbers and arithmetic operators.
 *
 * @param {string} expression - The math expression string to tokenize.
 * @returns {Array<number|string>} Array of tokens.
 * @throws {Error} Throws if unsupported characters are encountered.
 */
function tokenize(expression) {
  const tokens = [];
  const src = String(expression).replace(/\s+/g, '');
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if ('+-*/()'.includes(ch)) {
      tokens.push(ch);
      i += 1;
      continue;
    }
    if (/\d/.test(ch) || ch === '.') {
      let num = '';
      while (i < src.length && /[\d.]/.test(src[i])) {
        num += src[i];
        i += 1;
      }
      tokens.push(Number(num));
      continue;
    }
    throw new Error('Unsupported expression');
  }
  return tokens;
}

/**
 * Parses and evaluates tokenized arithmetic expressions using recursive descent.
 *
 * @param {Array<number|string>} tokens - Token array from `tokenize`.
 * @returns {number} Calculated numerical result.
 * @throws {Error} Throws if syntax is invalid or paren matching fails.
 */
function parseExpr(tokens) {
  let pos = 0;

  function peek() {
    return tokens[pos];
  }

  function consume() {
    const t = tokens[pos];
    pos += 1;
    return t;
  }

  function factor() {
    const t = peek();
    if (t === '(') {
      consume();
      const v = add();
      if (consume() !== ')') throw new Error('Unsupported expression');
      return v;
    }
    if (typeof t === 'number') return consume();
    if (t === '-') {
      consume();
      return -factor();
    }
    throw new Error('Unsupported expression');
  }

  function mul() {
    let v = factor();
    while (peek() === '*' || peek() === '/') {
      const op = consume();
      const r = factor();
      v = op === '*' ? v * r : v / r;
    }
    return v;
  }

  function add() {
    let v = mul();
    while (peek() === '+' || peek() === '-') {
      const op = consume();
      const r = mul();
      v = op === '+' ? v + r : v - r;
    }
    return v;
  }

  const value = add();
  if (pos !== tokens.length) throw new Error('Unsupported expression');
  return value;
}

/**
 * Safely evaluates a mathematical string expression without using `eval()` or `Function()`.
 *
 * @param {string} expression - Math expression containing digits, +, -, *, /, (), or decimals.
 * @returns {number} Evaluated numerical result.
 * @throws {Error} Throws if expression is invalid or non-numeric.
 */
export function safeCalculate(expression) {
  const result = parseExpr(tokenize(expression));
  if (typeof result !== 'number' || Number.isNaN(result)) {
    throw new Error('Not a number');
  }
  return result;
}

/**
 * Executes a tool function requested by the LLM function calling mechanism.
 *
 * @async
 * @param {string} name - The registered function name (e.g. 'calculate' or 'search_knowledge_base').
 * @param {Record<string, unknown>} args - Arguments object supplied by Gemini model tool call.
 * @param {{ ai?: import('@google/genai').GoogleGenAI }} [ctx={}] - Context object containing AI client instance.
 * @returns {Promise<string>} Tool execution result string returned to the model.
 */
export async function executeTool(name, args, ctx = {}) {
  if (name === 'calculate') {
    try {
      return String(safeCalculate(args.expression));
    } catch (err) {
      return `Error: ${err.message}`;
    }
  }
  if (name === 'search_knowledge_base') {
    // Lab 11.2: retrieve top 2 chunks and return them to the model
    const chunks = await retrieveRelevantChunks(ctx.ai, String(args.query ?? ''), 2);
    if (!chunks.length || chunks[0].score < 0.5) {
      return 'No relevant information found in knowledge base.';
    }
    return chunks.map((c) => `[${c.file}]: ${String(c.content).slice(0, 500)}`).join('\n\n');
  }
  if (name === 'ping_device') {
    // Lab 11.3 Stretch: Track 3 PRD mock connectivity check
    // 192.168.1.1 = online, 192.168.1.50 = offline, all others = unknown
    const ip = String(args.ip_address ?? '').trim();
    if (ip === '192.168.1.1') return `${ip}: ONLINE — router responded to ping.`;
    if (ip === '192.168.1.50') return `${ip}: OFFLINE — no response (device unreachable or powered off).`;
    return `${ip}: UNKNOWN — address not in the device inventory.`;
  }
  return `Unknown tool: ${name}`;
}

/**
 * Calculator tool declaration for Gemini API function calling.
 */
export const calculatorTool = {
  name: 'calculate',
  description:
    'Evaluate a simple arithmetic expression and return the result. Use (15 / 100) * 2340 for percentages, not the % sign.',
  parametersJsonSchema: {
    type: 'object',
    properties: {
      expression: {
        type: 'string',
        description: 'Arithmetic only: + - * / ( ). Example: (15 / 100) * 2340',
      },
    },
    required: ['expression'],
  },
};

/**
 * Knowledge base search tool declaration for Gemini API function calling.
 */
export const searchKnowledgeBaseTool = {
  name: 'search_knowledge_base',
  description:
    'Search the course knowledge base (Obsidian vault embeddings) for relevant notes.',
  parametersJsonSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Natural language search query',
      },
    },
    required: ['query'],
  },
};

/**
 * Track 3 Stretch: ping_device tool declaration for connectivity checks.
 * Mock: 192.168.1.1 = online, 192.168.1.50 = offline, others = unknown.
 */
export const pingDeviceTool = {
  name: 'ping_device',
  description:
    'Check the network connectivity status of a device by IP address. Returns ONLINE, OFFLINE, or UNKNOWN.',
  parametersJsonSchema: {
    type: 'object',
    properties: {
      ip_address: {
        type: 'string',
        description: 'IPv4 address to ping, e.g. 192.168.1.1',
      },
    },
    required: ['ip_address'],
  },
};


/**
 * Bounded multi-turn tool calling loop that manages model generation, tool execution, and response synthesis.
 *
 * @async
 * @param {import('@google/genai').GoogleGenAI} ai - Initialized GoogleGenAI client.
 * @param {string} userMessage - User query message.
 * @param {number} [maxRounds=4] - Maximum tool call iteration rounds allowed.
 * @returns {Promise<string>} Final text answer generated by model.
 */
export async function queryWithTools(ai, userMessage, maxRounds = 4) {
  const config = {
    tools: [
      {
        functionDeclarations: [
          calculatorTool,
          searchKnowledgeBaseTool, // Lab 11.2: search the hardware vault
          pingDeviceTool,          // Lab 11.3 Stretch: Track 3 domain tool
        ],
      },
    ],
  };
  const contents = [{ role: 'user', parts: [{ text: userMessage }] }];

  for (let round = 0; round < maxRounds; round += 1) {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config,
    });

    const calls = response.functionCalls;
    if (!calls?.length) {
      return response.text ?? '';
    }

    const modelContent = response.candidates?.[0]?.content;
    if (modelContent) contents.push(modelContent);

    const parts = [];
    for (const toolCall of calls) {
      const args = toolCall.args ?? {};
      const result = await executeTool(toolCall.name, args, { ai });
      parts.push({
        functionResponse: {
          name: toolCall.name,
          response: { result },
          id: toolCall.id,
        },
      });
    }
    contents.push({ role: 'user', parts });
  }

  return 'Tool loop stopped after the maximum number of rounds.';
}
