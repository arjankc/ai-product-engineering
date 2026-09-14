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

/** Hardcoded CS101 deadlines for Track 1 tool demo. */
export function getUpcomingDeadlines(courseCode = 'CS101') {
  const code = String(courseCode || 'CS101').toUpperCase();
  return {
    course_code: code,
    deadlines: [
      {
        item: 'Assignment 1 — JavaScript warm-up',
        due: 'Friday of Week 3, 23:59',
      },
      {
        item: 'Assignment 2 — Sorting comparison',
        due: 'Friday of Week 6, 23:59',
      },
      { item: 'Midterm exam', due: 'Week 7 (see Rubric-Exams.md)' },
      { item: 'Final exam', due: 'Exam week (cumulative)' },
    ],
  };
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
  if (name === 'get_upcoming_deadlines') {
    return JSON.stringify(getUpcomingDeadlines(args.course_code));
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
    'Search the CS101 course knowledge base (Obsidian vault embeddings) for relevant notes.',
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

export const upcomingDeadlinesTool = {
  name: 'get_upcoming_deadlines',
  description:
    'Return hardcoded upcoming CS101 deadlines (assignments and exams).',
  parametersJsonSchema: {
    type: 'object',
    properties: {
      course_code: {
        type: 'string',
        description: 'Course code, e.g. CS101',
      },
    },
    required: [],
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
          upcomingDeadlinesTool,
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
