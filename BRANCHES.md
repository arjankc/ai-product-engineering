# Branches & step-by-step solutions

This repo uses **one starter branch per track** and **one solution branch per track**.  
Solutions are meant to be followed **commit by commit** (or via the phase tags below)—not only as a finished dump at the tip.

## What to use when

| You want… | Use |
|-----------|-----|
| Shared lab kit (sessions, TODOs, generic vault) | `main` |
| Your product scaffold (PRD + domain vault) | `track-NN-…` |
| Step-by-step reference for that track | `solution-track-NN-…` **or** phase tags |
| Finished reference for that track | tip of `solution-track-NN-…` (or tag `solution-NN`) |

**Normally:** start on your **track** branch and implement the labs yourself.  
Open a **solution** branch/tag when you are stuck, comparing after a session, or reviewing instructor steps.

---

## 1. Pick a track (student start)

```bash
git clone https://github.com/arjankc/ai-product-engineering.git
cd ai-product-engineering
git checkout track-01          # short tag — or the full branch name below
cp .env.example .env           # add GEMINI_API_KEY
npm install
npm run dev
```

### Track branches (exact names)

| # | Short tag | Branch |
|---|-----------|--------|
| 1 | `track-01` | `track-01-context-aware-academic-assistant` |
| 2 | `track-02` | `track-02-smart-pantry-recipe-architect` |
| 3 | `track-03` | `track-03-local-hardware-troubleshooting-bot` |
| 4 | `track-04` | `track-04-travel-log-itinerary-copilot` |
| 5 | `track-05` | `track-05-personal-fitness-rehab-coach` |
| 6 | `track-06` | `track-06-automated-expense-tax-analyst` |
| 7 | `track-07` | `track-07-household-plant-care-botany-assistant` |
| 8 | `track-08` | `track-08-tabletop-rpg-board-game-master` |
| 9 | `track-09` | `track-09-local-heritage-architecture-guide` |
| 10 | `track-10` | `track-10-home-maintenance-diy-helper` |

Each track branch replaces `README.md` with that track’s PRD and ships a domain `sample-vault/`.

---

## 2. Step-by-step solutions (branches + commits)

Every `solution-track-NN-…` branch is the track starter plus **four progressive commits**:

| Step | Commit subject | Maps to labs (approx.) | Tag pattern |
|------|----------------|------------------------|-------------|
| Start | Initialize Track N PRD and Seed Vault | Before / with Session 5 | `track-NN` (same tree as starter) |
| Phase 1 | UI & Mock Backend | Sessions 5–6 | `solution-NN-phase-1` |
| Phase 2 | Vanilla Gemini Integration | Session 7 | `solution-NN-phase-2` |
| Phase 3 | The RAG Pipeline | Sessions 8–9 | `solution-NN-phase-3` |
| Phase 4 | Multimodal & Tools | Sessions 10–12 | `solution-NN-phase-4` |
| Tip | Full solution (phase 4, plus any polish) | Showcase reference | `solution-NN` |

Sessions 13–14 (eval + safety report) stay mostly on `main` / your own `03-Project/` work; use `GATES.md` and the eval scripts there.

### Walk one phase at a time

```bash
# Example: Track 1 after Session 7 — see Gemini wired up
git fetch --tags
git checkout solution-01-phase-2

# Compare to your work on the track branch (in another clone, or stash first)
git diff track-01
```

### Walk the commit history on the solution branch

```bash
git checkout solution-track-01-context-aware-academic-assistant
git log --oneline --grep="Phase\|Initialize Track"
```

Use `git show <commit>` or GitHub’s commit-by-commit view to read each step.

### Solution branches (exact names)

| # | Short tip tag | Branch |
|---|---------------|--------|
| 1 | `solution-01` | `solution-track-01-context-aware-academic-assistant` |
| 2 | `solution-02` | `solution-track-02-smart-pantry-recipe-architect` |
| 3 | `solution-03` | `solution-track-03-local-hardware-troubleshooting-bot` |
| 4 | `solution-04` | `solution-track-04-travel-log-itinerary-copilot` |
| 5 | `solution-05` | `solution-track-05-personal-fitness-rehab-coach` |
| 6 | `solution-06` | `solution-track-06-automated-expense-tax-analyst` |
| 7 | `solution-07` | `solution-track-07-household-plant-care-botany-assistant` |
| 8 | `solution-08` | `solution-track-08-tabletop-rpg-board-game-master` |
| 9 | `solution-09` | `solution-track-09-local-heritage-architecture-guide` |
| 10 | `solution-10` | `solution-track-10-home-maintenance-diy-helper` |

Phase tags look like `solution-01-phase-1` … `solution-01-phase-4` (same pattern for `02`–`10`).

---

## 3. Classroom norms

1. **Build on your track branch first.** Solutions are a safety net and teaching aid.
2. **Prefer phase tags** when unblocking a single lab (`solution-NN-phase-2`) instead of jumping straight to the tip.
3. **Do not submit a straight copy of phase 4** as your only work—showcase still needs your vault, eval suite, and risk report.
4. Ignore unrelated remote branches (e.g. old `jules-*` experiment branches).

---

## 4. Instructor note (history shape)

Track branches were created in sequence (Track 1 → 10). Later track **trees** only contain that track’s vault, but `git log` may still show earlier “Initialize Track …” commits. That is historical packaging, not mixed vault content. New track work should branch from current `main` when regenerating starters.
