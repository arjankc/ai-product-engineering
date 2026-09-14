/**
 * @fileoverview Session 11 Core: Tool calling and action execution engine.
 * Defines function schemas, safe expression arithmetic evaluation, and agentic tool call loop.
 */

import { retrieveRelevantChunks } from './rag.js';

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

export function safeCalculate(expression) {
  const result = parseExpr(tokenize(expression));
  if (typeof result !== 'number' || Number.isNaN(result)) {
    throw new Error('Not a number');
  }
  return result;
}

/** Rough macro lookup for demo ingredients. */
export function calculateNutrition(ingredients) {
  const list = Array.isArray(ingredients)
    ? ingredients
    : String(ingredients ?? '')
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
  const table = {
    rice: { calories: 200, protein: 4, carbs: 45 },
    chicken: { calories: 250, protein: 30, carbs: 0 },
    spinach: { calories: 25, protein: 3, carbs: 4 },
    pasta: { calories: 220, protein: 8, carbs: 43 },
    lentils: { calories: 180, protein: 12, carbs: 30 },
    egg: { calories: 70, protein: 6, carbs: 1 },
    eggs: { calories: 70, protein: 6, carbs: 1 },
  };
  const totals = { calories: 0, protein: 0, carbs: 0, items: [] };
  for (const raw of list) {
    const key = raw.toLowerCase();
    const hit = Object.entries(table).find(([k]) => key.includes(k));
    const macros = hit ? hit[1] : { calories: 50, protein: 2, carbs: 5 };
    totals.calories += macros.calories;
    totals.protein += macros.protein;
    totals.carbs += macros.carbs;
    totals.items.push({ ingredient: raw, ...macros });
  }
  return totals;
}

export async function executeTool(name, args, ctx = {}) {
  if (name === 'calculate') {
    try {
      return String(safeCalculate(args.expression));
    } catch (err) {
      return `Error: ${err.message}`;
    }
  }
  if (name === 'search_knowledge_base') {
    const chunks = await retrieveRelevantChunks(ctx.ai, String(args.query ?? ''), 2);
    if (!chunks.length || (chunks[0].score ?? 0) < 0.25) {
      return 'No relevant information found in knowledge base.';
    }
    return chunks
      .map((c) => `[${c.file} | score=${(c.score ?? 0).toFixed(3)}]: ${String(c.content).slice(0, 500)}`)
      .join('\n\n');
  }
  if (name === 'calculate_nutrition') {
    return JSON.stringify(calculateNutrition(args.ingredients));
  }
  return `Unknown tool: ${name}`;
}

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

export const searchKnowledgeBaseTool = {
  name: 'search_knowledge_base',
  description:
    'Search the household pantry knowledge base (Obsidian vault embeddings) for relevant notes.',
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

export const calculateNutritionTool = {
  name: 'calculate_nutrition',
  description:
    'Estimate calories/protein/carbs for a list of ingredients using a tiny hardcoded table.',
  parametersJsonSchema: {
    type: 'object',
    properties: {
      ingredients: {
        type: 'array',
        items: { type: 'string' },
        description: 'Ingredient names, e.g. ["rice", "chicken", "spinach"]',
      },
    },
    required: ['ingredients'],
  },
};

const MODEL = 'gemini-2.5-flash';

export async function queryWithTools(ai, userMessage, maxRounds = 4) {
  const config = {
    tools: [
      {
        functionDeclarations: [
          calculatorTool,
          searchKnowledgeBaseTool,
          calculateNutritionTool,
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
