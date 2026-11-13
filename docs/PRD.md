# PRD: Art Gallery Exhibition Management

Course: CSE326, Semester 1, LPU (CA1 project)
Project IDs: RK2P26EVA29 / RK2P26EVA30
Team: Sukhmanpreet Kaur (12610973), Sonam Verma (12612084)
Deadline: 27 Nov 2026

Place this file at `docs/PRD.md`. It is the source of truth for **what** to build. `AGENTS.md` says **how** to build it. If the two conflict, `AGENTS.md` wins on technique and this file wins on behaviour.

---

## 1. Overview

**Problem statement:** Galleries organize exhibitions involving artists, artworks, display spaces, sales information, and exhibition periods, requiring coordination between multiple records.

**Objective:** Build an exhibition-management platform connecting artists, artworks, and gallery displays.

**Required functionality:** Artist profiles; artwork records; exhibition creation; gallery spaces; artwork assignment; exhibition catalogue.

**Product in one sentence:** A staff-only tool where a gallery records its artists, artworks and rooms, schedules exhibitions, places artworks into rooms for the exhibition dates, and prints a catalogue.

The real value is the **connections**: an artwork belongs to an artist, is placed in a space, for an exhibition, within a date range. The system must stop impossible combinations (same artwork in two shows at once, a room double-booked, a full room).

## 2. Goals and non-goals

Goals
- Every one of the six required functions works end to end.
- Records are linked, and the links are enforced by business rules (section 6).
- Data survives page refresh (localStorage).
- Code is small and readable enough for a first-semester student to explain line by line.
- Deployed online with GitHub Pages.

Non-goals (do not build)
- Login, roles, accounts
- Backend, database server, APIs, `fetch`
- Image upload or image hosting
- Payments, invoices, emails, notifications
- Charts, dashboards with graphs, animations, dark mode toggle
- Any feature not listed in section 7

## 3. Technical constraints (non-negotiable)

- Only **HTML, CSS, plain JavaScript**. No framework, library, CDN, npm, build tool, preprocessor, or icon/font package.
- Multi-page site: one HTML file per screen, one shared stylesheet, one JS file per page plus two shared JS files.
- Scripts loaded with plain `<script src>` tags, in dependency order. No ES modules, no `import`/`export`.
- Persistence: `localStorage` only, under one key.
- Must work by double-clicking `index.html` (no server needed) in current Chrome and Edge.
- Full constraints and code style are in `AGENTS.md`.

## 4. User

One type of user: **gallery staff** (the examiner, in practice). They are on a desktop browser, want to get a task done fast, and read dense information comfortably. Mobile works (readable at 360px) but is not the focus.

## 5. Data model

Stored as one object in `localStorage` key `galleryData`:

```
{
  nextId: 1,
  artists:     [],
  artworks:    [],
  spaces:      [],
  exhibitions: [],
  placements:  []
}
```

All ids are positive integers from `nextId` (increment after every use). Dates are strings `YYYY-MM-DD` (this format compares correctly as text).

**artist**
| field | type | required | notes |
|---|---|---|---|
| id | number | yes | |
| name | string | yes | unique, case-insensitive |
| born | number | no | 4-digit year |
| nationality | string | no | |
| style | string | no | e.g. Printmaking, Sculpture |
| bio | string | no | max 400 chars |

**artwork**
| field | type | required | notes |
|---|---|---|---|
| id | number | yes | |
| artistId | number | yes | must exist |
| title | string | yes | |
| year | number | no | |
| medium | string | yes | e.g. Oil on canvas |
| size | string | no | free text, e.g. 90 x 120 cm |
| price | number | yes | in INR, 0 not allowed |
| status | string | yes | `Available`, `Reserved`, `Sold` |
| buyer | string | only if Sold | shown only when status is Sold |

**space**
| field | type | required | notes |
|---|---|---|---|
| id | number | yes | |
| name | string | yes | unique, e.g. "North Hall" |
| capacity | number | yes | max artworks, integer 1 to 100 |
| note | string | no | e.g. "Natural light, no sculpture" |

**exhibition**
| field | type | required | notes |
|---|---|---|---|
| id | number | yes | |
| title | string | yes | unique |
| theme | string | no | |
| description | string | no | max 400 chars |
| startDate | string | yes | |
| endDate | string | yes | not before startDate |

Exhibition **status is never stored**. It is computed from today's date: `Upcoming` (today before start), `On now` (start to end inclusive), `Closed` (today after end).

**placement** (this is the "artwork assignment")
| field | type | notes |
|---|---|---|
| id | number | |
| exhibitionId | number | must exist |
| artworkId | number | must exist |
| spaceId | number | must exist |

Relationships: artist 1-to-many artwork. Exhibition and artwork are many-to-many, resolved through placement. Each placement also names the space.

## 6. Business rules

These are checked in one place (`rules` functions in `storage.js`), not scattered across pages. Pages call them and show the returned message.

Two date ranges **overlap** when `startA <= endB && startB <= endA`.

| id | rule | message shown |
|---|---|---|
| BR1 | Artist name must be unique (case-insensitive). | "An artist with this name already exists." |
| BR2 | An artist with artworks cannot be deleted. | "Delete or reassign this artist's artworks first." |
| BR3 | Space name unique. Exhibition title unique. | "This name is already used." |
| BR4 | Exhibition end date cannot be before start date. | "End date is before start date." |
| BR5 | A Sold artwork cannot be placed in any exhibition. | "Sold artworks cannot be placed." |
| BR6 | An artwork cannot be in two exhibitions whose dates overlap. | "Already in '[title]' during these dates." |
| BR7 | A space cannot host two different exhibitions whose dates overlap. | "[space] is used by '[title]' during these dates." |
| BR8 | Placements in one space for one exhibition cannot exceed the space capacity. | "[space] is full ([n]/[capacity])." |
| BR9 | The same artwork cannot be placed twice in the same exhibition. | "Already placed in this exhibition." |
| BR10 | An artwork that has a placement cannot be deleted. | "Remove it from its exhibitions first." |
| BR11 | A space that has placements cannot be deleted. | "This space is in use." |
| BR12 | Deleting an exhibition deletes its placements (after confirmation). | confirm: "Delete '[title]' and its [n] placements?" |
| BR13 | Changing an artwork to Sold while it has placements in Upcoming or On now exhibitions is blocked. | "Remove it from active exhibitions first." |
| BR14 | Editing exhibition dates must keep BR6 and BR7 true for its existing placements. | "New dates clash with '[title]'." |
| BR15 | Required fields and number ranges are validated before saving. Errors appear next to the form. | field specific |

Rules are re-checked on save even if the dropdown already hid invalid options. The UI is a convenience, the rules are the guarantee.

## 7. Screens and functional requirements

Eight pages. Every page shares the same top bar (see section 8).

### 7.1 Dashboard: `index.html`
- FR1: Four counts in one plain row: Artists, Artworks, Spaces, Exhibitions.
- FR2: List "On now" exhibitions, each with title, dates, placements count, link to its page. Then "Upcoming" ordered by start date. Closed ones are not listed here.
- FR3: For each On now exhibition, a line per space used: `North Hall 6 / 8`.
- FR4: Footer actions: "Load sample data" and "Erase all data". Both ask for confirmation. Sample data only loads when the store is empty, otherwise it explains why not.
- If there is no data, show one sentence and a link to add the first artist. No decorative empty-state art.

### 7.2 Artists: `artists.html`
- FR5: Form to add an artist. Same form edits an existing one (button text changes from "Add artist" to "Save changes", with a Cancel link).
- FR6: List of all artists as a table: name, nationality, style, number of artworks. Name links to the profile.
- FR7: Search box filters by name as the person types.
- FR8: Delete button per row, subject to BR2.

### 7.3 Artist profile: `artist.html?id=N`
- FR9: Shows the artist's details and bio.
- FR10: Lists their artworks (title, year, medium, status).
- FR11: Lists the exhibitions they have appeared in, derived from placements, no duplicates, with dates.
- Unknown id shows "Artist not found" and a link back.

### 7.4 Artworks: `artworks.html`
- FR12: Form to add or edit an artwork. Artist is a dropdown of existing artists. If there are no artists, the form is replaced by a link to add one.
- FR13: Buyer field appears only when status is Sold.
- FR14: Table: title, artist, year, medium, price, status. Price formatted for India, e.g. `₹ 1,20,000` via `toLocaleString('en-IN')`.
- FR15: Filters: by artist, by status, text search on title. Filters combine.
- FR16: Delete subject to BR10. Status edit subject to BR13.

### 7.5 Spaces: `spaces.html`
- FR17: Form to add or edit a space (name, capacity, note).
- FR18: Table: name, capacity, note, and "In use by" (the On now or Upcoming exhibition using it, or "Free").
- FR19: Delete subject to BR11.

### 7.6 Exhibitions: `exhibitions.html`
- FR20: Form to create or edit an exhibition (title, theme, description, start, end).
- FR21: Table: title, dates, status (computed), placements count. Row links to `exhibition.html?id=N`. Sorted by start date, newest first.
- FR22: Delete subject to BR12.

### 7.7 Exhibition and placements: `exhibition.html?id=N`
This is the core screen. It is where artwork assignment happens.
- FR23: Header with title, theme, dates, status, description, and a link "Open catalogue".
- FR24: Placement form with two dropdowns and one button.
  - Artwork dropdown lists only eligible artworks (not Sold, not already here, not in an overlapping exhibition). Option text: `Title, Artist`.
  - Space dropdown lists only spaces not used by an overlapping other exhibition, and shows room left: `North Hall (2 left)`. Full spaces are hidden.
  - If either list is empty the form shows why in one sentence, and the button is disabled.
- FR25: Placements are shown grouped by space. Each group heading shows `Space name, n / capacity`. Each row: title, artist, medium, price, status, Remove button.
- FR26: Remove deletes only the placement, never the artwork.
- FR27: Edit exhibition link returns to the exhibitions page with the form filled.

### 7.8 Catalogue: `catalogue.html?id=N`
- FR28: A print-ready document: exhibition title, dates, theme, description, then one section per space, in space name order.
- FR29: Each work is shown as a wall label (placard) with a running catalogue number across the whole document (1, 2, 3...): artist name, title, year, medium, size, price or "Sold".
- FR30: Closing summary line: number of works, number of artists, total price of works still Available.
- FR31: "Print" button calls `window.print()`. A print stylesheet hides the top bar and buttons, uses black on white, and avoids splitting a label across pages.
- Empty exhibition shows "No works placed yet" and a link to place some.

## 8. UI and visual design

The look should read as a **printed gallery guide**, not a SaaS dashboard.

**Hard bans:** gradients, drop shadows, glassmorphism, rounded cards, pill badges, emojis, icon sets, hero banners, marketing copy, "Welcome to...", stock-photo placeholders, animations other than the browser's default focus ring, any blue or purple.

**Colour tokens** (define once as CSS variables in `:root`):
| token | value | use |
|---|---|---|
| `--paper` | `#f4f1ea` | page background |
| `--ink` | `#1c1b19` | text |
| `--muted` | `#6b675e` | secondary text, labels |
| `--line` | `#cfc9bb` | hairline borders |
| `--accent` | `#8c2f1b` | primary buttons, active nav item, "Sold", destructive actions, error text |

Status is communicated with **words**, not coloured badges. Only `Sold` and error messages use `--accent`.

**Typography:** headings and body in `Georgia, 'Times New Roman', serif`. Labels, table headers, dates, ids and numbers in `ui-monospace, Consolas, Menlo, monospace` at a small size with uppercase labels. Base size 16px, line height 1.5. No web fonts.

**Layout**
- Max content width 1000px, centred, 24px side padding.
- Top bar: site name on the left ("Gallery Ledger" or similar, plain text), nav links on the right, one hairline under it. Active page link is underlined in `--accent`.
- Each management page: page title, then a two-column area on wide screens (form left at about 320px, table right), stacked on narrow screens.
- Tables: no zebra stripes, hairline row separators, header in small monospace caps, left-aligned text, right-aligned numbers.
- Buttons: rectangular, 2px radius max, 1px border. Primary is `--accent` fill with paper text. Secondary is outline. Delete is a text-style button in `--accent`.
- Form labels sit above inputs. Inputs have a 1px `--line` border and a clear 2px `--ink` outline on focus.
- Wall label (catalogue and exhibition view): small bordered box, artist in caps (mono), title in serif italic, then year, medium, size in muted mono, price at the end.
- Spacing scale: 4, 8, 16, 24, 40px only.

**Microcopy:** short, literal, no exclamation marks. Buttons say what they do ("Add artist", "Remove", "Open catalogue"). Success messages say what changed ("Artist added."). Messages appear in a single line region near the form and clear on the next action.

**Accessibility:** every input has a visible `<label>`, contrast at least 4.5:1, full keyboard use, semantic elements (`header`, `nav`, `main`, `table`, `form`, `button`).

## 9. File structure

```
gallery-ledger/
  AGENTS.md
  README.md
  index.html
  artists.html
  artist.html
  artworks.html
  spaces.html
  exhibitions.html
  exhibition.html
  catalogue.html
  css/
    style.css
  js/
    storage.js      data layer and all business rules
    ui.js           shared helpers: nav, formatting, messages, escaping
    dashboard.js
    artists.js
    artist.js
    artworks.js
    spaces.js
    exhibitions.js
    exhibition.js
    catalogue.js
  docs/
    PRD.md
    EXPLAIN.md      viva notes, updated every phase
```

Script order on every page: `storage.js`, then `ui.js`, then the page's own file, all at the end of `<body>`.

## 10. Acceptance criteria

The project is done when all of these pass in a fresh browser profile:

1. All eight pages open without a console error, from `file://` and from GitHub Pages.
2. With sample data loaded, the dashboard shows at least one On now or Upcoming exhibition.
3. Each of FR1 to FR31 can be demonstrated.
4. Each of BR1 to BR15 can be triggered and shows its message.
5. Refreshing any page keeps all data.
6. The catalogue prints to PDF on one to two pages for the sample exhibition with labels not split.
7. No gradient, shadow, blue, emoji, or external request exists anywhere (check the Network tab: only local files).
8. Each JS file is under 200 lines and each function under 30 lines.
9. `docs/EXPLAIN.md` has an entry for every file and every function.
10. Both team members have commits in the repository history.

## 11. Sample data (fictional, for demo only)

Use invented names. Do not use real artists or real artworks.

- Artists (4): Meera Kohli (b. 1978, Indian, printmaking), Tomas Reyes (b. 1965, Spanish, sculpture), Anika Rao (b. 1990, Indian, oil painting), Lukas Brandt (b. 1983, German, photography).
- Spaces (3): North Hall (capacity 6), Garden Room (capacity 4), Long Corridor (capacity 8).
- Artworks (9): a mix of Available, Reserved and one Sold, prices from 18,000 to 3,50,000.
- Exhibitions (3): one Closed, one On now, one Upcoming. Dates must be **relative to the day the sample data is loaded** (computed in JS from today's date) so the demo always shows an On now exhibition. Place 5 to 6 works in the On now one across two spaces, 2 in the Upcoming one.
