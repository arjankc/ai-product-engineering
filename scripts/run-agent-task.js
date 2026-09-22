/**
 * Session 10 Core: chained generateContent steps (not ReAct / not tools).
 *
 *   npm run agent-task -- "Your multi-step goal here"
 */
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const MODEL = 'gemini-2.5-flash';

async function askAi(ai, prompt) {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: { temperature: 0.3 },
  });
  return response.text ?? '';
}

/**
 * Stretch Goal: count numbered steps in the plan text.
 * Looks for lines like "1.", "2.", "3." etc.
 * Returns at least 1 and at most 8 (safety cap).
 */
function countPlanSteps(planText) {
  const matches = planText.match(/^\s*\d+\./gm);
  const count = matches ? matches.length : 0;
  const clamped = Math.min(Math.max(count, 1), 8);
  if (count < 4) {
    console.warn(
      `⚠️  Plan has only ${count} numbered step(s). Adjusting loop to ${clamped} iteration(s).`
    );
  }
  return clamped;
}

async function runAgentTask(ai, goal) {
  const steps = [];

  // The 'context' variable acts as the agent's memory payload
  let context = `Goal: ${goal}\n\n`;

  // Step 1: PLAN
  console.log('Agent is planning...');
  const plan = await askAi(
    ai,
    `${context}List 4 specific steps to achieve this goal. Number them 1 to 4.`
  );
  steps.push({ step: 'PLAN', output: plan });
  context += `Plan:\n${plan}\n\n`; // Append the plan to memory

  // Stretch Goal: parse step count from the plan so the loop is dynamic
  const numSteps = countPlanSteps(plan);
  console.log(`Plan parsed: executing ${numSteps} step(s).`);

  // Step 2: EXECUTE (dynamic loop based on parsed plan)
  for (let stepNum = 1; stepNum <= numSteps; stepNum += 1) {
    console.log(`Agent is executing step ${stepNum}...`);
    const output = await askAi(
      ai,
      `${context}Execute step ${stepNum} only. Produce complete output for this specific step.`
    );
    steps.push({ step: `EXECUTE_${stepNum}`, output });
    context += `Step ${stepNum} output:\n${output}\n\n`; // Append output to memory
  }

  // Step 3: SYNTHESIZE
  console.log('Agent is synthesizing final deliverable...');
  const final = await askAi(
    ai,
    `${context}Combine all step outputs into one final, highly professional deliverable. Remove redundant text.`
  );
  steps.push({ step: 'SYNTHESISE', output: final });

  return { steps, finalOutput: final };
}

async function main() {
  const goal = process.argv.slice(2).join(' ').trim();
  if (!goal) {
    console.error('Usage: npm run agent-task -- "your goal"');
    process.exit(1);
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Set GEMINI_API_KEY in .env');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });
  const result = await runAgentTask(ai, goal);
  for (const s of result.steps) {
    console.log('\n====', s.step, '====\n');
    console.log(s.output);
  }
  console.log('\n==== FINAL ====\n');
  console.log(result.finalOutput);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
