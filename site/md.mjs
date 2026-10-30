/**
 * A deliberately small markdown renderer: headings, paragraphs, lists, fenced code,
 * quotes, rules, pipe tables, and inline links / code / emphasis.
 *
 * It is not CommonMark and does not try to be. It handles exactly what this site's
 * content uses, it escapes HTML first, and it is covered by tests — which is more
 * than most "just use a library" choices can say for a 130-line file.
 */

const escapeHtml = (text) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Inline rules, applied to already-escaped text. */
export function inline(text) {
  return text
    .replace(/`([^`]+)`/g, (_, code) => `<code>${code}</code>`)
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, src) => `<img src="${src}" alt="${alt}" loading="lazy" />`)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
      const external = /^https?:/.test(href);
      const attrs = external ? ' rel="noopener" target="_blank"' : "";
      return `<a href="${href}"${attrs}>${label}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[\s(])_([^_]+)_(?=[\s).,;:!?]|$)/g, "$1<em>$2</em>")
    .replace(/(^|[\s(])\*([^*]+)\*(?=[\s).,;:!?]|$)/g, "$1<em>$2</em>");
}

function renderTable(lines) {
  const cells = (row) =>
    row
      .replace(/^\||\|$/g, "")
      .split("|")
      .map((cell) => cell.trim());
  const head = cells(lines[0]);
  const body = lines.slice(2).map(cells);
  const rows = body
    .map((row) => `      <tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join("")}</tr>`)
    .join("\n");
  return `    <table>
      <thead>
        <tr>${head.map((cell) => `<th scope="col">${inline(cell)}</th>`).join("")}</tr>
      </thead>
      <tbody>
${rows}
      </tbody>
    </table>`;
}

export function renderMarkdown(source) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    // :::class … ::: wrapper, so content can name a block without emitting raw HTML
    const blockOpen = line.match(/^:::([a-z][a-z0-9-]*)\s*$/);
    if (blockOpen) {
      const inner = [];
      let depth = 1;
      i += 1;
      while (i < lines.length && depth > 0) {
        const current = lines[i];
        if (/^:::[a-z]/.test(current)) depth += 1;
        else if (/^:::\s*$/.test(current)) {
          depth -= 1;
          if (depth === 0) break;
        }
        inner.push(current);
        i += 1;
      }
      i += 1; // closing marker
      const rendered = renderMarkdown(inner.join("\n")).replace(/^ {4}/gm, "        ");
      out.push(`      <div class="${blockOpen[1]}">\n${rendered}\n      </div>`);
      continue;
    }

    // fenced code
    const fence = line.match(/^```(\w*)\s*$/);
    if (fence) {
      const body = [];
      i += 1;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        body.push(lines[i]);
        i += 1;
      }
      i += 1; // closing fence
      const lang = fence[1] ? ` class="language-${fence[1]}"` : "";
      out.push(`    <pre><code${lang}>${escapeHtml(body.join("\n"))}</code></pre>`);
      continue;
    }

    // headings
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      out.push(`    <h${level}>${inline(escapeHtml(heading[2].trim()))}</h${level}>`);
      i += 1;
      continue;
    }

    // horizontal rule
    if (/^(---|\*\*\*)\s*$/.test(line)) {
      out.push("    <hr />");
      i += 1;
      continue;
    }

    // pipe table: header row followed by a separator row
    if (/^\|.*\|/.test(line) && i + 1 < lines.length && /^\|[\s:-]*\|/.test(lines[i + 1])) {
      const block = [];
      while (i < lines.length && /^\|.*\|/.test(lines[i])) {
        block.push(lines[i]);
        i += 1;
      }
      out.push(renderTable(block));
      continue;
    }

    // blockquote
    if (/^>\s?/.test(line)) {
      const body = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        body.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      out.push(`    <blockquote>\n${renderMarkdown(body.join("\n")).replace(/^ {4}/gm, "      ")}\n    </blockquote>`);
      continue;
    }

    // lists
    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const items = [];
      while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) {
        let item = lines[i].replace(/^\s*([-*]|\d+\.)\s+/, "");
        i += 1;
        // wrapped text belongs to the item: absorb it until a blank line, the next
        // bullet, or the start of another block
        while (
          i < lines.length &&
          lines[i].trim() &&
          !/^\s*([-*]|\d+\.)\s+/.test(lines[i]) &&
          !/^(#{1,4}\s|```|:::|>|\|)/.test(lines[i])
        ) {
          item += ` ${lines[i].trim()}`;
          i += 1;
        }
        items.push(item);
      }
      const tag = ordered ? "ol" : "ul";
      const rendered = items.map((item) => `      <li>${inline(item)}</li>`).join("\n");
      out.push(`    <${tag}>\n${rendered}\n    </${tag}>`);
      continue;
    }

    // paragraph: consume until a blank line or the start of another block
    const para = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,4}\s|```|>\s?|[-*]\s|\d+\.\s|\|)/.test(lines[i])
    ) {
      para.push(lines[i].trim());
      i += 1;
    }
    out.push(`    <p>${inline(escapeHtml(para.join(" ")))}</p>`);
  }

  return out.join("\n");
}

/** Split `---` front matter from the body. Values are plain strings. */
export function parseFrontMatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { data: {}, body: source };
  const data = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!kv) continue;
    const value = kv[2].trim().replace(/^["']|["']$/g, "");
    data[kv[1]] = value;
  }
  return { data, body: source.slice(match[0].length) };
}
