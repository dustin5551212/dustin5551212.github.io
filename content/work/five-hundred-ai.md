---
title: Five Hundred AI
description: A Python port of the 500 play phase with a paired benchmark and bootstrap intervals — the baseline a learned agent has to beat, measured before any training starts.
role: ML engineering
year: 2026
deck: Before training anything, I ported the game to Python and built the measurement. The measurement found two bugs in itself first, which is the only reason to trust the number it produced.
---

## The idea

The browser game has a CPU opponent that plays well enough to keep a table of four people interested.
Nobody knew how well. "It usually beats me" is not a baseline you can improve against, so this
project ports the play phase to Python, measures that opponent properly, and puts a floor under
whatever gets trained later.

## Measurement before model

The harness plays **2,000 deals, seed 7, every deal twice with the sides swapped**. The pair is the
unit of analysis — hand strength cancels inside it, so what survives is the decisions. The metric is
mean tricks per hand, with a percentile bootstrap over paired deals. Ties stay in the data as a
mid-size difference instead of being assigned to the loss column.

| matchup | A tricks | B tricks | A − B | 95% CI | A wins | tied |
| --- | --- | --- | --- | --- | --- | --- |
| heuristic vs random | 5.78 | 4.22 | **+1.56** | [+1.50, +1.62] | 57.6% | 19.1% |
| heuristic vs lowest-card | 5.94 | 4.06 | **+1.88** | [+1.82, +1.94] | 62.9% | 17.5% |
| heuristic vs heuristic (control) | 5.00 | 5.00 | **+0.00** | [+0.00, +0.00] | 40.0% | 21.5% |

The third row is the one that matters most: identical logic on both sides must cancel to exactly
zero. If it does not, every other number in the table is suspect.

## What the number buys

- **A floor.** A learned agent has to clear **+1.56 tricks a hand** over random to be interesting, and
  the interval means "cleared it" is a statistical claim rather than a lucky afternoon.
- **A speed budget.** ~600 hands/second on one core, so a million-hand training run is about half an
  hour of CPU. The whole comparison above takes 6.6 seconds.
- **A contract check.** Splitting by denomination (clubs +1.51, diamonds +1.49, hearts +1.66, spades
  +1.45, no trumps +1.70) is how you notice that the opponent is weaker at no-trumps than the average
  hides.

## Where it is now

Milestone one is done: the engine, the baselines and the paired benchmark, 27 tests, and a result
that reproduces from a seed. Next is the auction and the kitty exchange in the port, then the agent
that has to beat the number above — a self-play learner with the heuristic as its sparring partner
rather than an afterthought.

Two mistakes made it into the first version of this harness and both are written up in
[the post](/writing/benchmark-mistakes.html): unpaired deals, and ties folded into losses. The second
one produced a 57.7% versus 24.5% asymmetry that made no sense until it was traced.

[Professional 500, the game this measures](/work/professional-500.html)
