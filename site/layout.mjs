/**
 * The page shell. Every page is the same masthead, the same colophon, and whatever
 * the markdown produced in between.
 */

const NAV = [
  { href: "/", label: "Work" },
  { href: "/writing/", label: "Writing" },
  { href: "/about.html", label: "About" },
];

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

export function page({ title, description, path, body, kicker = "", wide = false }) {
  const fullTitle = title ? `${title} — Dustin` : "Dustin — applied AI engineer";
  const nav = NAV.map((item) => {
    const active =
      item.href === "/" ? path === "/" : path.startsWith(item.href.replace(/\/$/, ""));
    return `<a href="${item.href}"${active ? ' aria-current="page"' : ""}>${item.label}</a>`;
  }).join("\n          ");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(fullTitle)}</title>
    <meta name="description" content="${esc(description)}" />
    <meta property="og:title" content="${esc(fullTitle)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:type" content="website" />
    <meta name="color-scheme" content="only light" />
    <link rel="icon" href="/assets/mark.svg" type="image/svg+xml" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&family=JetBrains+Mono:wght@400;500&display=swap"
    />
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <a class="skip" href="#main">Skip to content</a>

    <header class="masthead">
      <a class="wordmark" href="/">Dustin<span class="wordmark__mark">·</span><span class="wordmark__sub">applied AI</span></a>
      <nav class="nav" aria-label="Sections">
          ${nav}
      </nav>
    </header>

    <main id="main"${wide ? ' class="main--wide"' : ""}>
${kicker ? `      <p class="kicker">${kicker}</p>\n` : ""}${body}
    </main>

    <footer class="colophon">
      <div class="colophon__row">
        <span class="mono">Contact</span>
        <p>
          <a href="mailto:dustin5551212@outlook.com">dustin5551212@outlook.com</a> ·
          <a href="https://github.com/dustin5551212" rel="noopener" target="_blank">github.com/dustin5551212</a>
        </p>
      </div>
      <div class="colophon__row">
        <span class="mono">Colophon</span>
        <p>
          Hand-built static site: no framework, no tracker, no cookie banner. Markdown in,
          HTML out, ${"`node --test`"} green. Set in Newsreader and JetBrains Mono.
        </p>
      </div>
    </footer>
  </body>
</html>
`;
}
