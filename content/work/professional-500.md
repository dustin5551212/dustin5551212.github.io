---
title: Professional 500
description: A 45-card trick-taking game with a browser table, an invite-link lobby and a CPU opponent — no dependencies, 180 tests, running on a home server behind a tunnel.
role: Browser game
year: 2026
deck: Four seats, one link. The engine is plain JavaScript with no dependencies; the table is a single page; the CPU was the part that had to be measured before it could be bragged about.
---

## What it is

500 is a trick-taking game played with a 45-card deck — the four suits down to the four, plus a
joker that outranks everything when it is trumps. The game here is the full thing: bidding for the
contract, the kitty exchange, trick play with legal-play enforcement, and scoring across hands until
a side passes 500.

It runs in a browser, it is played with the family over a tunnel, and it was built to be boring to
deploy.

## The constraints I picked

- **No dependencies.** Not a minimal one, none. `node --test src/` runs the suite; `npm start` is a
  forty-line static server, because ES modules will not load from `file://` and opening the HTML
  directly gives you a blank table.
- **The rules engine is separate from the table.** Legal plays, trick resolution, the auction and the
  scoring are pure modules with their own tests, so the UI can be wrong without the game being wrong —
  and a test failure points at a rule, not at a `div`.
- **One link to invite people.** The host opens a table, the lobby offers a single share link, guests
  pick a free chair, and the seat is handed a token. No accounts, no logins, no "create a room" form.

![The table during the auction: the fan sits on the felt's oval and glows when it is your bid, the kitty waits in the middle, and the seats show who is where.](/assets/table.webp)

## How it is put together

| piece | what it does |
| --- | --- |
| `src/deck.js`, `src/trick.js`, `src/trump.js` | deck, legal plays, trick winner, bower rules |
| `src/auction.js`, `src/scoring.js` | bidding rounds and the scoring table |
| `src/ui/` | card rendering, fan geometry, table layout |
| `src/net/` | the room API and a server-sent-events stream for the other seats |
| `scripts/serve.js` | static server, cache headers, no framework |

The layout is computed rather than hard-coded: the cards scale with the window, the fan is placed
against the felt's painted oval, and the side seats are pushed clear of the corner chrome so a name
plate never ends up underneath the "your bid" pill on a short window.

## Running it for real

The game runs as a user service on a home machine, published through a playit.gg tunnel so guests can
join from anywhere. Three things keep it honest:

- a **watchdog** that probes the public URL every 45 seconds and restarts the tunnel if it stops answering;
- a **tunnel address in one file** (`public-url.txt`), so invite links build from whatever the address is today;
- a **test-gated push** (`scripts/git-sync.sh`), which commits and pushes only if the suite still passes — so a broken tree stays local instead of becoming history.

## By the numbers

| metric | value |
| --- | --- |
| tests | 143, `node --test`, no install |
| dependencies | 0 |
| deck | 45 cards, 4 seats, 5-card kitty |
| card faces | 44 CC0 SVGs, optimised 2.3 MB → 1.3 MB |
| sound | synthesised with Web Audio; no audio files |

## What was hard

Not the rules — the *geometry*. A fan of ten cards, an oval painted on the felt, four name plates, a
bid control, an invite panel, and a window that can be any size. Every one of those collisions was
found by measuring rectangles in a live page at four window heights, not by looking at a screenshot
and nudging numbers. The hand placement is derived from the oval and then corrected once with where
the cards actually landed, because the fan carries padding the first estimate does not know about.

[Play the game](http://malls-mpegs.tun.ply.gg:28879) · [The measurement behind the CPU](/work/five-hundred-ai.html)
