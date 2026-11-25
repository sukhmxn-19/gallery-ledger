# PRD: Art Gallery Exhibition Management

Course: CSE326, Semester 1, LPU (CA1 project)
Project IDs: RK2P26EVA29 / RK2P26EVA30
Official Academic Team: Sukhmanpreet Kaur (12610973) and Sonam Verma (12612084)

Deadline: 27 Nov 2026

Place this file at `docs/PRD.md`. It is the source of truth for **what** to build. `AGENTS.md` says **how** to build it. If the two conflict, `AGENTS.md` wins on technique and this file wins on behaviour.

---

## 1. Overview

**Problem statement:** Galleries organize exhibitions involving artists, artworks, display spaces, sales information, and exhibition periods, requiring coordination between multiple records.

**Objective:** Build an art gallery exhibition-management platform connecting living artists, physical artworks, and gallery spaces, presenting both a compelling public gallery experience and staff management tools.

**Required functionality:** Compelling public gallery website; artist profiles; artwork records; exhibition creation; gallery spaces; artwork assignment; exhibition catalogue; curatorial workspace.

**Architecture in two connected layers:**
- **A. Visitor Experience (Default, Public, Read-Only):** The welcoming, warm contemporary art gallery website (`index.html`) presenting an editorial hero ("Art has a place here."), current and upcoming exhibition showcases, curated artwork grids, living artist profiles, architectural rooms, and an engaging curatorial story. Free from administrative buttons, management forms, or inventory controls.
- **B. Organiser Workspace (Curatorial Studio):** The staff curatorial office (`dashboard.html`, `artists.html`, `artworks.html`, `spaces.html`, `exhibitions.html`, `exhibition.html`, `catalogue.html`) for registering artists, managing artwork inventories, scheduling exhibitions, validating space allocations with capacity enforcement, and generating printable exhibition catalogues.

The real value is the **connections**: an artwork belongs to an artist, is placed in a space, for an exhibition, within a date range. The system stops impossible combinations (same artwork in two shows at once, a room double-booked, a full room).

## 2. Goals and non-goals

Goals
- Real, human-crafted art gallery website with warm editorial presentation and zero generic AI slop.
- Clear separation between public art discovery and organiser administration.
- Honest static frontend access-control: public browsing is read-only by default; organiser controls reside in the Curatorial Studio with local browser persistence (`localStorage`).
- Authentic academic publishing workflow: Organiser edits locally &rarr; validates collection &rarr; exports updated data &rarr; repository maintainer updates `js/demo-data.js` &rarr; published to GitHub Pages &rarr; visitors see the updated collection.
- Every one of the core management functions works end to end.
- Records are linked, and the links are enforced by business rules (section 6).
- Data survives page refresh (localStorage) and is shared across public and workspace views.
- Code is small and readable enough for a first-semester student to explain line by line.
- Deployed online with GitHub Pages and runs locally from `file://`.

Non-goals (do not build)
- Fake authentication, fake password prompts, or security theater (client-side static site cannot provide cryptographic permissions)
- Backend, database server, APIs, `fetch`
- Image upload or image hosting (all assets are bundled local SVGs/images)
- Payments, invoices, emails, notifications
- Generic SaaS charts, purple gradients, or AI template dashboards

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

Nine pages across the two layers. Every page shares the distinctive gallery masthead navigation (see section 8).

### 7.1 Gallery Homepage: `index.html`
The public exhibition-facing landing experience.
- FR0-A: Welcoming editorial hero section featuring asymmetrical typography, gallery visual plate, warm headline ("Art has a place here."), concise human-centered introduction, live collection highlights ticker, and two visitor action paths ("Explore Exhibitions" and "Discover the Collection").
- FR0-B: Curatorial statement ribbon highlighting physical craft, living artists, architectural light, and contemplative viewing.
- FR0-C: Featured exhibitions section dynamically displaying the primary "On now" exhibition (*The Act of Looking*) in an image-led composition, plus upcoming shows, with visual plates, theme, dates, placements summary, and direct links to exhibition details and printable catalogue.
- FR0-D: Curated artworks showcase displaying selected artworks with tactile visual plates, artist link, medium, Indian Rupee valuation, and availability status badges, free from inventory management controls.
- FR0-E: Living artists spotlight introducing registered artists (Official Academic Team: Sukhmanpreet Kaur and Sonam Verma; Salik Riyaz's demonstration artist profile is sample content, not academic team membership) with personable biographies, disciplines, artwork tallies, and direct links to individual artist profiles.
- FR0-F: Architectural gallery spaces section featuring room illustrations, dimensions/notes, and physical atmospheric character, keeping operational occupancy meters primarily in the organiser workspace.
- FR0-G: The gallery story editorial section explaining curatorial vision, collection principles, and contemplative viewing (replacing database management methodology).
- FR0-H: Comprehensive multi-column footer with gallery identity, visitor navigation, academic project attribution, and a tasteful link to the Curatorial Studio.

### 7.2 Management Workspace Dashboard: `dashboard.html`
The curatorial administration workspace overview.
- FR1: Four counts in one plain row: Artists, Artworks, Spaces, Exhibitions.
- FR2: List "On now" exhibitions, each with title, dates, placements count, link to its page. Then "Upcoming" ordered by start date. Closed ones are not listed here.
- FR3: For each On now exhibition, room occupancy usage with graphical progress meters: `North Hall 6 / 8`.
- FR4: Maintenance actions: "Load sample data" and "Erase all data". Both ask for confirmation. Sample data only loads when the store is empty, otherwise it explains why not.

### 7.3 Artists: `artists.html`
- FR5: Form to add an artist. Same form edits an existing one (button text changes from "Add artist" to "Save changes", with a Cancel link).
- FR6: List of all artists as a table: name, nationality, style, number of artworks. Name links to the profile.
- FR7: Search box filters by name as the person types.
- FR8: Delete button per row, subject to BR2.

### 7.4 Artist profile: `artist.html?id=N`
- FR9: Shows the artist's details and bio.
- FR10: Lists their artworks (title, year, medium, status).
- FR11: Lists the exhibitions they have appeared in, derived from placements, no duplicates, with dates.
- Unknown id shows "Artist not found" and a link back.

### 7.5 Artworks: `artworks.html`
- FR12: Form to add or edit an artwork. Artist is a dropdown of existing artists. If there are no artists, the form is replaced by a link to add one.
- FR13: Buyer field appears only when status is Sold.
- FR14: Table: title, artist, year, medium, price, status. Price formatted for India, e.g. `₹ 1,20,000` via `toLocaleString('en-IN')`.
- FR15: Filters: by artist, by status, text search on title. Filters combine.
- FR16: Delete subject to BR10. Status edit subject to BR13.

### 7.6 Spaces: `spaces.html`
- FR17: Form to add or edit a space (name, capacity, note).
- FR18: Table: name, capacity, note, and "In use by" (the On now or Upcoming exhibition using it, or "Free").
- FR19: Delete subject to BR11.

### 7.7 Exhibitions: `exhibitions.html`
- FR20: Form to create or edit an exhibition (title, theme, description, start, end).
- FR21: Table: title, dates, status (computed), placements count. Row links to `exhibition.html?id=N`. Sorted by start date, newest first.
- FR22: Delete subject to BR12.

### 7.8 Exhibition and placements: `exhibition.html?id=N`
This is the core screen. It is where artwork assignment happens.
- FR23: Header with title, theme, dates, status, description, and a link "Open catalogue".
- FR24: Placement form with two dropdowns and one button.
  - Artwork dropdown lists only eligible artworks (not Sold, not already here, not in an overlapping exhibition). Option text: `Title, Artist`.
  - Space dropdown lists only spaces not used by an overlapping other exhibition, and shows room left: `North Hall (2 left)`. Full spaces are hidden.
  - If either list is empty the form shows why in one sentence, and the button is disabled.
- FR25: Placements are shown grouped by space. Each group heading shows `Space name, n / capacity`. Each row: title, artist, medium, price, status, Remove button.
- FR26: Remove deletes only the placement, never the artwork.
- FR27: Edit exhibition link returns to the exhibitions page with the form filled.

### 7.9 Catalogue: `catalogue.html?id=N`
- FR28: A print-ready document: exhibition title, dates, theme, description, then one section per space, in space name order.
- FR29: Each work is shown as a wall label (placard) with a running catalogue number across the whole document (1, 2, 3...): artist name, title, year, medium, size, price or "Sold".
- FR30: Closing summary line: number of works, number of artists, total price of works still Available.
- FR31: "Print" button calls `window.print()`. A print stylesheet hides the top bar and buttons, uses black on white, and avoids splitting a label across pages.
- Empty exhibition shows "No works placed yet" and a link to place some.

## 8. UI and visual design

The interface embodies a **warm contemporary gallery aesthetic**: an authentic contemporary art gallery, tactile exhibition space, and museum archive. It bridges public art discovery and the curatorial office, remaining completely vanilla and explainable by first-semester students.

**Design principles:**
- **Warm tactile surfaces:** Archival cream backdrop, cotton card surfaces, warm linen matting, and delicate hairline rules.
- **Visual storytelling & welcoming hero:** Asymmetrical editorial hero with large serif display type ("Art has a place here."), gallery interior visual plate, and two visitor action paths ("Explore Exhibitions" and "Discover the Collection").
- **Curated cards & visual plates:** Exhibition feature cards with artwork plates and placements summary, artwork showcase grids with dimensions and medium tags, and framed living artist dossiers.
- **Architectural illustrations:** Local SVG illustrations representing gallery spaces, exhibitions, and artworks without external network requests.
- **Animation system:** Restrained CSS transitions and vanilla JavaScript reveals (entrance sequence, IntersectionObserver scroll reveals, gentle image zoom on hover `scale(1.025)`, and subtle card lift). Full support for `@media (prefers-reduced-motion: reduce)`.
- **Status & curation badges:** Warm curatorial badges with indicator dots (`On now` in terracotta, `Upcoming` in ochre, `Closed` in slate, `Available` in sage, `Reserved`, `Sold`).
- **Typography:** High-contrast editorial serif (`Playfair Display`, `Didot`, `Georgia`, serif) for display titles, section headings, and placards. Literary reading serif (`Charter`, `Palatino`, `Georgia`, serif) for body text and bios. Curatorial monospace (`ui-monospace`, `Cascadia Code`, `Menlo`, `Consolas`, monospace) for dates, currency, catalog numbers, and metadata. No web fonts or external network font downloads.
- **No AI Template Slop:** Forbidden generic blue-purple gradients, glowing blobs, glassmorphism, floating badges, meaningless stats, and SaaS dashboard templates.

**Colour tokens** (defined as CSS variables in `:root`):
| token | value | use |
|---|---|---|
| `--bg-vellum` | `#fcf9f2` | main page backdrop (warm archival cream) |
| `--bg-surface` | `#ffffff` | cotton card surface, active inputs |
| `--bg-surface-warm` | `#f6efe3` | secondary panel background, linen matting |
| `--bg-inset` | `#ede5d5` | meter tracks, inset wells, table headers |
| `--ink-primary` | `#1e1d1a` | titles, primary data, active headers |
| `--ink-secondary` | `#4a463e` | curatorial notes, descriptions, body |
| `--ink-muted` | `#7c776e` | metadata, catalog numbers, form labels |
| `--border-light` | `#eae3d5` | subtle card partitions |
| `--border-medium` | `#d6cebe` | standard card borders, inputs, tables |
| `--border-strong` | `#2c2824` | structural borders, prominent rules |
| `--accent-terracotta` | `#c44b33` | live exhibitions ("On now"), "Sold", primary actions, errors |
| `--accent-ochre` | `#b57418` | upcoming exhibitions, "Reserved" artworks |
| `--accent-sage` | `#3d6842` | "Available" artworks, healthy room capacity |
| `--accent-slate` | `#5d6773` | "Closed" exhibitions, historical archives |

## 9. File structure

```
gallery-ledger/
  AGENTS.md
  README.md
  index.html          public gallery homepage
  dashboard.html      curatorial management workspace
  artists.html
  artist.html
  artworks.html
  spaces.html
  exhibitions.html
  exhibition.html
  catalogue.html
  css/
    style.css
  img/                bundled local SVGs for gallery, artworks & spaces
  js/
    storage.js        data layer and all business rules
    ui.js             shared helpers: nav, formatting, messages, escaping
    home.js           public homepage dynamic sections
    dashboard.js      workspace dashboard logic
    artists.js
    artist.js
    artworks.js
    spaces.js
    exhibitions.js
    exhibition.js
    catalogue.js
  docs/
    PRD.md
    EXPLAIN.md        viva notes, updated every phase
```

Script order on every page: `storage.js`, then `ui.js`, then the page's own file, all at the end of `<body>`.

Script order on every page: `storage.js`, then `ui.js`, then the page's own file, all at the end of `<body>`.

## 10. Acceptance criteria

The project is done when all of these pass in a fresh browser profile:

1. All eight pages open without a console error, from `file://` and from GitHub Pages.
2. With sample data loaded, the dashboard shows at least one On now or Upcoming exhibition.
3. Each of FR1 to FR31 can be demonstrated.
4. Each of BR1 to BR15 can be triggered and shows its message.
5. Refreshing any page keeps all data.
6. The catalogue prints to PDF on one to two pages for the sample exhibition with labels not split.
7. Zero external network requests anywhere (check Network tab: only local files). No external fonts, CDNs, or libraries.
8. Each JS file is under 200 lines and each function under 30 lines.
9. `docs/EXPLAIN.md` has an entry for every file and every function.
10. Both team members have commits in the repository history.

## 11. Curated Demonstration Dataset & First-Visit Seeding (Phase 6.5)

To ensure the exhibition platform is immediately explorable upon evaluation and on static deployment platforms (such as GitHub Pages or direct `file://` execution), Gallery Ledger employs a bundled, deterministic demonstration repository initialized via `js/demo-data.js`.

### Seeding & Persistence Lifecycle Rules
1. **First-Time Visit**: When `localStorage.getItem('galleryData')` is `null`, `loadData()` automatically seeds the curated demonstration repository into localStorage.
2. **Persistence**: If `galleryData` already exists, user records and modifications are preserved across all page refreshes.
3. **Intentional Erasure**: If staff clicks "Erase All Data" in `dashboard.html`, the store is set to an empty dataset (`{ artists: [], artworks: [], ... }`). Because the key exists, subsequent page loads retain the empty state and do NOT overwrite user erasure.
4. **On-Demand Restoration**: Staff can re-seed or restore the curated demonstration collection at any time using "Load Curated Collection" in `dashboard.html`.

### Curated Content Structure
- **Academic Team Attribution (2)**: Official Academic Team: Sukhmanpreet Kaur (Paper & Structural Geometry) and Sonam Verma (Architectural Light & Spatial Form). Student team profiles distinguish factual research and academic backgrounds from fictional coursework demonstration scenarios. Original Website Development Credit: Salik Riyaz (External Contributor). Salik's demonstration artist profile is sample content, not academic team membership.
- **Architectural Spaces (3)**: North Gallery (Capacity: 6, primary hall), Project Room (Capacity: 4, visual studies), Screening Alcove (Capacity: 3, lens-based research).
- **Scheduled Exhibitions (3)**:
  - *The Act of Looking* (On now, relative dates -12d to +24d, 6 placed works across North Gallery and Project Room).
  - *Rooms for Light* (Upcoming, relative dates +35d to +70d, 4 placed works across North Gallery and Screening Alcove).
  - *Notes in Matter* (Closed, relative dates -80d to -20d, 2 placed works across Project Room and Screening Alcove).
  Exhibition date intervals are strictly mutually disjoint, eliminating scheduling conflicts (BR6, BR7).
- **Demonstration Artworks (12)**: 4 conceptual studies per sample artist (Official Academic Team: Sukhmanpreet Kaur and Sonam Verma, alongside Salik Riyaz's demonstration artist profile as sample content). Valuations range from ₹28,000 to ₹95,000 with 10 Available, 1 Reserved, and 1 Sold record (`Rooms in Memory`, unplaced per BR5).
- **Artwork Placements (12)**: Strictly respects space capacity (BR8), Sold placement restrictions (BR5), and duplicate placement rules (BR9). All entities share the sequential ID counter with `nextId: 34`.
