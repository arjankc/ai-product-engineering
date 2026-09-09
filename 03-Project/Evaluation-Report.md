# Evaluation & Quality Report (Session 13)

## 1. Evaluation Methodology
- **Test Suite**: `test-suite.json` containing >= 15 domain-specific test cases across query types (factual retrieval, out-of-domain, edge cases, multi-hop).
- **Scoring Scale**:
  - **Correctness (1-5)**: 1 = Completely incorrect / hallucinated; 5 = Factually accurate and complete.
  - **Relevance (1-5)**: 1 = Off-topic / evasive; 5 = Directly answers user intent concisely.

## 2. Test Suite Benchmark Results

| Case ID | Category | Question | Expected Output | Actual Output | Correctness (1-5) | Relevance (1-5) | Notes |
|---------|----------|----------|-----------------|---------------|-------------------|-----------------|-------|
| 1 | Grounded QA | [Question 1] | [Expected 1] | [Actual 1] | | | |
| 2 | Grounded QA | [Question 2] | [Expected 2] | [Actual 2] | | | |
| 3 | Out-of-Domain | [Question 3] | [Expected 3] | [Actual 3] | | | |
| ... | ... | ... | ... | ... | | | |

## 3. Aggregate Metrics & Performance
- **Average Correctness**: [X.X / 5]
- **Average Relevance**: [X.X / 5]
- **Lowest Performing Category**: [Category name and failure analysis]

## 4. Error Analysis & Hallucination Patterns
- **Identified Failure Mode 1**: [e.g., Low retrieval score when user uses synonyms]
- **Identified Failure Mode 2**: [e.g., Gemini hallucinating facts not present in vault context]

## 5. Iterative Refinement & Post-Fix Rescore
- **Change Applied**: [e.g., Added system prompt instruction "State clearly if context is missing", or increased topK retrieval to 5]
- **Re-evaluation Results**:
  - **New Average Correctness**: [Y.Y / 5]
  - **New Average Relevance**: [Y.Y / 5]
