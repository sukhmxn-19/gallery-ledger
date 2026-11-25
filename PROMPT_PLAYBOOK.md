# Prompt Playbook: Gallery Ledger (CSE326 CA1)

For you only. Not for Antigravity. Copy each prompt in order.

---

## 0. Before you start

**Check these with your teammate**
- The portal says "group of 3 members" but the sheet lists two rows for your project (29, 30). Ask Jagdeep Singh sir whether a third member is expected. If yes, give them one phase below.
- Submission deadline on the portal: **27 Nov 2026**. Today is 13 Nov. Plan below leaves 2 days of buffer.
- The brief asks for: functional solution, proper UI, GitHub repository, online deployment, and every member must explain their own contribution. This playbook covers all four.

**One-time setup (10 minutes)**
1. Make a folder `gallery-ledger`. Inside it, create `docs/`.
2. Put `AGENTS.md` in the root. Put `PRD.md` in `docs/`.
3. Run `git init`, then make the first commit. Make a GitHub repo and push. **Add your teammate as a collaborator** now.
4. Open the folder in Antigravity.
5. Use a **fresh conversation for every phase**. Use Planning mode so it shows a plan first. Read the plan before saying go.
6. After each phase: open the page, click everything, read the diff, then commit. Do not stack phases without testing.

**Who commits what (suggested)**
Alternate phases so both of you have real commits and real code to explain.

| Phase | Owner |
|---|---|
| 0 Scaffold, 1 Data layer, 2 Styles | Sukhmanpreet |
| 3 Artists, 4 Spaces | Sonam |
| 5 Artworks, 6 Exhibitions | Sukhmanpreet |
| 7 Placements, 8 Catalogue | Sonam |
| 9 Dashboard + sample data | Sukhmanpreet |
| 10 QA, 11 Viva prep, 12 Deploy | Both |

Each owner runs the phase on their own laptop, commits with their own git identity, and pushes. Whoever owns a phase must be able to explain it in full. Swap and read each other's phases too, because the examiner may ask either of you about anything.

**Timeline**
| Dates | Phases |
|---|---|
| 13 to 14 Nov | 0, 1, 2 |
| 15 to 17 Nov | 3, 4, 5 |
| 18 to 20 Nov | 6, 7 |
| 21 to 22 Nov | 8, 9 |
| 23 to 24 Nov | 10, 11 |
| 25 Nov | 12 deploy |
| 26 Nov | buffer |
| 27 Nov | submit |

---

## 1. Master prompt (initiator)

Run this once, first, in its own conversation. It makes the agent read everything and confirm understanding. It builds nothing.

```text
You are working on a college project. Before doing anything, read these two files completely: AGENTS.md in the project root, and docs/PRD.md.

Then reply with:
1. The project in two sentences, in your own words.
2. The five hardest rules from AGENTS.md that you must never break.
3. The data model as a list of the five record types and how they link.
4. The list of fifteen business rules as a one-line summary each.
5. The eight pages and the one-line purpose of each.
6. Any contradiction, gap, or ambiguity you found between AGENTS.md and PRD.md. If none, say "none found".
7. The plan you would follow: the phases in order, one line each.

Do not write any code or create any files in this step. Do not start any phase. Wait for me to give you a phase prompt. For all future conversations in this project, treat AGENTS.md and docs/PRD.md as binding.
```

Read answer 6 carefully. If it found a real gap, fix the PRD yourself before moving on.

---

## 2. Phase prompts

Each begins with the same short anchor so a fresh conversation stays on rails.

### Phase 0: Scaffold

```text
Read AGENTS.md and docs/PRD.md first. Follow them strictly.

PHASE 0: Project scaffold.

Create the folder structure from PRD section 9: the eight HTML pages, css/style.css, all the JS files listed, and README.md. Do not create docs/EXPLAIN.md content yet beyond its first heading.

Each HTML page must contain only:
- a valid HTML5 skeleton with lang="en", charset, viewport meta, and a meaningful <title>
- <header> containing <nav id="nav"></nav>
- <main> with a single <h1> naming the page, and nothing else
- script tags at the end of body in this order: storage.js, ui.js, then the page's own JS file
- the link to css/style.css in the head

JS files should exist but be empty except for a one-line comment saying what the file will do.
README.md: project name, course, team, how to run (open index.html), and a one-line stack statement. Nothing else.

Do not write any styling or logic. Do not add anything not listed.

Before coding, post your plan. After, run the Definition of Done in AGENTS.md section 8, create docs/EXPLAIN.md with the "How the pages connect" heading and an empty Phase 0 entry, and give me a commit message.
```

Check: every page opens, the tab title is right, no console errors.

### Phase 1: Data layer and shared helpers

```text
Read AGENTS.md and docs/PRD.md first. Follow them strictly.

PHASE 1: Data layer (js/storage.js) and shared helpers (js/ui.js). Touch only these two files, plus docs/EXPLAIN.md.

storage.js must contain:
- loadData(): reads localStorage key galleryData, returns the object, or a fresh empty structure from PRD section 5 if nothing is stored or the JSON is broken.
- saveData(data)
- getNextId(data): returns data.nextId and increments it.
- finder functions: findArtistById, findArtworkById, findSpaceById, findExhibitionById.
- helpers: getPlacementsForExhibition, getPlacementsForArtwork, getPlacementsForSpace, getArtworksForArtist.
- datesOverlap(startA, endA, startB, endB).
- getExhibitionStatus(exhibition): returns 'Upcoming', 'On now' or 'Closed' by comparing with today's date formatted as YYYY-MM-DD in local time (not UTC).
- ALL fifteen business rules BR1 to BR15 from PRD section 6, as separate validation functions. Each returns '' when OK or the exact message from the PRD. Name them clearly, e.g. checkArtistName(data, name, ignoreId), checkPlacement(data, exhibitionId, artworkId, spaceId), checkExhibitionDates(data, exhibition), canDeleteArtist, canDeleteArtwork, canDeleteSpace, canMarkSold. Where a rule needs a title or space name in the message, build it exactly as in the PRD.

ui.js must contain:
- renderNav(activePage): fills <nav id="nav"> with the site name and links to Dashboard, Artists, Artworks, Spaces, Exhibitions; the current page's link is marked with class "active". Called by each page.
- escapeHtml(text)
- formatPrice(number): rupee sign and Indian grouping using toLocaleString('en-IN').
- formatDate(yyyymmdd): e.g. "14 Nov 2026".
- getIdFromUrl(): reads ?id= with URLSearchParams, returns a number or 0.
- showMessage(text, isError): writes into an element with id "message" if it exists.

Do not touch HTML or CSS. Do not build any page logic.

To verify without a UI: add a temporary test by running the functions from the browser console, report the results of at least 10 checks (including an overlap check and a status check), then REMOVE any test code from the files.

Post a plan before coding. End with the EXPLAIN.md entry and a commit message.
```

Check yourself: open `index.html`, open the console, type `loadData()`. Try `datesOverlap('2026-11-01','2026-11-10','2026-11-10','2026-11-20')`. It should be `true` (touching end dates overlap).

### Phase 2: Design system (CSS)

```text
Read AGENTS.md and docs/PRD.md first. Follow them strictly, especially the design rules in AGENTS.md section 4 and PRD section 8.

PHASE 2: Stylesheet. Touch only css/style.css and, if needed, the HTML pages' structure to attach the classes (no content changes).

Write css/style.css with:
1. :root variables: the five colours, the two font stacks, the spacing scale 4, 8, 16, 24, 40.
2. Base: body, headings, links, paragraphs, hr. Paper background, ink text, Georgia.
3. Top bar: site name left, nav right, hairline beneath, active link underlined in the accent colour.
4. Layout: main max-width 1000px centred. A two-column class (.split) with a 320px form column and a flexible table column, stacking below 700px.
5. Forms: .field (label above input), inputs, selects, textareas, focus style with a 2px ink outline, a .message line, error text in accent.
6. Buttons: primary (accent fill), secondary (outline), delete (accent text, no fill).
7. Tables: hairline row separators, monospace uppercase small headers, right-aligned number cells (.num), no zebra.
8. .label-card: the wall label look (bordered box; artist in mono caps; title in italic serif; year, medium, size in muted mono; price last).
9. .count-row for the dashboard counts: four plain figures in a row with mono captions.
10. Print rules in one @media print block: hide header and buttons, black on white, .label-card uses break-inside: avoid.

No gradients, no shadows, no blue, no transitions, no border-radius above 2px, no !important.

Then create a temporary file test-style.html (not linked anywhere) that shows every component above with fake content, so I can see the whole system on one page. Tell me to delete it after I review it. Remove it yourself from the final deliverable list.

Post a plan before coding. End with the EXPLAIN.md entry (explain the variables, the grid, and the print block) and a commit message.
```

Check yourself: look at the test page. Does it feel like a printed guide? Any blue anywhere? Squint at it: it should be mostly paper, black text, hairlines, and one oxblood accent. Delete `test-style.html` before committing.

### Phase 3: Artists and artist profile

```text
Read AGENTS.md and docs/PRD.md first. Follow them strictly.

PHASE 3: Artists. Touch only artists.html, artist.html, js/artists.js, js/artist.js, and docs/EXPLAIN.md. Do not change storage.js or ui.js; if you think a change is needed there, stop and tell me why.

Build PRD sections 7.2 and 7.3 (FR5 to FR11):
- artists.html: the form (hidden id, name, born, nationality, style, bio), the list table, the search box.
- artists.js: render the table with each artist's number of artworks; add and edit through the same form (button text and a Cancel link change in edit mode); search filters as you type; delete with a confirm and BR2; BR1 on name; BR15 validation of required and range checks (born must be a 4-digit year if given, bio max 400 characters). Show messages with showMessage.
- artist.html and artist.js: the profile described in FR9 to FR11, including the not-found state.

All user text must be written safely (textContent or escapeHtml).

Verification: list the manual test steps you ran (add, edit, duplicate name, delete, search, profile link, refresh persistence, invalid id in the URL). Post a plan before coding, then the EXPLAIN.md entry and a commit message.
```

### Phase 4: Spaces

```text
Read AGENTS.md and docs/PRD.md first. Follow them strictly.

PHASE 4: Gallery spaces. Touch only spaces.html, js/spaces.js, and docs/EXPLAIN.md.

Build PRD section 7.5 (FR17 to FR19). Form for name, capacity, note with add and edit in the same form. Table with name, capacity, note, and "In use by". For "In use by", show the title of the On now or Upcoming exhibition that has placements in that space, or "Free". Enforce BR3 (unique name), BR11 (delete block), BR15 (capacity must be an integer 1 to 100).

Note: placements do not exist yet, so for this phase insert two temporary test placements by running code in the browser console to test "In use by" and BR11, then clear them. Do not leave any test data in the code.

Post a plan before coding, then the EXPLAIN.md entry and a commit message.
```

### Phase 5: Artworks

```text
Read AGENTS.md and docs/PRD.md first. Follow them strictly.

PHASE 5: Artwork records. Touch only artworks.html, js/artworks.js, and docs/EXPLAIN.md.

Build PRD section 7.4 (FR12 to FR16):
- Form with hidden id, artist dropdown, title, year, medium, size, price, status dropdown (Available, Reserved, Sold), and buyer. The buyer field is visible only when status is Sold, and is required then.
- If there are no artists, replace the form with one sentence and a link to artists.html.
- Table: title, artist, year, medium, price (formatPrice, right aligned), status; Sold is shown in the accent colour.
- Filters: artist dropdown (with an "All artists" option), status dropdown, title search. All three combine, and the table updates on every change.
- Edit and delete. Enforce BR10 on delete, BR13 when changing status to Sold, BR15 (price must be greater than 0; year, if given, between 1000 and the current year).

Post a plan before coding, then the EXPLAIN.md entry and a commit message.
```

### Phase 6: Exhibitions

```text
Read AGENTS.md and docs/PRD.md first. Follow them strictly.

PHASE 6: Exhibition creation. Touch only exhibitions.html, js/exhibitions.js, and docs/EXPLAIN.md.

Build PRD section 7.6 (FR20 to FR22):
- Form: hidden id, title, theme, description (max 400), start date, end date (type="date").
- Table sorted by start date, newest first: title (links to exhibition.html?id=N), dates, computed status, number of placements.
- Add and edit in the same form. Enforce BR3 (unique title), BR4 (end before start), BR14 when editing dates of an exhibition that already has placements, BR15.
- Delete with a confirm message naming how many placements will go too (BR12). Deleting removes the exhibition and its placements only. It must never delete an artwork or a space.
- Support arriving from exhibition.html with ?id=N to open the form in edit mode (FR27).

Post a plan before coding, then the EXPLAIN.md entry and a commit message.
```

### Phase 7: Artwork assignment (the core)

```text
Read AGENTS.md and docs/PRD.md first. Follow them strictly. This is the most important screen; be extra careful with correctness and keep functions small.

PHASE 7: Exhibition page with artwork placement. Touch only exhibition.html, js/exhibition.js, and docs/EXPLAIN.md. If you need a helper that does not exist in storage.js (for example listing eligible artworks or free spaces), STOP and tell me the function name, its inputs, and the rules it covers; I will approve adding it to storage.js in a separate step.

Build PRD section 7.7 (FR23 to FR27):
- Header: title, theme, dates, status, description, links "Open catalogue" and "Edit exhibition".
- Placement form with an artwork dropdown and a space dropdown, filled only with eligible options as defined in FR24. Space options show remaining room, e.g. "North Hall (2 left)". If a list is empty, disable the button and show one sentence explaining why.
- On submit, run checkPlacement (BR5 to BR9) again; show its message if not empty; otherwise add the placement, save, and redraw.
- Placements grouped by space. Group heading: "Space name, n / capacity". Rows: title, artist, medium, price, status, Remove.
- Remove deletes the placement only.
- Unknown id shows a not-found sentence and a link back.

Manual tests to run and report: place an artwork; try a Sold artwork (should not be listed); create two overlapping exhibitions and prove BR6 and BR7 trigger; fill a space to capacity and prove BR8; remove a placement; refresh.

Post a plan before coding, then the EXPLAIN.md entry and a commit message.
```

If the agent says it needs helpers in `storage.js`, reply:

```text
Approved. Add only those functions to js/storage.js, each under 30 lines, using the same style as the existing rule functions. Do not change any existing function. Then continue Phase 7.
```

### Phase 8: Catalogue

```text
Read AGENTS.md and docs/PRD.md first. Follow them strictly.

PHASE 8: Printable catalogue. Touch only catalogue.html, js/catalogue.js, css/style.css (print block and .label-card only), and docs/EXPLAIN.md.

Build PRD section 7.8 (FR28 to FR31):
- Title, dates, theme, description, then one section per space (sorted by space name), each work shown as a .label-card with a running catalogue number across the document.
- Each card: number, artist in caps, title in italic, year, medium, size, and price, or the word Sold in the accent colour.
- Closing line: number of works, number of artists, total price of works whose status is Available.
- A Print button using window.print(), hidden when printing.
- Empty state sentence and a link back to the exhibition page.

Check with print preview: no nav, no buttons, black on white, labels not split across pages. Report what you saw.

Post a plan before coding, then the EXPLAIN.md entry and a commit message.
```

### Phase 9: Dashboard and sample data

```text
Read AGENTS.md and docs/PRD.md first. Follow them strictly.

PHASE 9: Dashboard and sample data. Touch only index.html, js/dashboard.js, and docs/EXPLAIN.md. Sample data code goes in js/dashboard.js as a function named loadSampleData(); keep it as plain object literals.

Build PRD section 7.1 (FR1 to FR4) and the sample data from PRD section 11:
- Counts row, On now exhibitions with placement counts and a link, Upcoming exhibitions, and per-space usage lines like "North Hall 6 / 8" for each On now exhibition.
- Footer actions: "Load sample data" (only if the store is empty; otherwise show a message saying why not) and "Erase all data" (with confirm).
- Sample dates must be computed from today so that one exhibition is Closed, one is On now, one is Upcoming, whatever day the data is loaded. Create placements for the On now and Upcoming exhibitions that respect every business rule (no overlaps, no sold works, no over-capacity).
- Empty state: one sentence plus a link to add the first artist.

After loading sample data, verify every other page shows sensible content. Post a plan before coding, then the EXPLAIN.md entry and a commit message.
```

### Phase 10: QA and cleanup audit

```text
Read AGENTS.md and docs/PRD.md first.

PHASE 10: Audit. Do not add features. Only report, then fix what I approve.

Step 1, report only (change nothing yet). Check the whole project and list findings in these groups:
A. Stack violations: any library, CDN, font link, external request, module syntax, class, fetch, async, build file.
B. Style violations: functions over 30 lines, files over 200 lines, use of reduce, destructuring, spread, optional chaining, missing function comments, console.log, commented-out code, inline style or onclick, any !important.
C. Design violations: gradients, shadows, blue or purple, emojis, border-radius above 2px, transitions, marketing wording, anything decorative.
D. PRD coverage: go through FR1 to FR31 and BR1 to BR15 one by one and mark each Pass, Fail, or Could not verify, with the reason.
E. Security and robustness: any place where user text reaches innerHTML unescaped; any page that breaks on bad localStorage data or an unknown ?id=.
F. Contradictions between pages, for example the same status computed two different ways.

Give each finding a file and line number. Then wait. I will tell you which to fix.
```

After the report, reply:

```text
Fix findings [list the numbers]. Make the smallest possible change for each. Do not refactor anything else. After fixing, re-run the same check for those items and report Pass or Fail.
```

### Phase 11: Viva preparation

```text
Read AGENTS.md, docs/PRD.md and docs/EXPLAIN.md.

PHASE 11: Viva preparation. Do not change any code.

1. Rewrite docs/EXPLAIN.md so that it starts with a one-page overview: what the project does, the folder map, and the data flow for the main journey (add artist, add artwork, create exhibition, place artwork, open catalogue), naming the exact function that runs at each step.
2. Add a section "Why we chose X" answering, in simple first-semester English: why localStorage, why multiple pages instead of one, why business rules are in storage.js, why dates are stored as text YYYY-MM-DD and still compare correctly, why escapeHtml exists, why status is computed and not stored.
3. Add a section with 40 likely examiner questions, grouped as: HTML, CSS, JavaScript basics, this project's logic, design decisions. Each with a short answer a student can say in about 20 seconds. Include "walk me through this function" style questions that point at specific functions.
4. Add three "what if" modifications an examiner might ask live (for example: add a "location" field to artists; show only Available artworks in the catalogue; change capacity limit), each with the exact files and lines to change.
5. Add a list of the five most complex functions in the project with a line-by-line plain English explanation of each.

Keep the language simple. No jargon the course has not taught.
```

Then do this yourselves: read `EXPLAIN.md` aloud, and test each other with the 40 questions. Ask Antigravity (new chat) to quiz you:

```text
Read docs/EXPLAIN.md and the code. Act as a strict but fair examiner for a first-semester web project. Ask me one question at a time about my project, starting easy and getting harder. Sometimes open a random function and ask me to explain it. After each answer, tell me what was right, what was missing, and the better answer. Do not move on until I say next. I am [Sukhmanpreet / Sonam] and I built [list your phases].
```

### Phase 12: Deploy (GitHub Pages)

Do this by hand, it is quick.
1. Push everything to the `main` branch.
2. On GitHub: Repository, Settings, Pages, Source: "Deploy from a branch", branch `main`, folder `/ (root)`, Save.
3. Wait one to two minutes. Your URL will be `https://<username>.github.io/gallery-ledger/`.
4. Open it in a private window. Click through all eight pages, load sample data, place an artwork, open the catalogue.
5. Put the live URL and the repo URL in `README.md`, commit, push.
6. Submit on the portal: repository link, live link, whatever else the portal asks for.

Because every link in the project is relative (`artists.html`, `css/style.css`), it works under the `/gallery-ledger/` path with no changes. If something breaks only online, the likely cause is a capital letter in a filename (GitHub Pages is case sensitive).

---

## 3. Rescue prompts

Paste these when the agent misbehaves.

**It drifted (added a library, fancy styling, extra features):**
```text
Stop. You violated AGENTS.md. Re-read it now. List exactly which rules you broke in your last change. Then undo those parts and redo the task using only plain HTML, CSS and JavaScript, within the current phase only. Show me the plan before changing files.
```

**The design looks generic or "AI-made":**
```text
This looks like a generic template. Re-read AGENTS.md section 4 and PRD section 8. This site should feel like a printed gallery guide: paper background, ink text, hairlines, monospace labels, one oxblood accent, no cards, no shadows, no badges, no icons, no gradients. List everything in the current page that does not fit that description, then remove or restyle only those things. Do not change logic.
```

**The code is too clever for us to explain:**
```text
Simplify js/[file].js so a first-semester student can explain every line. Replace any reduce, destructuring, spread, optional chaining, ternary chain or chained array calls with plain if statements and for loops. Keep behaviour identical. Keep each function under 30 lines. Add a plain-English comment above each function. Change nothing else.
```

**Something is broken and you do not know why:**
```text
Page [name] shows [what you see]. Open the browser console and report every error exactly. Find the root cause before changing code. Explain the cause in two plain sentences, then make the smallest possible fix. Do not rewrite the file.
```

**It did extra work you did not ask for:**
```text
You changed files outside this phase: [files]. Revert those changes completely. Only the files listed in the phase prompt may be touched. Confirm the revert by listing the final changed files.
```

**You want to understand code before committing:**
```text
Explain js/[file].js to me function by function in simple English, as if I must present it to my teacher tomorrow. For each function say: what it does, what calls it, and one question the teacher might ask. Do not change any code.
```

---

## 4. Your checklist before submission

- [ ] All eight pages work from the GitHub Pages link
- [ ] Sample data loads and the demo story works: place an artwork, trigger a rule, print the catalogue
- [ ] Both of you have multiple commits on GitHub
- [ ] Console is clean on every page
- [ ] No gradient, blue, shadow, emoji, external file
- [ ] `EXPLAIN.md` read and rehearsed by both
- [ ] You can each open any JS file and explain it without help
- [ ] Repo link and live link in README and on the portal
