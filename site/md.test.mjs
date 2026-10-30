import { test } from "node:test";
import assert from "node:assert/strict";
import { inline, parseFrontMatter, renderMarkdown } from "./md.mjs";

test("md: headings, paragraphs and rules", () => {
  const html = renderMarkdown("# Title\n\nA paragraph\nover two lines.\n\n---\n");
  assert.match(html, /<h1>Title<\/h1>/);
  assert.match(html, /<p>A paragraph over two lines\.<\/p>/);
  assert.match(html, /<hr \/>/);
});

test("md: fenced code is escaped and keeps its newlines", () => {
  const html = renderMarkdown("```js\nconst x = 1 < 2;\n```\n");
  assert.match(html, /<pre><code class="language-js">/);
  assert.match(html, /1 &lt; 2/);
  assert.doesNotMatch(html, /1 < 2/);
});

test("md: inline code, links and emphasis", () => {
  assert.equal(inline("use `npm test` here"), "use <code>npm test</code> here");
  assert.equal(inline("[the repo](https://example.com)"), '<a href="https://example.com" rel="noopener" target="_blank">the repo</a>');
  assert.equal(inline("[about](/about.html)"), '<a href="/about.html">about</a>');
  assert.equal(inline("**bold** and _soft_"), "<strong>bold</strong> and <em>soft</em>");
});

test("md: html in content is escaped, not executed", () => {
  const html = renderMarkdown('Hello <script>alert("x")</script> <img src=x onerror=1>\n');
  // Nothing is emitted as a tag; the payload survives only as visible text.
  assert.doesNotMatch(html, /<script>/);
  assert.doesNotMatch(html, /<img\s+src=x/i);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /&lt;img src=x onerror=1&gt;/);
});

test("md: lists, ordered and unordered", () => {
  const html = renderMarkdown("- one\n- two\n\n1. first\n2. second\n");
  assert.match(html, /<ul>\n {6}<li>one<\/li>\n {6}<li>two<\/li>\n {4}<\/ul>/);
  assert.match(html, /<ol>\n {6}<li>first<\/li>/);
});

test("md: pipe tables render headers and body cells", () => {
  const html = renderMarkdown("| a | b |\n| --- | --- |\n| 1 | 2 |\n");
  assert.match(html, /<th scope="col">a<\/th>/);
  assert.match(html, /<td>1<\/td>/);
  assert.match(html, /<table>/);
});

test("md: blockquotes nest their content", () => {
  const html = renderMarkdown("> quoted **text**\n");
  assert.match(html, /<blockquote>[\s\S]*<p>quoted <strong>text<\/strong><\/p>[\s\S]*<\/blockquote>/);
});

test("md: front matter is split from the body, and absent front matter is tolerated", () => {
  const { data, body } = parseFrontMatter('---\ntitle: "Hello"\ndate: 2026-10-30\n---\nBody here\n');
  assert.equal(data.title, "Hello");
  assert.equal(data.date, "2026-10-30");
  assert.equal(body.trim(), "Body here");

  const plain = parseFrontMatter("Just text\n");
  assert.deepEqual(plain.data, {});
  assert.equal(plain.body, "Just text\n");
});

test("md: wrapped bullet text stays inside its item", () => {
  const html = renderMarkdown("- first line\n  continues here\n- second\n");
  assert.match(html, /<li>first line continues here<\/li>/);
  assert.match(html, /<li>second<\/li>/);
  assert.equal((html.match(/<p>/g) ?? []).length, 0, "no stray paragraph from the wrap");
});

test("md: ::: blocks nest, and a stray close marker never becomes a paragraph", () => {
  const html = renderMarkdown(":::hero\n# Title\n\n:::inner\ntext\n:::\n:::\n");
  assert.match(html, /<div class="hero">/);
  assert.match(html, /<div class="inner">/);
  assert.equal((html.match(/:::/g) ?? []).length, 0, "no markers leak into the output");
  assert.match(html, /<p>text<\/p>/);
});

test("md: an empty document renders nothing, not a stray paragraph", () => {
  assert.equal(renderMarkdown("").trim(), "");
  assert.equal(renderMarkdown("\n\n\n").trim(), "");
});
