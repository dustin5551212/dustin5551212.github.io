---
title: Dustin — applied AI engineer
description: Applied AI engineer building retrieval systems, agents and a self-play card engine — and measuring them honestly.
---

:::hero
# I build systems, then measure whether they work.

Two projects in public: a card game my family actually plays, and the learning agent that has to
beat the game's own hand-tuned CPU before it counts as anything. The measurements come first here,
including the ones that were wrong.

:::hero-links
[Play the game](http://malls-mpegs.tun.ply.gg:28879)
[Source on GitHub](https://github.com/dustin5551212)
[Writing](/writing/)
:::
:::

:::section
## 01 — Selected work

:::entry
## [Professional 500](/work/professional-500.html)

**Problem —** 500 is a trick-taking game with a hand-tuned CPU opponent, and nobody knew how good
that opponent actually was. A game that plays well enough to keep four people at a table for an
evening, built with no dependencies and no framework, was still just an opinion about its own strength.

**Decision —** Publish the engine and keep the claims testable: a 45-card deck, a rules engine with
legal-play enforcement, and 143 tests that run with `node --test`, no install step. Then measure the
CPU properly rather than quoting a win rate from a handful of games.

**Measurement —** **143 tests, zero dependencies**, and a deal that renders in the browser from a
40-line static server. The CPU turned out to be worth **+1.56 tricks a hand** over random play
(95% CI +1.50 to +1.62, 2,000 paired deals) — a number, not a feeling about how it felt to lose.

**Failure and the fix —** My first benchmark said the same two agents won 57.7% and 24.5% depending
on which side they sat. That asymmetry was the tell: ties were counted as losses and deals were reused.
Fixing both changed the conclusion.

[Read the build notes](/work/professional-500.html) · [Play it](http://malls-mpegs.tun.ply.gg:28879)
:::

:::entry
## [Five Hundred AI](/work/five-hundred-ai.html)

**Problem —** A heuristic opponent is a moving target: to train something better you need a
benchmark that is honest about deal luck, and a baseline strong enough that beating it means something.

**Decision —** Build the measurement before the model. Every deal is played twice with the sides
swapped, the pair is the unit of analysis, and the metric is mean tricks with a percentile bootstrap
interval — plus a `heuristic vs heuristic` control that must come out at exactly zero.

**Measurement —** Heuristic vs random: **+1.56 tricks/hand** [+1.50, +1.62]. Heuristic vs always-lowest:
**+1.88** [+1.82, +1.94]. The control: **+0.00**. Throughput is ~600 hands/second on one core, so a
million-hand training run is about half an hour of CPU.

**Failure and the fix —** Two mistakes, both ordinary: unpaired deals let the cards dominate the
comparison, and folding ~19% tied hands into the loss column made the same agents look different
depending on which chair they sat in. Both are written up, with the fix, in
[the post](/writing/benchmark-mistakes.html).

[Read the build notes](/work/five-hundred-ai.html)
:::

:::

:::section
## 02 — Writing

[**Two mistakes I made benchmarking a card AI — and the 19% of hands that hid them**](/writing/benchmark-mistakes.html)

The first benchmark reported 57.7% for one agent and 24.5% for the other in the same matchup. The
tell was that swapping the seats only reversed the numbers. Ties, reused deals, and a control that
should have caught it and didn't.

[All writing](/writing/)

:::

:::section
## 03 — About

I'm an engineer who prefers a number to an adjective. I spent years building software that other
people run, and I'm now building the AI half of it in public: retrieval with an eval harness that
could embarrass me, an agent that survives failure, and the game engine above that started as an
evening's project and became the baseline everything else has to beat.

What I'm looking for: an applied AI engineering role where shipping and measuring are the same job.
[More about me](/about.html), or [email me](mailto:dustin5551212@outlook.com).
:::
