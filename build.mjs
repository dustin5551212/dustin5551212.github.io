#!/usr/bin/env node
/**
 * Markdown in, HTML out, no dependencies.
 *
 *   content/index.md          → dist/index.html
 *   content/about.md          → dist/about.html
 *   content/work/<slug>.md    → dist/work/<slug>.html
 *   content/writing/<slug>.md → dist/writing/<slug>.html  (+ a generated index)
 *
 * The build also checks that every internal link it emits points at a file it wrote,
 * so a renamed page cannot quietly ship a dead link.
 */
import { mkdir, readFile, readdir, rm, writeFile, cp } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseFrontMatter, renderMarkdown } from "./site/md.mjs";
import { page } from "./site/layout.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(root, "content");
const distDir = path.join(root, "dist");

const readingTime = (text) =>
  Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 220));

const escape = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

async function loadOne(file) {
  const raw = await readFile(file, "utf8");
  const { data, body } = parseFrontMatter(raw);
  return { ...data, body, file, slug: path.basename(file, ".md") };
}

/** Date shown as "October 2026" — no false precision, no timezone questions. */
function monthYear(date) {
  if (!date) return "";
  const [y, m] = date.split("-");
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${months[Number(m) - 1] ?? ""} ${y}`.trim();
}

async function main() {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });

  const written = [];
  const write = async (rel, html) => {
    const out = path.join(distDir, rel);
    await mkdir(path.dirname(out), { recursive: true });
    await writeFile(out, html);
    written.push(rel);
  };

  // pages that sit at the root
  for (const [file, rel] of [
    ["index.md", "index.html"],
    ["about.md", "about.html"],
  ]) {
    const doc = await loadOne(path.join(contentDir, file));
    const body = renderMarkdown(doc.body);
    await write(
      rel,
      page({
        title: doc.slug === "index" ? "" : doc.title,
        description: doc.description ?? "",
        path: `/${rel.replace("index.html", "")}`,
        kicker: doc.kicker ?? "",
        wide: doc.wide === "true",
        body,
      }),
    );
  }

  // work and writing, one file per entry
  const posts = [];
  for (const section of ["work", "writing"]) {
    const dir = path.join(contentDir, section);
    if (!existsSync(dir)) continue;
    for (const name of (await readdir(dir)).filter((f) => f.endsWith(".md")).sort()) {
      const doc = await loadOne(path.join(dir, name));
      const rel = `${section}/${doc.slug}.html`;
      const minutes = readingTime(doc.body);
      const meta = [
        doc.role ? `<span>${escape(doc.role)}</span>` : "",
        doc.year ? `<span>${escape(doc.year)}</span>` : "",
        section === "writing" ? `<span>${escape(monthYear(doc.date))}</span>` : "",
        section === "writing" ? `<span>${minutes} min read</span>` : "",
      ]
        .filter(Boolean)
        .join('<span class="dot">·</span>');
      const body =
        `      <h1>${escape(doc.title)}</h1>\n` +
        (meta ? `      <p class="entry-meta mono">${meta}</p>\n` : "") +
        (doc.deck ? `      <p class="deck">${escape(doc.deck)}</p>\n` : "") +
        renderMarkdown(doc.body) +
        '\n      <p class="backlink"><a href="' +
        (section === "writing" ? "/writing/" : "/") +
        '">← All ' +
        section +
        "</a></p>";
      await write(
        rel,
        page({
          title: doc.title,
          description: doc.description ?? "",
          path: `/${rel}`,
          body,
        }),
      );
      if (section === "writing") posts.push({ ...doc, rel, minutes });
    }
  }

  // generated writing index
  posts.sort((a, b) => String(b.date ?? "").localeCompare(String(a.date ?? "")));
  const list = posts
    .map(
      (post) => `      <article class="post-row">
        <p class="mono post-row__date">${escape(monthYear(post.date))}</p>
        <h2><a href="/${post.rel}">${escape(post.title)}</a></h2>
        <p>${escape(post.deck ?? "")}</p>
      </article>`,
    )
    .join("\n");
  await write(
    "writing/index.html",
    page({
      title: "Writing",
      description: "Notes on measuring things that are easy to measure wrongly.",
      path: "/writing/",
      body: `      <section class="lede">
        <h1>Writing</h1>
        <p>One post per project, leading with the measurement rather than the stack — including
        the ones where the first measurement was wrong.</p>
      </section>
${list}`,
    }),
  );

  // static bits
  await cp(path.join(root, "site/styles.css"), path.join(distDir, "styles.css"));
  await cp(path.join(root, "site/assets"), path.join(distDir, "assets"), { recursive: true });

  // every internal link must land on something we actually wrote
  const files = new Set([...written, ...["styles.css", "assets/mark.svg", "assets/table.webp"]]);
  const broken = [];
  for (const rel of written) {
    const html = await readFile(path.join(distDir, rel), "utf8");
    for (const match of html.matchAll(/href="(\/[^"#?]*)"/g)) {
      const target = match[1].replace(/^\//, "");
      const candidate = target === "" ? "index.html" : target.endsWith("/") ? `${target}index.html` : target;
      if (!files.has(candidate)) broken.push(`${rel} → ${match[1]}`);
    }
  }

  console.log(`${written.length} pages → dist/`);
  if (broken.length) {
    console.error("Broken internal links:");
    for (const line of new Set(broken)) console.error(`  ${line}`);
    process.exitCode = 1;
  } else {
    console.log("links: all internal targets exist");
  }
}

await main();
