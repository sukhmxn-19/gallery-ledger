# AGENTS.md

Read this file fully before every task. Then read `docs/PRD.md` for what to build.

## 1. Project

A college project (CSE326, 1st semester, LPU): an **art gallery exhibition management platform** connecting artists, artworks, exhibition periods, gallery spaces, and artwork assignments.

The platform is structured into two clearly separated experiences sharing one unified `localStorage` repository:
- **A. Visitor Experience (Default, Public, Read-Only):** A warm, expressive, highly presentable contemporary art gallery website (`index.html`) featuring an editorial hero ("Art has a place here."), current and upcoming exhibition showcases, curated collection grids, living artist spotlights, architectural space cards, and an engaging curatorial story. Free from administrative buttons, management forms, or inventory controls.
- **B. Organiser Workspace (Curatorial Studio):** A dedicated administrative workspace (`dashboard.html`, `artists.html`, `artworks.html`, `spaces.html`, `exhibitions.html`, `exhibition.html`, `catalogue.html`) providing curatorial tools for registering artists, managing artwork records, scheduling exhibitions, allocating spaces with capacity enforcement, validating placements, and generating printable exhibition catalogues.

Two first-semester students built it and must **explain every line of it to an examiner**. The code must therefore look like a good student wrote it: plain, small, obvious, and human-crafted without AI template slop.

## 2. Honest Access-Control Design & Publishing Workflow

Because this is strictly a static frontend project running locally or on GitHub Pages, genuine server-side authentication is not available.
- **No Fake Security:** Never implement fake password prompts, hidden URL tricks, or claim client-side code provides security.
- **Read-Only Public Default:** The public website displays exhibition outcomes without editing clutter.
- **Separate Organiser Entry Point:** A clearly marked "Curatorial Studio" / "Organiser Workspace" link in the navigation provides access to operational tools.
- **Local Browser Persistence:** All organiser edits are saved directly into the current browser's `localStorage` (`galleryData`).
- **Static Publishing Workflow:**
  Organiser edits locally in browser &rarr; validates collection &rarr; exports updated data &rarr; repository maintainer updates demonstration data (`js/demo-data.js`) &rarr; published to GitHub Pages &rarr; public visitors see the updated collection.

## 3. The stack (hard limits)

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

## 4. JavaScript style (examiner-friendly)

Use: `const`, `let`, functions (`function name() {}`), `if/else`, `for` loops, `forEach`, `filter`, `find`, `map`, `sort`, template literals, `document.getElementById`, `querySelector`, `addEventListener`, `localStorage`, `JSON.parse/stringify`, `URLSearchParams`, `Date`, `toLocaleString`.

Avoid: `reduce`, destructuring, spread/rest, optional chaining (`?.`), nullish `??`, ternary chains, one-line cleverness, chained array methods longer than two calls, regex unless essential.

Rules:
1. One function does one thing. Maximum 30 lines per function, 200 lines per file.
2. Names are full English words: `findArtistById`, not `getA` or `fnX`.
3. Above every function, one comment in plain English saying **what it does and why**. No comments that restate the code.
4. Every page file follows this order: grab elements, small helper functions, render functions, event handlers, then a start-up call at the bottom.
5. No global variables except the page's few element references and the `data` object returned by `loadData()`. Shared helpers live in `storage.js` and `ui.js` as plain top-level functions.
6. Never write user text into `innerHTML` directly. Use `textContent`, or pass it through `escapeHtml()` from `ui.js`.
7. Business rules (PRD section 6) live **only** in `storage.js`. Page files call them and display the returned message. A rule function returns `''` (empty string) when OK, or the error message text.
8. Do not duplicate logic. If two pages need it, it goes in `storage.js` or `ui.js`.
9. No dead code, no commented-out code, no TODOs left behind, no `console.log` left behind.

## 5. Design rules (warm contemporary gallery aesthetic)

The design feels like an inviting, tactile contemporary art gallery and museum archive: warm, human-centered, expressive, and architectural.

- **Warm Palette:** Archival cream (`#fcf9f2`), cotton surface white (`#ffffff`), linen matting (`#f6efe3`), warm inset well (`#ede5d5`), deep carbon ink (`#1e1d1a`), warm charcoal body (`#4a463e`), muted graphite (`#7c776e`), warm border hairlines (`#eae3d5` / `#d6cebe`), with curated accents: rich Florentine terracotta (`#c44b33`) for live shows and primary actions, antique ochre (`#b57418`) for upcoming and reserved states, sage olive (`#3d6842`) for available works, and archival slate (`#5d6773`) for closed exhibitions.
- **Welcoming Editorial Hero:** Asymmetrical composition, warm serif typography ("Art has a place here."), concise human-centered introduction, primary action ("Explore Exhibitions") and secondary action ("Discover the Collection"). No dominant admin button.
- **Gallery Imagery & Visual Plates:** Bundled local SVG illustrations stored in `img/`. Zero external network calls.
- **Presentation & Framing:** Visual exhibition feature cards with dates and placement summaries, artwork showcase grids with dimensions and medium tags, personable artist spotlights, and architectural room cards highlighting natural light and physical atmosphere.
- **Animation System:** Restrained CSS transitions and vanilla JavaScript reveals: deliberate entrance reveal sequence, scroll reveals using `IntersectionObserver`, artwork image zoom (`scale(1.025)`), subtle card lift, and mobile navigation. Must strictly respect `@media (prefers-reduced-motion: reduce)`.
- **Navigation Architecture:** Clear gallery branding with responsive navigation (Home, Exhibitions, Artworks, Artists, Spaces), plus a clearly segregated entry point to the Curatorial Studio (`dashboard.html`).
- **Typography:** High-contrast editorial serif (`Playfair Display`, `Didot`, `Georgia`, serif) for display titles and placards. Literary reading serif (`Charter`, `Palatino`, `Georgia`, serif) for body copy. Tabular monospace (`ui-monospace`, `Cascadia Code`, `Menlo`, `Consolas`, monospace) for dates, currency, and metadata. No external web fonts.
- **Forbidden AI Slop:** Generic blue-purple gradients, glowing orbs, decorative blobs, glassmorphism, vague marketing buzzwords, fake statistics, floating badges, and SaaS dashboard templates.

## 6. Data and architecture

- All data is one object saved in `localStorage` under `galleryData`. Shape is defined in PRD section 5. Do not change field names.
- `storage.js` owns: `loadData`, `saveData`, id generation, finders, add/update/delete helpers, overlap check, exhibition status, and every business rule.
- `ui.js` owns: drawing the top nav, active link, message line, `escapeHtml`, price and date formatting, reading `?id=` from the URL.
- Page files own only that page's rendering and events.
- Links between pages use query strings: `exhibition.html?id=3`. Read with `URLSearchParams`.
- Each form is both add and edit. Use a hidden input holding the id (empty means add).

## 7. Definition of done (every phase)

- Works from `file://` in Chrome with a clean console.
- Follows sections 2, 3, 4 and 5 of this file.
- No function over 30 lines, no file over 200 lines.
- Business rules produce the PRD messages word for word.
- Data persists across refresh.
- `docs/EXPLAIN.md` updated.
- Short final report: what was built, what was checked, desktop & mobile verified.
