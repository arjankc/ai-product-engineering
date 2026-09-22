# Agent Task Execution Notes (Session 10)

## Lab 10.1 — Human Task Decomposition

**Chosen multi-step goal (Track 3 / hardware domain):**
> "From this user story JSON, produce a requirements list, sketch a REST API design, and write a test plan:
> `{ user: 'admin', action: 'delete_account' }`"

**How I would do this as a human (4 steps):**

1. **Parse & derive requirements** — Read the JSON user story, identify the actor (admin), the action (delete_account), and list the functional and non-functional requirements (auth check, confirmation prompt, cascading data deletion, audit log, rate limiting).
2. **Sketch REST API endpoints** — Design the HTTP verbs, paths, request bodies, and expected response codes for the delete-account flow (e.g. `DELETE /users/:id`, `POST /admin/accounts/:id/delete-request`).
3. **Write test cases** — Cover happy path (successful delete), guard paths (non-admin attempts, missing user), edge cases (already-deleted account, mid-delete failure), and security tests (auth bypass, CSRF).
4. **Synthesize into a deliverable** — Combine requirements, API design, and test plan into a single professional document with no redundancy.

---

## Lab 10.2 — Script: `scripts/run-agent-task.js`

Implementation: sequential chained prompting with accumulated `context` memory.
Stretch goal: after the PLAN step, `countPlanSteps()` parses the plan text for numbered lines (`/^\s*\d+\./gm`) and adjusts the execute loop to that count, capped at 8.

---

## Lab 10.3 — Run Log & Verification

**Command run:**
```bash
node scripts/run-agent-task.js "From this user story JSON, produce requirements, a REST sketch, and a test plan: { user: 'admin', action: 'delete_account' }"
```

**Console phase log:**
```
Agent is planning...
Plan parsed: executing 4 step(s).
Agent is executing step 1...
Agent is executing step 2...
Agent is executing step 3...
Agent is executing step 4...
Agent is synthesizing final deliverable...
```

### Step Summaries

| Step | Output Summary |
|---|---|
| **PLAN** | Generated 4 numbered steps: Deconstruct story → Define requirements → Sketch REST endpoint → Outline test plan |
| **EXECUTE_1** | Identified actor (`admin`), action (`delete`), target resource (`account`) |
| **EXECUTE_2** | Produced 7 FRs (auth, existence check, data removal, related data, confirmation, 404 handling, critical account protection) + 7 NFRs (authn, authz, auditability, error handling, data integrity, performance, idempotency) |
| **EXECUTE_3** | `DELETE /api/v1/accounts/{accountId}` with `Authorization: Bearer <token>`. Responses: `204`, `400`, `401`, `403`, `404`, `409`, `500`. Includes idempotency note and audit log spec |
| **EXECUTE_4** | Full test plan: positive (successful delete), negative (no auth, bad token, non-admin, non-existent, bad ID format), edge (self-delete, last-admin, idempotency, related data integrity) |
| **SYNTHESISE** | Combined all steps into one professional requirements + API + test plan document; removed redundant preamble |

---

### Verification Findings

**1. Did the agent stick to the plan?**
Yes — each EXECUTE step mapped 1-to-1 onto the corresponding plan step with no drift. The agent referenced its own FR/NFR codes (e.g., "Refer to NFR1, NFR2") in later steps, showing the context was being used correctly.

**2. Check one factual claim from step 2:**
EXECUTE_2 claimed `NFR7: Idempotency — "Repeated identical requests to delete the same account should have the same effect as the first request."` EXECUTE_3 then correctly designed the endpoint to return `404 Not Found` on subsequent deletes of the same ID — which is the standard REST interpretation of idempotency for DELETE. ✅ Factually consistent.

**3. Did context grow too long by step 4?**
No confusion was observed. By EXECUTE_4 the context contained ~2000 tokens (goal + plan + 3 step outputs). The model continued to reference earlier FR codes correctly. With `gemini-2.5-flash`'s large context window this was well within limits. For much longer goals (20+ steps, large outputs per step), context bloat would become a real risk.

**4. Stretch Goal result:**
`countPlanSteps()` detected exactly 4 numbered steps in the PLAN output and logged `Plan parsed: executing 4 step(s).` The loop ran 4 times as expected. If the model had returned only 3 numbered steps, the loop would have adjusted to 3 automatically and printed a warning.

---

### Key Reflections

- **Chained prompting vs. autonomous tool calling**: This chained pattern is *deterministic* — the loop always runs the pre-set number of times. A true ReAct agent (Session 11+) would observe the output of each step and decide whether to stop, retry, or call a tool. The chained approach is simpler and more predictable, but cannot self-correct.
- **Memory = appended strings**: The "memory" here is just string concatenation. It has no retrieval or prioritization — everything is kept forever. This is fine for short tasks but would hit token limits in production workflows.
- **Temperature 0.3** kept responses focused and structured. Higher temperature would likely produce more creative but less consistent step outputs.
