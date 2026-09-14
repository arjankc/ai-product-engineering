# Lecture 01 — Big-O the way Prof. Shrestha teaches it

## Core framing

Prof. Shrestha insists students always state **worst-case** Big-O unless asked for average or best case.

1. Count dominant operations as a function of input size `n`.
2. Drop lower-order terms and constant factors.
3. Prefer the tightest simple bound (e.g. `O(n log n)` over a looser `O(n²)` when both are true).

## Classroom examples

- Linear scan of an array: `O(n)`.
- Binary search on a sorted array: `O(log n)`.
- Nested loops over `n × n`: `O(n²)`.

## Common mistakes she docks marks for

- Saying “this is O(n²) so it cannot also be O(n³)” (Big-O is an upper bound; tightness matters in her rubric).
- Ignoring that sorting before a linear pass may dominate (`O(n log n)` overall).
