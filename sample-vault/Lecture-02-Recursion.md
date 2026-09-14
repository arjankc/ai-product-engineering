# Lecture 02 — Recursion rules for CS101

## What “good” recursion looks like in this course

1. **Base case** that is obviously correct and reachable.
2. **Recursive case** that makes progress toward the base case.
3. Prefer clarity over micro-optimizations unless the assignment asks for tail recursion.

## Preferred teaching examples

- Factorial and Fibonacci are for intuition only — Fibonacci without memoization is called out as exponentially bad.
- Tree recursion is introduced with binary trees after arrays.

## Debugging checklist (from lecture)

- Draw the call stack for `n = 3` before coding.
- Confirm the base case returns the same type as the recursive case.
- Watch for off-by-one when slicing arrays (`slice(1)` vs `slice(0, n-1)`).
