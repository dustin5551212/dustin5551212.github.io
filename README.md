# Portfolio

A static site: markdown in, HTML out, no framework, no dependencies. Built to do the job the
[AI plan](~/Projects/ai-portfolio/PLAN.md) §5 asks for — public evidence with the measurement first.

```sh
npm test        # node --test site/*.test.mjs   (11 tests: the markdown renderer)
npm run build   # content/ → dist/, and checks every internal link resolves
npm run serve   # http://localhost:4173
npm start       # build, then serve
```

## Editing

Everything you would want to change lives in `content/`. The page shell (masthead, nav, colophon) is
`site/layout.mjs`; the design is one file, `site/styles.css`.

| file | becomes |
| --- | --- |
| `content/index.md` | `/` — hero, selected work, writing, about |
| `content/about.md` | `/about.html` |
| `content/work/<slug>.md` | `/work/<slug>.html` |
| `content/writing/<slug>.md` | `/writing/<slug>.html`, plus a generated `/writing/` index |

Front matter:

```yaml
---
title: Professional 500          # page title, and the h1 on entry pages
description: ...                 # <meta name="description"> and og:description
role: Browser game               # entry pages: shown in the mono meta line
year: 2026
date: 2026-10-30                 # posts: date and reading time
deck: One sentence under the title.
---
```

Markdown support is deliberately small and tested: headings, paragraphs, lists (with wrapped lines),
pipe tables, fenced code, quotes, rules, links, bold/italic, and `:::class` blocks that wrap content
in a div (they nest). Raw HTML in content is escaped, not executed.

## Conventions this site follows

- **Measurement before claim.** Every project entry leads with a number that reproduces, and where
  the first number was wrong the mistake is written down next to the fix. The four beats are the ones
  in PLAN §7: problem → decision → measurement → failure and the fix.
- **No decoration that isn't doing work.** One accent colour, one type pairing, hairline rules. The
  page is a spec sheet, not a brochure.
- **Nothing to load.** No framework, no cookie banner, no tracker, no icon pack. One stylesheet, one
  105 KB screenshot, two web fonts.

## Before this goes public

- [x] **Full name** — Dustin Ingersoll, set 2026-10-30 in the wordmark and every `<title>`
      (`site/layout.mjs`) and the home-page front matter. `site/assets/mark.svg` is an abstract mark,
      not a monogram, so it needs no change.
- [x] **Email** — `dustin.i.ingersoll@outlook.com`, set 2026-10-30 in `site/layout.mjs`, `content/about.md`
      and `content/index.md`. Change it in all three if it ever moves; `npm run build` picks up the rest.
- [ ] **Location / remote preference** — deliberately absent, because it was a guess. Add one line to
      `content/about.md` if you want it.
- [ ] **The demo link** — `http://malls-mpegs.tun.ply.gg:28879` appears in `content/index.md` and both
      work pages. It only works while the game's tunnel is up; check it before publishing, and if the
      address changes, update all three places plus `public-url.txt` in the game repo.
- [ ] **Host** — any static host works: GitHub Pages (push `dist/` to a `gh-pages` branch or a repo
      named `<user>.github.io`), Netlify, or the same box that serves the game. There is no build-time
      server, so nothing to run in production.

## Notes

- The build fails if an internal link points at a page it did not write, so renaming a slug cannot
  quietly ship a dead link.
- Tests cover the renderer, not the design: 11 cases including HTML escaping, nested `:::blocks`,
  wrapped list items, tables and front matter.
- `site/assets/table.webp` is a real screenshot of the game running at 1440×900, resized to 1600px.
