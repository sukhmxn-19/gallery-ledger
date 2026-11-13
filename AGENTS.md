# AGENTS.md

Read this file fully before every task. Then read `docs/PRD.md` for what to build.

## 1. Project

A college project (CSE326, 1st semester, LPU): an **art gallery exhibition management** website. Two first-semester students built it and must **explain every line of it to an examiner**. The code must therefore look like a good student wrote it: plain, small, obvious.

## 2. The stack (hard limits)

Allowed: HTML5, CSS3, plain JavaScript in the browser, `localStorage`.

Forbidden, no exceptions, even if it seems helpful:
- Frameworks or libraries: React, Vue, Angular, jQuery, Bootstrap, Tailwind, Alpine, anything similar
- npm, package.json, node_modules, bundlers, build steps, TypeScript, Sass
- CDNs, Google Fonts, Font Awesome, external images, any network request
- `fetch`, `XMLHttpRequest`, `async/await`, Promises, `setTimeout` tricks
- ES modules (`import` / `export`, `type="module"`), classes, generators, `Proxy`, `eval`
- Web Components, Service Workers, IndexedDB, frameworks disguised as helper code
- Writing your own mini-framework (no virtual DOM, no template engine, no state manager, no router)

The site must run by double-clicking `index.html`.

If a task seems to need something forbidden, **stop and ask**. Do not work around it.

## 3. JavaScript style (examiner-friendly)

Use: `const`, `let`, functions (`function name() {}`), `if/else`, `for` loops, `forEach`, `filter`, `find`, `map`, `sort`, template literals, `document.getElementById`, `querySelector`, `addEventListener`, `localStorage`, `JSON.parse/stringify`, `URLSearchParams`, `Date`, `toLocaleString`.

Avoid: `reduce`, destructuring, spread/rest, optional chaining (`?.`), nullish `??`, ternary chains, one-line cleverness, chained array methods longer than two calls, regex unless essential.

Rules:
1. One function does one thing. Maximum 30 lines per function, 200 lines per file.
2. Names are full English words: `findArtistById`, not `getA` or `fnX`.
3. Above every function, one comment in plain English saying **what it does and why**. No comments that restate the code.
4. Every page file follows this order: grab elements, small helper functions, render functions, event handlers, then a start-up call at the bottom.
5. No global variables except the page's few element references and the `data` object returned by `loadData()`. Shared helpers live in `storage.js` and `ui.js` as plain top-level functions.
6. Never write user text into `innerHTML` directly. Use `textContent`, or pass it through `escapeHtml()` from `ui.js`. Keep a comment where this matters.
7. Business rules (PRD section 6) live **only** in `storage.js`. Page files call them and display the returned message. A rule function returns `''` (empty string) when OK, or the error message text.
8. Do not duplicate logic. If two pages need it, it goes in `storage.js` or `ui.js`.
9. No dead code, no commented-out code, no TODOs left behind, no `console.log` left behind.

## 3. HTML and CSS style

HTML: semantic elements, every input has a `<label for>`, one `<h1>` per page, no inline `style=""`, no inline `onclick=""` (use `addEventListener`), no div soup.

CSS: one file, `css/style.css`. All colours, fonts and spacings come from variables declared in `:root`. Class names are short and plain (`.field`, `.label-card`, `.row-actions`), no BEM, no utility-class systems. Use flexbox or grid, no floats, no `!important`. Media queries only for the narrow layout (max-width 700px) and print.

## 4. Design rules (read twice)

The design must feel like a printed gallery guide. Follow PRD section 8 exactly. Summary:

- Palette: paper `#f4f1ea`, ink `#1c1b19`, muted `#6b675e`, line `#cfc9bb`, accent `#8c2f1b`. Nothing else.
- No gradients. No shadows. No blue. No purple. No glass effects. No pill badges. No rounded cards (2px radius at most). No emojis. No icons. No hero sections. No animations or transitions.
- No marketing copy. Never write "Welcome", "Seamless", "Powerful", "Effortlessly", "Streamline", or exclamation marks.
- Georgia for text, system monospace for labels and numbers. No web fonts.
- Every element must earn its place. If it does not show data, take an action, or help navigation, delete it.
- Empty states are one plain sentence plus one link.

If your first instinct is "modern", "sleek" or "clean SaaS", that is the wrong instinct. Think museum wall label, ledger book, exhibition catalogue.

## 5. Data and architecture

- All data is one object saved in `localStorage` under `galleryData`. Shape is defined in PRD section 5. Do not change field names.
- `storage.js` owns: `loadData`, `saveData`, id generation, finders, add/update/delete helpers, overlap check, exhibition status, and every business rule.
- `ui.js` owns: drawing the top nav, active link, message line, `escapeHtml`, price and date formatting, reading `?id=` from the URL.
- Page files own only that page's rendering and events.
- Links between pages use query strings: `exhibition.html?id=3`. Read with `URLSearchParams`.
- Each form is both add and edit. Use a hidden input holding the id (empty means add).

## 6. Workflow rules

1. **Work one phase at a time.** The person gives you one phase prompt. Do only that. Do not start the next phase, do not "also improve" other files.
2. **Plan first.** Before writing code, post a short plan: files you will create or change, and functions you will write. Then build.
3. **Touch only the files the phase lists.** If you must change another file, say why before doing it.
4. **Ask when unsure.** Ambiguity in the PRD, a missing rule, a conflict between PRD and this file: ask one clear question and stop. Do not guess and continue.
5. **Do not invent features.** Anything not in the PRD is out of scope.
6. **Verify before saying done.** Open the page in the browser tool (or reason through it if unavailable), check the console is clean, run the phase's checklist, and report what you checked and what you could not check.
7. **Update `docs/EXPLAIN.md` at the end of every phase** (format below). This is required, not optional.
8. **Commit message** you propose at the end: `phase N: short plain description`.
9. Never rewrite working code from an earlier phase for style reasons.
10. If you find a bug in an earlier phase, report it and fix it in the smallest possible change.

## 7. `docs/EXPLAIN.md` format

Append a section per phase. Keep it short and in simple English a student can say aloud.

```
## Phase N: name
Files: list
### filename.js
Purpose: one sentence.
- functionName(): what it does, in one line. Called from: where.
Viva questions this file may raise:
- question, then a one-line answer
```

Also keep a "How the pages connect" section at the top that traces one full flow: add artist, add artwork, create exhibition, place artwork, open catalogue, and which function runs at each step.

## 8. Definition of done (every phase)

- Works from `file://` in Chrome with a clean console.
- Follows sections 2, 3 and 4 of this file.
- No function over 30 lines, no file over 200 lines.
- Business rules produce the PRD messages word for word.
- Data persists across refresh.
- `docs/EXPLAIN.md` updated.
- Short final report: what was built, what was checked, anything left open.

## 9. Self-check before replying

Ask yourself and fix before answering:
- Did I add any library, font, CDN link, or build file?
- Did I use any syntax from the "avoid" list?
- Is there any gradient, shadow, blue, emoji, or decorative element?
- Could a first-semester student explain every line I wrote?
- Did I do anything outside this phase?
