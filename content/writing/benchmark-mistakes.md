---
title: Two mistakes I made benchmarking a card AI
description: A paired benchmark, a bootstrap interval, and the 19% of hands that made the first result look like progress.
date: 2026-10-30
deck: The first run reported 57.7% for one agent and 24.5% for the other in the same matchup. Swapping the seats only reversed the numbers — which is the tell that you are measuring the deal, not the players.
---

I had two agents and a card game. The first benchmark said agent A beat agent B in 57.7% of games.
Then I swapped which side dealt first, ran it again, and got 24.5% — for the same two agents, over the
same rules, with nothing changed but the seating.

That number is impossible. A fair comparison of A against B cannot depend on which chair A sits in.
So the benchmark was broken, and the only question was in how many ways.

## Mistake one: deals were not paired

A deal of 500 is a fixed pair of hands. Play it once and the result is mostly a statement about the
cards. Run 2,000 deals and you have one sample of 2,000 card distributions; run it again with a
different seed and you have a different sample. Any difference between two agents then contains the
cards as an error term nobody bounded.

The fix is boring and it is not optional: play every deal **twice**, once with A on the north–south
seats and once with B there, on the identical deal, contract and contractor. The pair becomes the unit
of analysis, so hand strength cancels inside it. What is left is the decisions.

## Mistake two: ties counted as losses

Ten tricks split 5–5 in about **19%** of hands. A win-rate column that folds ties into the loss side
understates both players, and — this is the part that made the asymmetry visible — it does not mirror
when the seats swap. The agent in the "winning" chair keeps the ties; the other one loses them.

So the metric moved from wins to **mean tricks**, with a percentile bootstrap over paired deals. Ties
are no longer a category to be assigned; they are just a mid-size difference in the thing being measured.

## The control that should have caught both

A benchmark needs a run where the correct answer is known in advance. Here it is `heuristic vs
heuristic`: identical logic on both sides, deals paired and swapped. It must come out at exactly
**+0.00**, because every pair is the same game twice.

| matchup | A − B tricks | 95% CI | A wins | tied |
| --- | --- | --- | --- | --- |
| heuristic vs random | +1.56 | [+1.50, +1.62] | 57.6% | 19.1% |
| heuristic vs lowest-card | +1.88 | [+1.82, +1.94] | 62.9% | 17.5% |
| heuristic vs heuristic (control) | +0.00 | [+0.00, +0.00] | 40.0% | 21.5% |

The control was in the harness from the start and I still shipped the broken metric first, because I
ran the interesting matchup before the boring one. Now the control runs first, and a non-zero result
there stops everything.

## What changed

Only the conclusion, which is the point. The heuristic was worth **+1.56 tricks a hand** over random
play, with a confidence interval of +1.50 to +1.62 — a baseline a learned agent can be held to,
measured once and reproduced from a seed rather than remembered from a good evening.

> A benchmark you have not tried to break is a marketing document. The control row is the cheapest
> test you will ever write, and the failure it catches is your own.

Two thousand paired deals take 6.6 seconds on one core. The harness that took a day to get right is
the cheapest part of the project, and the only part that made the rest of it mean anything.
