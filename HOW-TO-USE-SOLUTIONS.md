# How to use solutions (classroom)

Solutions are **public and step-by-step**. Each track has a solution branch with four progressive commits. Short **tags** make those steps easy to check out.

## Classroom norm

1. Check out your **track** branch and attempt the lab yourself.
2. If you are blocked—or at the end of the lab hour—open the matching **phase tag**.
3. Diff the solution against your work, learn the gap, then return to your track branch and continue.

Do **not** jump straight to `solution-NN` (full tip) unless you are reviewing the finished reference for showcase prep.

## Phase → session map

| Tag | Commit subject | Open after / for |
|-----|----------------|------------------|
| `solution-NN-phase-1` | UI & Mock Backend | Sessions 5–6 |
| `solution-NN-phase-2` | Vanilla Gemini Integration | Session 7 |
| `solution-NN-phase-3` | The RAG Pipeline | Sessions 8–9 |
| `solution-NN-phase-4` | Multimodal & Tools | Sessions 10–12 |
| `solution-NN` | Full solution tip | Showcase reference only |

Sessions 13–14 (eval suite + AI risk report) use templates on `main` / `03-Project/`—there is no separate solution phase commit for those.

## Copy-paste: Track 1

```bash
git clone https://github.com/arjankc/ai-product-engineering.git
cd ai-product-engineering
git fetch --tags

# Build here
git checkout track-01

# Example: unstick Session 7
git checkout solution-01-phase-2
# inspect server.js / public/, then:
git checkout track-01
```

Replace `01` with your track number (`02` … `10`). Full branch names and the complete tag table: **[BRANCHES.md](BRANCHES.md)**.

## Showcase rule

`solution-NN` / phase 4 is a **reference**, not a drop-in submission. Showcase still requires:

- Your own vault / domain notes and a working RAG path
- Scored `test-suite.json` (see Session 13 / `GATES.md`)
- `03-Project/AI-Risk-Report.md` (Session 14)
