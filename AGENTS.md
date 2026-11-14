# AGENTS.md

Read this file fully before every task. Then read `docs/PRD.md` for what to build.

## 1. Project

A college project (CSE326, 1st semester, LPU): an **art gallery exhibition management platform** connecting artists, artworks, exhibition periods, gallery spaces, and artwork assignments.

The platform is structured into two connected layers sharing one unified `localStorage` repository:
- **A. The Gallery Experience:** The public-facing art gallery website (`index.html`) featuring an editorial hero section, seasonal exhibition showcases, curated artwork grids, artist spotlights, architectural gallery space cards, and an interactive methodology guide.
- **B. The Management Workspace:** The staff curatorial office (`dashboard.html`, `artists.html`, `artworks.html`, `spaces.html`, `exhibitions.html`, `exhibition.html`, `catalogue.html`) providing administration tools for registering artists, managing artwork records, scheduling exhibitions, allocating spaces, validating placements, and generating printable exhibition catalogues.

Two first-semester students built it and must **explain every line of it to an examiner**. The code must therefore look like a good student wrote it: plain, small, obvious, and human-crafted without AI template slop.

## 2. The stack (hard limits)

Allowed: HTML5, CSS3, plain JavaScript in the browser, `localStorage`, local SVG/image assets.

Forbidden, no exceptions, even if it seems helpful:
- Frameworks or libraries: React, Vue, Angular, jQuery, Bootstrap, Tailwind, Alpine, anything similar
- npm, package.json, node_modules, bundlers, build steps, TypeScript, Sass
- CDNs, Google Fonts, Font Awesome, external images, any network request
- `fetch`, `XMLHttpRequest`, `async/await`, Promises, `setTimeout` tricks
- ES modules (`import` / `export`, `type="module"`), classes, generators, `Proxy`, `eval`
- Web Components, Service Workers, IndexedDB, frameworks disguised as helper code
- Writing your own mini-framework (no virtual DOM, no template engine, no state manager, no router)

The site must run by double-clicking `index.html` directly from the local file system.

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

## 4. Design rules (curatorial editorial aesthetic)

The design must feel like a living contemporary art gallery and museum archive: elegant, tactile, deeply architectural, and expressive, while remaining 100% vanilla and examiner-friendly.

- **Palette:** Archival vellum (`#f8f6f0`), surface white (`#ffffff`), linen matting (`#f2eee5`), carbon ink (`#181715`), muted graphite (`#787367`), border hairlines (`#d4ccbd`), with curated gallery accents: Florentine vermilion (`#9e2a1b`) for live shows and sold works, antique ochre (`#b37418`) for upcoming and reserved states, sage olive (`#386641`) for available works and healthy capacity, and archival slate (`#5c6773`) for closed exhibitions.
- **Hero & Editorial Sections:** Large asymmetrical editorial heroes with strong typography, curated gallery imagery, meaningful headlines ("Where art finds its place"), and dual actions (Explore Exhibitions vs. Manage Collection).
- **Gallery Imagery & Visual Assets:** Permitted and encouraged via bundled, local SVG files and illustrative artwork plates stored in `img/`. Zero external network calls.
- **Card Grids & Presentation:** Visual exhibition feature cards with dates and space meters, curated artwork showcase grids with dimensions and medium tags, artist dossier spotlights, and architectural room cards.
- **Depth & Framing:** Layered optical micro-shadows for tactile paper depth and card elevation. Double hairlines and matting borders evoke physical gallery framing.
- **Motion & Microinteractions:** Intentional, restrained CSS transitions (0.15s–0.25s) for hover states, card elevation, focus feedback, and smooth occupancy meter growth. Subtle page-entry reveals allowed. Must strictly respect `@media (prefers-reduced-motion: reduce)`.
- **Navigation Architecture:** Distinctive gallery branding with desktop and mobile responsive navigation covering Home, Exhibitions, Artists, Artworks, and Spaces, plus a clearly segregated curatorial button to enter the Management Workspace (`dashboard.html`).
- **Typography:** High-contrast editorial serif (`Playfair Display`, `Didot`, `Georgia`, serif) for display titles and placards. Reading serif (`Charter`, `Palatino`, `Georgia`, serif) for body copy. Tabular monospace (`ui-monospace`, `Cascadia Code`, `Menlo`, `Consolas`, monospace) for dates, currency, catalog numbers, and metadata. No web fonts or external network font downloads.
- **Forbidden AI Slop:** Generic blue-purple gradients, glowing orbs, blob illustrations, glassmorphism, vague marketing slogans, fake statistics, floating badges, and SaaS/finance dashboard templates.

## 5. Data and architecture

- All data is one object saved in `localStorage` under `galleryData`. Shape is defined in PRD section 5. Do not change field names.
- `storage.js` owns: `loadData`, `saveData`, id generation, finders, add/update/delete helpers, overlap check, exhibition status, and every business rule.
- `ui.js` owns: drawing the top nav, active link, message line, `escapeHtml`, price and date formatting, reading `?id=` from the URL.
- Page files own only that page's rendering and events.
- Links between pages use query strings: `exhibition.html?id=3`. Read with `URLSearchParams`.
- Each form is both add and edit. Use a hidden input holding the id (empty means add).

## 6. Workflow rules

1. **Work intentionally.** Focus on delivering the current milestone cleanly with robust verification.
2. **Plan first.** Before writing code, verify requirements, plan the files to create or modify, and the functions to write.
3. **Preserve data integrity.** Never alter the underlying `galleryData` schema or business rule logic.
4. **Zero network calls.** All assets (SVGs, scripts, styles) must be completely local and load from `file://`.
5. **Verify before saying done.** Test in browser, verify layout across desktop and mobile widths, check console is clean, and ensure data persists across refreshes.
6. **Update `docs/EXPLAIN.md`** at the completion of each implementation milestone.


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
- Is there any external network dependency, marketing buzzword, or unexplainable code?
- Could a first-semester student explain every line I wrote?
- Does every file stay under 200 lines and every function under 30 lines?
