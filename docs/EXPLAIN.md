# How the pages connect

Course: CSE326, Semester 1, LPU (CA1 project)  
Project IDs: RK2P26EVA29 / RK2P26EVA30  
Official Academic Team: Sukhmanpreet Kaur (12610973) and Sonam Verma (12612084)  
(External Contributor).

This trace follows one complete workflow across the gallery platform from the public landing experience to curatorial management and printable catalogue output, naming the primary function executing at each step:

0. **Public Gallery Homepage**:
   - Visitor opens `index.html`. `initHomePage()` renders the warm masthead navigation (`renderNav('Home')`), reads `loadData()`, and renders the collection overview via `renderHomePage()`.
   - The visitor explores the welcoming editorial hero ("Art has a place here."), live collection highlights ticker (`renderHeroTicker()`), current and upcoming exhibitions (`renderExhibitions()`), curated artworks showcase (`renderArtworks()`), living artists roster (`renderArtists()`), architectural gallery spaces (`renderSpaces()`), the curatorial story ("A Space for Art to Breathe"), and gentle entrance/scroll reveals (`setupScrollReveals()`).
   - Visitor can click an exhibition to view its details or open its printable catalogue. Staff and examiners enter the curatorial workspace via the clearly segregated "Curatorial Studio" nav link to `dashboard.html`.

1. **Enter Curatorial Workspace**:
   - Staff opens `dashboard.html`. `initDashboard()` renders `renderNav('Workspace')`, reads `loadData()`, and calls `renderDashboard()`.
   - If empty, staff can click "Load Sample Collection" to seed demonstration records via `loadSampleData()`.
   - Four inventory summary cards are rendered (`renderCounts()`), alongside running and upcoming exhibition cards with room occupancy meters (`buildSpaceUsageHtml()`, `renderOnNowExhibitions()`).

2. **Add Artist**:
   - User opens `artists.html`. `initArtistsPage()` calls `loadData()` and `renderArtistsTable()`.
   - User fills in name, birth year, nationality, style, bio, and clicks "Add artist".
   - `handleFormSubmit()` validates inputs using `validateArtist()` (checking `checkArtistName()` for BR1 and `checkRequired()` for BR15).
   - Generates ID using `getNextId()`, pushes new artist to `data.artists`, calls `saveData()`, and updates the table via `renderArtistsTable()`.

3. **Add Artwork**:
   - User opens `artworks.html`. `initArtworksPage()` calls `loadData()` and populates the artist selector via `populateArtistDropdowns()`.
   - User selects the artist, enters title, year, medium, size, price, and status, and submits.
   - `handleFormSubmit()` calls `validateArtwork()` (validating positive price, valid year bounds, and buyer requirement if sold).
   - Generates ID via `getNextId()`, appends artwork to `data.artworks`, calls `saveData()`, and updates the table via `renderArtworksTable()`.

4. **Create Space**:
   - User opens `spaces.html`. `initSpacesPage()` calls `loadData()` and `renderSpacesTable()`.
   - User enters space name (e.g., "North Hall"), capacity (1–100), and note, then submits.
   - `handleFormSubmit()` calls `validateSpace()` (verifying uniqueness via `checkSpaceName()` for BR3 and capacity range for BR15).
   - Generates ID via `getNextId()`, appends space to `data.spaces`, calls `saveData()`, and refreshes `renderSpacesTable()`.

5. **Create Exhibition**:
   - User opens `exhibitions.html`. `initExhibitionsPage()` calls `loadData()` and `renderExhibitionsTable()`.
   - User enters title, theme, description, start date, and end date, then submits.
   - `handleFormSubmit()` calls `validateExhibition()` (validating uniqueness with `checkExhibitionTitle()` for BR3 and date order with `checkExhibitionDatesOrder()` for BR4).
   - Generates ID via `getNextId()`, appends exhibition to `data.exhibitions`, calls `saveData()`, and redraws table sorted newest first.

6. **Place Artwork in Exhibition**:
   - User clicks the exhibition title link, opening `exhibition.html?id=N`.
   - `initExhibitionPage()` reads `?id=` via `getIdFromUrl()`, queries `findExhibitionById()`, and populates eligible dropdowns via `populatePlacementDropdowns()` and existing assignments via `renderPlacements()`.
   - User picks an eligible artwork and space with remaining capacity, then clicks "Place artwork".
   - `handlePlacementSubmit()` verifies `checkPlacement()` covering BR5 (not Sold), BR6 (no artwork schedule overlap), BR7 (no room double-booking), BR8 (room capacity limit), and BR9 (no duplicate placement).
   - Assigns placement ID with `getNextId()`, appends to `data.placements`, calls `saveData()`, and updates room groupings and dropdown options.

7. **Open Printable Catalogue**:
   - User clicks "Open catalogue", navigating to `catalogue.html?id=N`.
   - `initCataloguePage()` reads URL query ID, queries `findExhibitionById()`, and fetches placements with `getPlacementsForExhibition()`.
   - `renderCatalogueHeader()` renders the exhibition title, dates, theme, and description.
   - `renderCatalogueSections()` sorts rooms alphabetically via `getSortedSpaces()`, renders wall label cards (`.label-card`) with continuous running numbers (`No. 1`, `No. 2`...), and appends the collection summary (`countUniqueArtists()`, `calculateAvailableTotal()`).
   - User clicks "Print" to trigger `handlePrintClick()` which calls native `window.print()`, formatted cleanly by `@media print` without headers, buttons, or card splits.

## Phase 0: Project scaffold
Files: index.html, artists.html, artist.html, artworks.html, spaces.html, exhibitions.html, exhibition.html, catalogue.html, css/style.css, js/storage.js, js/ui.js, js/dashboard.js, js/artists.js, js/artist.js, js/artworks.js, js/spaces.js, js/exhibitions.js, js/exhibition.js, js/catalogue.js, README.md

## Phase 1: Data layer and shared helpers
Files: js/storage.js, js/ui.js

### storage.js
Purpose: Handles localStorage persistence, record querying, and all gallery business rules.
- loadData(): Reads and parses the galleryData key from localStorage or returns a blank store. Called from: page scripts on startup.
- saveData(data): Serializes the gallery data object to localStorage. Called from: forms and deletion handlers.
- getNextId(data): Returns the current nextId integer and increments it in data. Called from: add record handlers.
- findArtistById(data, id): Returns the matching artist object by id or undefined. Called from: artist profile, artworks, placements.
- findArtworkById(data, id): Returns the matching artwork object by id or undefined. Called from: placement checks and catalogue.
- findSpaceById(data, id): Returns the matching space object by id or undefined. Called from: space usage, placement validation.
- findExhibitionById(data, id): Returns the matching exhibition object by id or undefined. Called from: exhibition details, clashes.
- getPlacementsForExhibition(data, exhibitionId): Returns array of placements belonging to an exhibition. Called from: exhibition view, catalogue.
- getPlacementsForArtwork(data, artworkId): Returns array of placements for an artwork. Called from: artwork deletion and status check.
- getPlacementsForSpace(data, spaceId): Returns array of placements for a space. Called from: space deletion and occupancy check.
- getArtworksForArtist(data, artistId): Returns array of artworks created by an artist. Called from: artist table and profile.
- datesOverlap(startA, endA, startB, endB): Checks if two date ranges touch or intersect. Called from: exhibition scheduling, placements.
- getExhibitionStatus(exhibition): Computes 'Upcoming', 'On now', or 'Closed' based on local today's date. Called from: dashboard, exhibitions.
- findClashingExhibition(data, placements, excludeId, start, end): Finds any overlapping exhibition across placements. Called from: BR6, BR7, BR14.
- checkArtistName(data, name, ignoreId): Validates that an artist's name is case-insensitively unique. Called from: artists form.
- canDeleteArtist(data, artistId): Ensures an artist has no artworks before deletion. Called from: artists delete button.
- checkUniqueName(items, name, ignoreId): Generic case-insensitive uniqueness check for spaces and exhibitions. Called from: BR3.
- checkSpaceName(data, name, ignoreId): Validates space name uniqueness. Called from: spaces form.
- checkExhibitionTitle(data, title, ignoreId): Validates exhibition title uniqueness. Called from: exhibitions form.
- checkExhibitionDatesOrder(startDate, endDate): Validates end date is not before start date. Called from: exhibitions form.
- checkArtworkNotSold(artwork): Blocks placement if an artwork is Sold. Called from: checkPlacement.
- checkArtworkOverlap(data, exhibitionId, artworkId): Blocks placing an artwork in overlapping exhibitions. Called from: checkPlacement.
- checkSpaceOverlap(data, exhibitionId, spaceId): Blocks double-booking a space across overlapping exhibitions. Called from: checkPlacement.
- checkSpaceCapacity(data, exhibitionId, spaceId): Blocks placing more artworks than a space's capacity. Called from: checkPlacement.
- checkArtworkNotPlacedTwice(data, exhibitionId, artworkId): Blocks adding the same artwork twice to one exhibition. Called from: checkPlacement.
- checkPlacement(data, exhibitionId, artworkId, spaceId): Validates BR5 through BR9 before saving a placement. Called from: exhibition placement form.
- canDeleteArtwork(data, artworkId): Blocks deleting an artwork with active or past placements. Called from: artworks delete button.
- canDeleteSpace(data, spaceId): Blocks deleting a space that has placements. Called from: spaces delete button.
- getDeleteExhibitionConfirm(data, exhibitionId): Builds the confirmation message naming placements to be deleted. Called from: exhibitions delete button.
- canMarkSold(data, artworkId): Blocks marking an artwork Sold if it is in an Upcoming or On now exhibition. Called from: artworks form.
- checkExhibitionDates(data, exhibitionId, newStart, newEnd): Ensures modified dates do not clash with existing artwork or space placements. Called from: exhibitions edit form.
- checkRequired(value, fieldName): Ensures required text fields are not empty or whitespace. Called from: all forms.
Viva questions this file may raise:
- Why are business rules centralized in storage.js instead of inside form submit handlers? To guarantee consistent data integrity across all screens from a single source of truth.
- Why is exhibition status computed from dates instead of stored? Storing status leads to stale data as days pass, whereas computing against today's date is always accurate.

### ui.js
Purpose: Provides reusable user-interface helpers for navigation, HTML sanitization, currency/date formatting, and query parameters.
- renderNav(activePage): Generates the top navigation bar and applies the active CSS class to the current page link. Called from: all pages on load.
- escapeHtml(text): Converts special HTML characters into safe entities to prevent XSS. Called from: dynamic table and card renderers.
- formatPrice(number): Formats a numeric price with a Rupee symbol and Indian thousand-grouping. Called from: artworks, exhibition, catalogue.
- formatDate(yyyymmdd): Converts a YYYY-MM-DD string into readable 'DD Mon YYYY' format. Called from: exhibition details, lists, catalogue.
- getIdFromUrl(): Extracts and validates the integer '?id=' query parameter from the URL. Called from: artist.html, exhibition.html, catalogue.html.
- showMessage(text, isError): Renders a single-line feedback message with success or error styling. Called from: forms and action handlers.
Viva questions this file may raise:
- Why do we format numbers using toLocaleString('en-IN')? Because the gallery operates in INR and requires Indian digit grouping (lakhs and crores).
- Why do we have escapeHtml() when textContent exists? When generating templated HTML strings for tables or cards, escapeHtml ensures user input cannot inject malicious scripts.

## Phase 2: Design system (CSS)
Files: css/style.css

### style.css
Purpose: Single stylesheet providing paper-and-ink printed gallery styling, responsive split grid layouts, form/table design, wall label placards, and print media rules.
- Variables (:root): Defines the five strictly permitted palette tokens (--paper, --ink, --muted, --line, --accent), font stacks (Georgia serif for body and text, system monospace for labels and numerals), and fixed spacing scale (4, 8, 16, 24, 40px).
- Split grid (.split): Uses CSS Grid to create a two-column desktop management layout with a 320px fixed form column on the left and a flexible table/content area on the right, collapsing into a single stacked column on viewports under 700px.
- Print block (@media print): Hides the navigation header, interactive buttons, and action links; forces clean high-contrast black text on white paper; resets margins for printable pages; and uses break-inside: avoid on .label-card to ensure museum wall placards never split across physical page breaks.
Viva questions this file may raise:
- Why are all colors and spacing declared in :root CSS variables? To enforce strict visual consistency across the entire gallery guide without magic numbers or duplicate hardcoded hex values.
- How does the responsive layout work without a media query framework? It uses CSS Grid with a single media query at 700px to switch grid-template-columns from '320px 1fr' to '1fr'.
- What does break-inside: avoid do in the print stylesheet? It prevents the printer from slicing a wall label placard horizontally across two physical paper pages.

## Phase 3: Artists and artist profile
Files: artists.html, artist.html, js/artists.js, js/artist.js

### artists.js
Purpose: Manages artist creation, modification, deletion, and real-time search filtering.
- validateArtist(name, born, bio, ignoreId): Validates name presence, case-insensitive uniqueness (BR1), 4-digit birth year, and 400-character bio limit. Called from: handleFormSubmit.
- resetArtistForm(): Clears form inputs, resets submit button label to 'Add artist', and hides the Cancel button. Called from: form submit, table delete, cancel button.
- setFormForEdit(artist): Loads an existing artist's data into the form, changes submit button to 'Save changes', and shows Cancel. Called from: handleTableClick on Edit button.
- renderArtistsTable(filterText): Renders the table of artists with computed artwork counts, filtered by name search text. Called from: init, submit, delete, and search input.
- saveArtistRecord(id, name, born, nationality, style, bio): Creates a new artist record or updates existing artist fields and saves to storage. Called from: handleFormSubmit.
- handleFormSubmit(event): Handles adding a new artist or saving edits to an existing artist. Called from: form submit event listener.
- handleTableClick(event): Routes clicks on Edit or Delete buttons in the table and enforces deletion rules (BR2). Called from: table body click event listener.
- handleSearchInput(): Filters table rows as the user types in the search field. Called from: search input event listener.
- handleCancelClick(): Resets the form from edit mode back to add mode. Called from: cancel button click event listener.
- initArtistsPage(): Renders top navigation, loads data, draws table, and registers event listeners. Called from: end of file on page load.
Viva questions this file may raise:
- How does the single form handle both adding and editing? A hidden input (#artist-id) holds the record id; if empty, submit creates a new record; if populated, submit updates the existing record.
- Why is search handled on the 'input' event instead of 'change'? The input event fires immediately on every keystroke, allowing instant live filtering without requiring pressing Enter or defocusing.

### artist.js
Purpose: Renders a comprehensive artist profile showing biographical metadata, artwork portfolio, and exhibition history.
- getExhibitionsForArtist(artistId): Gathers distinct exhibitions where the artist's works are assigned via placement records. Called from: renderProfile.
- renderNotFound(): Displays a friendly error message and return link when an invalid artist ID is supplied in the URL. Called from: initArtistProfile.
- buildArtworksTableHtml(artworks): Generates safe HTML for the artist's artworks table or an empty state message. Called from: renderProfile.
- buildExhibitionsTableHtml(exhibitions): Generates safe HTML for the artist's exhibition appearances with computed statuses. Called from: renderProfile.
- renderProfile(artist): Formats and renders the artist's bio, portfolio table, and exhibition appearances into the DOM. Called from: initArtistProfile.
- initArtistProfile(): Reads ?id= from URLSearchParams, queries storage, and invokes profile or not-found renderers. Called from: end of file on page load.
Viva questions this file may raise:
- How does the artist profile discover which exhibitions an artist participated in? It traces artist -> artworks -> placements -> exhibitions, collecting unique exhibition IDs to avoid duplicate listings.
- What happens if a user navigates to artist.html with an invalid or missing ?id? getIdFromUrl() returns 0, and renderNotFound() displays a clean 'Artist not found' message with a return link.

## Phase 4: Spaces
Files: spaces.html, js/spaces.js

### spaces.js
Purpose: Manages gallery display rooms, capacity bounds, and live exhibition occupancy tracking.
- validateSpace(name, capacity, ignoreId): Validates space name presence and uniqueness (BR3), and enforces integer capacity between 1 and 100 (BR15). Called from: handleFormSubmit.
- getSpaceInUseBy(spaceId): Checks if any placements in the space belong to an 'On now' or 'Upcoming' exhibition, returning the title or 'Free'. Called from: renderSpacesTable.
- resetSpaceForm(): Resets the form inputs, sets button to 'Add space', and hides Cancel. Called from: form submit, table delete, cancel button.
- setFormForEdit(space): Fills form with space properties, changes submit button to 'Save changes', and shows Cancel. Called from: handleTableClick on Edit button.
- renderSpacesTable(): Renders table rows showing room name, capacity, note, and current exhibition usage. Called from: init, submit, and delete.
- saveSpaceRecord(id, name, capacity, note): Creates a new space record or updates existing space fields and saves to storage. Called from: handleFormSubmit.
- handleFormSubmit(event): Adds a new gallery space or saves changes to an existing one. Called from: form submit event listener.
- handleTableClick(event): Routes Edit or Delete button clicks, protecting occupied spaces from deletion (BR11). Called from: table body click listener.
- handleCancelClick(): Resets form from edit mode back to add mode. Called from: cancel button click listener.
- initSpacesPage(): Renders top navigation, loads data, renders table, and binds event listeners. Called from: end of file on page load.
Viva questions this file may raise:
- How does the system know if a space is 'Free' or 'In use by' an exhibition? It checks whether any placement record links that space to an exhibition whose computed status is 'On now' or 'Upcoming'.
- Why is capacity restricted between 1 and 100? PRD section 5 specifies space capacity must be a positive integer from 1 to 100 to represent realistic physical gallery room constraints.

## Phase 5: Artwork records
Files: artworks.html, js/artworks.js

### artworks.js
Purpose: Manages artwork inventory, pricing, status changes, buyer validation, multi-criteria filtering, and deletion rules.
- populateArtistDropdowns(): Populates the artist selector in the form and filter bar, hiding the form if no artists exist. Called from: initArtworksPage.
- updateBuyerFieldVisibility(): Shows or hides the buyer input depending on whether status is set to 'Sold'. Called from: form status change, reset, and edit.
- validateArtwork(artistId, title, year, medium, price, status, buyer, editId): Enforces required fields, positive price, valid year range (1000–current year), buyer when sold, and prevents marking active works Sold (BR13, BR15). Called from: handleFormSubmit.
- resetArtworkForm(): Resets inputs, clears hidden ID, sets button to 'Add artwork', and hides buyer field and Cancel button. Called from: form submit, table delete, cancel button.
- setFormForEdit(art): Fills the form with artwork values, opens buyer field if sold, updates submit button to 'Save changes', and reveals Cancel. Called from: handleTableClick on Edit button.
- renderArtworksTable(): Filters artworks by artist, status, and title substring, rendering formatted prices (INR) and accent-colored 'Sold' status. Called from: init, submit, delete, and filter controls.
- handleFormSubmit(event): Adds a new artwork or updates an existing record after passing validations. Called from: form submit event listener.
- handleTableClick(event): Routes Edit and Delete clicks, blocking deletion if the artwork has placement records (BR10). Called from: table body click listener.
- handleCancelClick(): Restores form back to default add mode. Called from: cancel button click listener.
- initArtworksPage(): Renders top navigation, loads data, populates artist lists, renders table, and binds event listeners. Called from: end of file on page load.
Viva questions this file may raise:
- Why is buyer required only when status is Sold? PRD section 5 states that buyer information is only captured and displayed once an artwork's sale is finalized.
- What prevents a gallery from accidentally marking an on-display artwork as Sold? BR13 blocks updating status to 'Sold' if the artwork currently has placements in any 'On now' or 'Upcoming' exhibition.

## Phase 6: Exhibitions
Files: exhibitions.html, js/exhibitions.js

### exhibitions.js
Purpose: Handles exhibition scheduling, chronological ordering, placement cascade deletions, and schedule clash prevention.
- validateExhibition(title, start, end, desc, editId): Enforces required title and dates, uniqueness (BR3), date ordering (BR4), 400-char description cap (BR15), and verifies existing placements do not clash with other exhibitions when dates are edited (BR14). Called from: handleFormSubmit.
- resetExhibitionForm(): Clears inputs, clears hidden ID, sets button to 'Create exhibition', and hides Cancel. Called from: form submit, table delete, cancel button.
- setFormForEdit(ex): Loads an existing exhibition into the form, changes button to 'Save changes', and shows Cancel. Called from: table Edit button and incoming ?id= query.
- renderExhibitionsTable(): Sorts exhibitions by start date (newest first) and renders rows with title links, formatted dates, dynamic status, and placement counts. Called from: init, submit, and delete.
- saveExhibitionRecord(id, title, theme, desc, start, end): Creates a new exhibition or updates an existing record and saves data. Called from: handleFormSubmit.
- handleFormSubmit(event): Adds a new exhibition or updates existing exhibition dates and details. Called from: form submit event listener.
- handleTableClick(event): Routes Edit and Delete clicks, prompting with BR12 confirmation and cascading deletion to placement records. Called from: table body click listener.
- handleCancelClick(): Resets form back to default create mode. Called from: cancel button click listener.
- initExhibitionsPage(): Renders top navigation, loads data, renders table, binds listeners, and checks for incoming ?id= edit queries (FR27). Called from: end of file on page load.
Viva questions this file may raise:
- What happens to placements when an exhibition is deleted? Under BR12, deleting an exhibition prompts confirmation naming the number of placements affected, and cascades to remove only those placements without deleting the artworks or rooms.
- How does the system prevent schedule clashes when exhibition dates are changed? BR14 verifies whether any artwork or space assigned to the exhibition is already booked by another exhibition overlapping the proposed new date range.

## Phase 7: Artwork assignment
Files: exhibition.html, js/exhibition.js

### exhibition.js
Purpose: Displays exhibition details and manages assigning and unassigning artworks to rooms while enforcing capacity and overlap rules.
- getEligibleArtworks(exId): Filters available, non-overlapping, unplaced artworks for the exhibition. Called from: populatePlacementDropdowns.
- getEligibleSpaces(exId): Filters rooms not booked by overlapping exhibitions that have remaining capacity. Called from: populatePlacementDropdowns.
- updatePlacementButton(hasArtworks, hasSpaces): Disables the submit button with an informative reason if artworks or rooms are unavailable. Called from: populatePlacementDropdowns.
- populatePlacementDropdowns(exId): Fills the artwork and room dropdowns with eligible candidates. Called from: init, placement submit, remove placement.
- renderExhibitionHeader(ex): Renders exhibition title, status, date range, theme, and action links. Called from: initExhibitionPage.
- renderSpaceTable(space, inSpace): Builds table HTML for placements assigned to a specific gallery room. Called from: renderPlacements.
- renderPlacements(exId): Renders all artwork assignments grouped by room with individual remove buttons. Called from: init, placement submit, remove placement.
- handlePlacementSubmit(event): Validates BR5 through BR9 via checkPlacement and adds a new placement record. Called from: placement form submit listener.
- handlePlacementsClick(event): Deletes a single placement record without affecting the artwork or room. Called from: placements container click listener.
- initExhibitionPage(): Reads ?id= from URL, renders header and placement view or displays not-found state. Called from: end of file on page load.
Viva questions this file may raise:
- How does the UI prevent double-booking an artwork or space? Dropdowns only display eligible artworks and rooms with capacity, and checkPlacement re-validates all overlap rules (BR5–BR9) on form submission.
- Does removing a placement delete the artwork or space? No, removing a placement deletes only the link in the placements table; the artwork and space records remain untouched.

## Phase 8: Printable catalogue
Files: catalogue.html, js/catalogue.js, css/style.css

### catalogue.js
Purpose: Renders a print-ready exhibition catalogue with wall placards, running numbers, alphabetical space groupings, and closing collection summary.
- countUniqueArtists(artworks): Counts the number of distinct artists represented across an array of artworks. Called from: renderCatalogueSections.
- calculateAvailableTotal(artworks): Sums the prices of all displayed artworks whose status is Available. Called from: renderCatalogueSections.
- buildLabelCardHtml(art, artist, number): Builds HTML placard for a single artwork with running catalogue number, uppercase artist name, italic title, metadata, and price or accent 'Sold'. Called from: buildSpaceSectionHtml.
- buildSpaceSectionHtml(space, spacePlacements, startNumber): Generates HTML for one space and its placed artwork cards, returning next available number. Called from: renderCatalogueSections.
- getSortedSpaces(placements): Identifies unique spaces used by an exhibition's placements and sorts them alphabetically by name. Called from: renderCatalogueSections.
- renderCatalogueSections(placements): Groups placements by sorted spaces, renders numbered cards, and populates the closing summary line. Called from: initCataloguePage.
- renderCatalogueHeader(ex): Displays exhibition title, date range, optional theme, description, and return link. Called from: initCataloguePage.
- handlePrintClick(): Triggers browser window.print() to print or export as PDF. Called from: print button click listener.
- initCataloguePage(): Validates URL parameter, queries storage, handles empty or not-found states, and renders catalogue. Called from: end of file on page load.
Viva questions this file may raise:
- How does running numbering work across multiple rooms? The start number is passed down through each space section and updated monotonically so numbering continues continuously (1, 2, 3...) across the whole catalogue.
- How does the print stylesheet guarantee museum wall placards do not split across pages? The print media query sets `break-inside: avoid` and `page-break-inside: avoid` on `.label-card`, forcing the browser's PDF/print renderer to keep each placard intact on a single page.

## Phase 9: Dashboard and sample data
Files: index.html, js/dashboard.js

### dashboard.js
Purpose: Displays gallery inventory counts, lists active and upcoming exhibitions with room occupancy lines, and provides demonstration sample data seeding and database reset tools.
- isStoreEmpty(data): Checks whether all core entity collections in localStorage are empty. Called from: renderDashboard, handleLoadSampleClick.
- renderCounts(data): Renders the four inventory figures in the dashboard count row. Called from: renderDashboard.
- buildSpaceUsageLine(data, exId, spaceId): Formats a room occupancy string displaying current placements over capacity (e.g. 'North Hall 3 / 6'). Called from: renderOnNowExhibitions.
- renderOnNowExhibitions(data): Lists ongoing exhibitions with dates, placement counts, links, and per-space occupancy lines. Called from: renderDashboard.
- renderUpcomingExhibitions(data): Lists upcoming exhibitions ordered chronologically by start date. Called from: renderDashboard.
- renderDashboard(): Toggles empty state view or populated dashboard metrics. Called from: init, handleLoadSampleClick, handleEraseAllClick.
- formatOffsetDate(days): Calculates a YYYY-MM-DD date string relative to current day. Called from: getSampleSchedule.
- getSampleArtists(): Returns four fictional artist records for demonstration. Called from: loadSampleData.
- getSampleSpaces(): Returns three gallery space records with realistic capacities. Called from: loadSampleData.
- getSampleArtworks(): Returns nine artworks spanning available, reserved, and sold statuses. Called from: loadSampleData.
- getSampleSchedule(): Builds three exhibitions (Closed, On now, Upcoming) and seven placements relative to today. Called from: loadSampleData.
- loadSampleData(): Seeds localStorage with full demo dataset if store is empty. Called from: handleLoadSampleClick.
- handleLoadSampleClick(): Confirms and populates sample records if store is empty, or shows explanatory error. Called from: load sample button click listener.
- handleEraseAllClick(): Confirms and resets database to an empty structure. Called from: erase all button click listener.
- initDashboard(): Renders top navigation, loads data, draws dashboard, and binds action listeners. Called from: end of file on page load.
Viva questions this file may raise:
- Why are exhibition dates in the sample data calculated dynamically relative to today? To guarantee that whenever an examiner or visitor loads the sample data, they will always see an active 'On now' exhibition and an 'Upcoming' exhibition without date values expiring.
- Why can sample data only be loaded into an empty gallery? To protect existing user records from being overwritten or creating duplicate conflicting IDs and schedules.

## Phase 10: Curatorial Visual Foundation & Dashboard Redesign
Files: css/style.css, js/ui.js, index.html, js/dashboard.js

### ui.js
Purpose: Provides reusable user-interface helpers for masthead navigation, curatorial status badges, visual room occupancy meter bars, currency/date formatting, and message banners.
- getArchivalTodayString(): Formats the current local date into an archival day-month-year string. Called from: renderNav.
- renderNav(activePage): Draws the sticky masthead with gallery brandmark, subtitle, navigation links, active page highlight, and live date. Called from: all pages on load.
- renderStatusBadge(status): Generates an editorial badge with indicator dot for exhibitions and artworks. Called from: dashboard, exhibitions, artworks.
- renderOccupancyBar(current, capacity): Builds an accessible graphical occupancy meter bar with percentage fill and capacity ratio. Called from: buildSpaceUsageHtml, spaces, exhibition view.
Viva questions this file may raise:
- How does renderOccupancyBar determine its visual color tiers? It computes the percentage of room capacity: under 70% gets sage green, 70% to 99% gets warm ochre, and 100% full gets vermilion red.

### dashboard.js
Purpose: Renders the curatorial overview dashboard with archival stat counters, exhibition feature cards, graphical room occupancy bars, and demonstration maintenance tools.
- buildSpaceUsageHtml(data, exId, spaceId): Renders a room occupancy block featuring the space name and a visual capacity meter bar. Called from: renderOnNowExhibitions.
- renderOnNowExhibitions(data): Displays live exhibitions as prominent feature cards with dates, curatorial notes, spatial occupancy bars, and direct action buttons. Called from: renderDashboard.
- renderUpcomingExhibitions(data): Displays scheduled upcoming exhibitions in chronological order with dates and planned artwork counts. Called from: renderDashboard.
Viva questions this file may raise:
- How does the dashboard show room capacity without guessing future bookings? It checks placements specifically associated with each running exhibition and compares them to the physical capacity of the assigned gallery hall.

## Phase 11: Public Art Gallery Redirection & Homepage Reconstruction
Files: index.html, dashboard.html, js/home.js, js/dashboard.js, js/ui.js, css/style.css, img/hero-gallery.svg, img/exhibition-*.svg, img/artwork-*.svg, img/space-*.svg, img/artist-silhouette.svg

### home.js
Purpose: Manages dynamic rendering of the public art gallery homepage, connecting stored exhibition, artwork, artist, and space data with local visual plates and live archive metrics.
- getArtworkImage(artwork): Maps an artwork id to its corresponding local SVG plate. Called from: buildArtworkCard.
- getExhibitionImage(exhibition): Maps an exhibition id to its curated local SVG visual plate. Called from: buildExhibitionCard.
- getSpaceImage(space): Maps a gallery space to its architectural perspective SVG. Called from: buildSpaceCard.
- renderHeroTicker(data): Renders the collection summary statistics in the hero section. Called from: renderHomePage.
- buildExhibitionCard(data, ex): Constructs the HTML card for a featured exhibition with image plate, dates, and buttons. Called from: renderExhibitions.
- renderExhibitions(data): Filters and draws on now and upcoming exhibitions into the programme section. Called from: renderHomePage.
- buildArtworkCard(data, art): Constructs the HTML card for an artwork with medium, price in INR, and availability badge. Called from: renderArtworks.
- renderArtworks(data): Renders up to six curated catalogued artworks into the collection showcase grid. Called from: renderHomePage.
- buildArtistCard(data, artist): Constructs an artist spotlight card with silhouette emblem, style, bio, and catalogued work count. Called from: renderArtists.
- renderArtists(data): Renders registered artist profile cards into the roster spotlight. Called from: renderHomePage.
- buildSpaceCard(data, space): Constructs an architectural space card with room SVG and occupancy meter. Called from: renderSpaces.
- renderSpaces(data): Renders physical gallery display rooms into the spaces grid. Called from: renderHomePage.
- renderHomePage(): Coordinates rendering across all five homepage sections and checks empty state. Called from: initHomePage.
- initHomePage(): Initializes the navigation, loads storage data, and triggers homepage rendering. Called from: end of file on startup.
Viva questions this file may raise:
- Why does the homepage load data from localStorage instead of hardcoding featured artworks? To maintain unified data integration with the Curatorial Workspace, ensuring that any artworks, artists, or exhibitions added or placed by staff immediately appear across the public gallery presentation.
- Why are visual plates stored locally as SVGs rather than fetched from external image URLs? To guarantee that the site functions 100% offline via file:// with zero third-party network dependencies, maintaining privacy, stability, and fast rendering.

## Phase 12: Exhibitions Experience: From Records to Real Exhibitions
Files: exhibitions.html, js/exhibitions.js, exhibition.html, js/exhibition.js, css/style.css

### exhibitions.js
Purpose: Powers the exhibitions directory with dynamic category filtering, prominent live exhibition spotlights, and a collapsible curatorial scheduling desk.
- getExhibitionImage(ex): Maps an exhibition id to its curated SVG visual plate. Called from: buildExhibitionCard.
- validateExhibition(title, start, end, desc, editId): Enforces required fields, date order, description length, and clash rules. Called from: handleFormSubmit.
- toggleAdminDesk(show): Toggles visibility of the collapsible curatorial scheduling desk panel. Called from: action buttons.
- resetExhibitionForm(): Clears inputs and resets form text to create mode. Called from: cancel button and after saving.
- setFormForEdit(ex): Pre-populates fields with an exhibition record and opens the desk in edit mode. Called from: handleCardActionClick and URL query params.
- buildExhibitionCard(ex, isSpotlight): Generates HTML for either an asymmetric featured spotlight or an editorial directory card. Called from: renderExhibitionsDisplay.
- getFilteredExhibitions(): Sorts exhibitions newest-first and filters by active status tab. Called from: renderExhibitionsDisplay.
- renderExhibitionsDisplay(): Coordinates rendering the featured exhibition spotlight and directory cards. Called from: init and filter clicks.
- saveExhibition(id, title, theme, desc, start, end): Creates or updates an exhibition in localStorage. Called from: handleFormSubmit.
- handleFormSubmit(event): Validates inputs, saves the exhibition, and updates the view. Called from: form submit listener.
- handleCardActionClick(event): Handles card Edit and Delete button clicks, confirming and cascading deletions to placements. Called from: click listeners on exhibition cards.
- handleFilterClick(event): Toggles active tab and re-filters the display without page reloads. Called from: filter bar click listener.
- initExhibitionsPage(): Initializes navigation, loads storage data, and attaches all listeners. Called from: end of file on startup.
Viva questions this file may raise:
- Why is the exhibition management form hidden by default in a collapsible curatorial desk? To separate public visitor discovery from staff administration, presenting an art-directed exhibition programme while preserving instant access to scheduling tools.
- How does the page filter exhibitions without reloading? It uses plain JavaScript array filtering over galleryData.exhibitions in memory and re-renders the container on tab clicks.

### exhibition.js
Purpose: Manages the individual exhibition experience, presenting placed artworks grouped by gallery rooms with live occupancy meters and curatorial placement controls.
- getExhibitionImage(ex): Maps an exhibition to its local SVG visual plate. Called from: renderExhibitionHero.
- getArtworkImage(art): Maps an artwork to its local SVG illustration file. Called from: buildArtworkPlacard.
- getEligibleArtworks(exId): Filters artworks that are not sold, not already in this exhibition, and not scheduled in an overlapping exhibition. Called from: populatePlacementDropdowns.
- getEligibleSpaces(exId): Filters display spaces not used by an overlapping exhibition and having remaining capacity. Called from: populatePlacementDropdowns.
- updatePlacementButton(hasArtworks, hasSpaces): Enables or disables the placement button with clear explanatory feedback. Called from: populatePlacementDropdowns.
- populatePlacementDropdowns(exId): Populates artwork and space dropdowns with eligible records and remaining room counts. Called from: init and after placement changes.
- renderExhibitionHero(ex): Renders the exhibition display title, dates, theme, description, hero visual plate, and catalogue navigation links. Called from: initExhibitionPage.
- buildArtworkPlacard(placement): Builds a museum wall placard card for an artwork with medium, year, valuation, status, and remove button. Called from: renderRoomsAndPlacements.
- renderRoomsAndPlacements(exId): Groups placements by display space and renders room headers, visual occupancy bars, and artwork placard grids. Called from: init and after placement changes.
- handlePlacementSubmit(event): Validates placement against business rules BR5 through BR9, saves, and updates the view. Called from: form submit listener.
- handleRoomsClick(event): Handles the placement remove button to unassign a piece without deleting the artwork. Called from: room container click listener.
- initExhibitionPage(): Reads ?id= from query params, finds the exhibition, and coordinates rendering or shows not-found state. Called from: end of file on startup.
Viva questions this file may raise:
- What happens when a user removes a placement from an exhibition? It deletes only the placement record linking the artwork to the room; the original artwork record remains completely intact in the gallery collection.
- How does the placement interface prevent double-booking rooms? getEligibleSpaces checks checkSpaceOverlap to exclude any room currently reserved by another exhibition whose start and end dates intersect with this exhibition.

## Phase 13: Artworks & Collection: A Real Gallery Experience
Files: artworks.html, js/artworks.js, css/style.css

### artworks.js
Purpose: Powers the curated collection experience with an image-led artwork grid, instant multi-filtering, curatorial artwork dossier drawer, and collapsible accession desk.
- getArtworkImage(art): Maps an artwork id to its local SVG illustration plate. Called from: buildArtworkCard, openArtworkDetail.
- populateArtistDropdowns(): Populates the artist selector in both the accession desk and collection filter bar. Called from: initArtworksPage.
- updateBuyerFieldVisibility(): Toggles the buyer input visibility depending on whether the status is Sold. Called from: status change listener, setFormForEdit, resetArtworkForm.
- validateArtwork(artistId, title, year, medium, price, status, buyer, editId): Enforces required fields, positive price, valid historical year range, buyer when sold, and BR13 active exhibition restrictions. Called from: handleFormSubmit.
- toggleAdminDesk(show): Toggles visibility of the collapsible curatorial accession desk. Called from: toggle button and form submit/cancel.
- resetArtworkForm(): Clears inputs, hides buyer field, and resets the form to creation mode. Called from: cancel button and after saving.
- setFormForEdit(art): Populates form fields with existing artwork data and opens the accession desk for editing. Called from: handleActionClick.
- getFilteredArtworks(): Filters galleryData.artworks by search term, artist, and availability status. Called from: renderCollection.
- buildArtworkCard(art, artistName, isFeatured): Builds the HTML for an image-led artwork card in the gallery grid with visual plate, medium, dimensions, price in INR, and status badge. Called from: renderCollection.
- renderCollection(): Renders filtered artworks into both the image-led gallery grid and the staff inventory table, updating live collection counts. Called from: initArtworksPage, filters, form submission, and deletion.
- openArtworkDetail(artId): Opens the slide-over dossier showing full artwork metadata, valuation, and past/current exhibition room placements with direct links. Called from: handleActionClick (Explore / View).
- handleFormSubmit(event): Validates inputs, saves or updates the artwork in localStorage, and redraws the collection. Called from: artworkForm submit listener.
- setViewMode(mode): Toggles between the image-led Gallery Grid view and the compact staff Tabular Inventory view. Called from: handleActionClick (view-gallery, view-inventory).
- handleActionClick(event): Delegated click handler managing Explore, Edit, Delete (with BR10 safeguards), filter clearing, and drawer closing. Called from: document click listener.
- initArtworksPage(): Initializes navigation, loads storage data, populates dropdowns, renders collection, and binds event listeners. Called from: end of file on startup.
Viva questions this file may raise:
- Why does the collection provide both a Gallery Grid and an Inventory Table? The Gallery Grid provides the public visitor-facing experience with visual artwork plates and tactile framing, while the Inventory Table provides an efficient tabular view for curatorial staff managing archive records. Both views share the same real-time search and filter state.
- How does the artwork detail drawer show where an artwork is exhibited? It queries getPlacementsForArtwork(galleryData, art.id), then resolves the exhibition and room space names via findExhibitionById and findSpaceById, displaying active status badges and links to each exhibition.
- How is business rule BR10 enforced when deleting an artwork? canDeleteArtwork checks if the artwork has any placements in data.placements; if so, deletion is blocked with "Remove it from its exhibitions first."

## Phase 14: Artists & Profiles: The People Behind the Collection
Files: artists.html, js/artists.js, artist.html, js/artist.js, css/style.css

### artists.js
Purpose: Powers the living artists roster directory with live search filtering, architectural initials seal plates, and a collapsible curatorial registration desk.
- getArtistInitials(name): Computes up to two uppercase letters from the artist's full name for the archival seal. Called from: buildArtistCard.
- validateArtist(name, born, bio, ignoreId): Validates required name (BR15), unique artist name (BR1), 4-digit birth year range, and 400-character bio limit. Called from: handleFormSubmit.
- toggleAdminDesk(show): Toggles visibility of the collapsible curatorial registration desk. Called from: toggleAdminBtn and form events.
- resetArtistForm(): Resets input fields and restores the form to creation mode. Called from: cancelBtn and after saving.
- setFormForEdit(artist): Pre-fills inputs with the artist's data and opens the registration desk in edit mode. Called from: handleActionClick (edit).
- getFilteredArtists(filterText): Filters in-memory artists matching the search query case-insensitively. Called from: renderArtists.
- buildArtistCard(artist, artworkCount, isFeatured): Builds the HTML for an artist editorial tile with archival seal, discipline tag, nationality, birth year, catalogued works counter, bio snippet, and dossier links. Called from: renderArtists.
- renderArtists(filterText): Renders the filtered artists into both the editorial roster grid and the staff tabular registry. Called from: initArtistsPage, search input, and CRUD handlers.
- saveArtistRecord(id, name, born, nationality, style, bio): Creates or updates an artist in localStorage. Called from: handleFormSubmit.
- handleFormSubmit(event): Validates inputs, saves the artist record, and redraws the directory. Called from: artistForm submit listener.
- setViewMode(mode): Toggles between the Editorial Roster Grid and the Staff Tabular Registry. Called from: handleActionClick (view-grid, view-table).
- handleActionClick(event): Delegated click handler managing Edit, Delete (with BR2 validation), view toggling, and search reset. Called from: document click listener.
- initArtistsPage(): Initializes navigation, loads storage data, renders artists, and attaches form and search listeners. Called from: end of file on startup.
Viva questions this file may raise:
- How does the Artists Directory avoid fabricated portraits? Instead of arbitrary stock photos or AI-generated faces, each artist is rendered with an archival monogram seal derived from their actual initials and curated typography.
- How does the application enforce business rule BR2 during artist deletion? canDeleteArtist checks if getArtworksForArtist(data, artistId).length > 0; if artworks belong to the artist, deletion is safely blocked with "Delete or reassign this artist's artworks first."

### artist.js
Purpose: Generates the individual artist monograph and portfolio page, presenting their identity, biography, catalogued oeuvre, and exhibition history.
- getArtistInitials(name): Computes initials for the prominent curatorial monograph hero plate. Called from: renderProfile.
- getArtworkImage(art): Resolves the local SVG visual plate for an artwork record. Called from: buildArtistWorksGrid.
- getExhibitionsForArtist(artistId): Gathers all unique exhibitions where the artist's works are placed, eliminating duplicate entries when multiple works share a show. Called from: renderProfile.
- buildArtistWorksGrid(artworks): Generates the curated artworks showcase grid with local plates, medium, year, valuation, and status pills. Called from: renderProfile.
- buildExhibitionsTimeline(exhibitions): Generates a chronological exhibition record list with exhibition links, themes, dates, and active status badges. Called from: renderProfile.
- renderProfile(artist): Coordinates the complete four-part narrative flow (Identity Hero -> Curatorial Practice Biography -> Catalogued Oeuvre -> Exhibition Record). Called from: initArtistProfile.
- renderNotFound(): Displays a graceful fallback when an invalid or missing artist id is supplied in the URL query string. Called from: initArtistProfile.
- initArtistProfile(): Reads ?id= from URL query parameters, loads storage data, and renders the artist profile. Called from: end of file on startup.
Viva questions this file may raise:
- How does the artist monograph prevent duplicate exhibitions in the history section? getExhibitionsForArtist checks an array of unique exhibition IDs (exhibitionIds.indexOf(exId) === -1) across all placements of all artworks by the artist, ensuring each exhibition appears exactly once in chronological order.
- What happens if an invalid ?id= query parameter is provided? initArtistProfile detects that findArtistById returns undefined and calls renderNotFound(), displaying a dignified archival empty state with a working link back to the Artists Directory.

## Phase 15: Gallery Spaces: The Architecture of an Exhibition
Files: spaces.html, js/spaces.js, css/style.css

### spaces.js
Purpose: Powers the physical exhibition architecture experience with spatial perspective plates, live aggregate capacity metrics, exhibition-specific occupancy gauges, and curatorial room allocation controls.
- getSpaceImage(space): Maps a display space name to its local architectural perspective SVG illustration. Called from: buildSpaceCard.
- validateSpace(name, capacity, ignoreId): Validates non-empty name (BR15), unique space name (BR3), and integer capacity between 1 and 100 (BR15). Called from: handleFormSubmit.
- toggleAdminDesk(show): Toggles visibility of the collapsible curatorial space allocation desk. Called from: toggleAdminBtn and form handlers.
- resetSpaceForm(): Clears inputs and returns form heading and buttons to creation mode. Called from: cancelBtn and after saving.
- setFormForEdit(space): Pre-populates the form with existing space data and opens the allocation desk in edit mode. Called from: handleActionClick (edit).
- getSpaceExhibitionData(spaceId): Analyzes placements for a space, counts artworks per exhibition, distinguishes the current active show ('On now') from upcoming or past exhibitions, and sorts exhibitions newest first. Called from: buildSpaceCard, renderSpaces.
- buildSpaceCard(space, index, isProminent): Generates HTML for an architectural space presentation card featuring illustrative room perspective, capacity blueprint, live exhibition occupancy gauge, and linked exhibition roster. Called from: renderSpaces.
- renderSpaces(): Computes gallery-wide aggregate metrics (total wings, combined artwork slots, active wings in use) and renders cards into the spatial directory grid and staff tabular registry. Called from: initSpacesPage and CRUD operations.
- saveSpaceRecord(id, name, capacity, note): Saves or updates a space record in localStorage. Called from: handleFormSubmit.
- handleFormSubmit(event): Validates inputs, saves space data, resets form, and updates the view. Called from: spaceForm submit listener.
- setViewMode(mode): Toggles between the Spatial Directory Grid and the Staff Tabular Registry. Called from: handleActionClick (view-grid, view-table).
- handleActionClick(event): Delegated click handler managing Edit, Delete (with BR11 validation), view toggles, and admin desk triggers. Called from: document click listener.
- initSpacesPage(): Initializes navigation, loads storage data, renders spaces, and binds event listeners. Called from: end of file on startup.
Viva questions this file may raise:
- Why is room occupancy calculated strictly per active exhibition rather than summed across all placements? Placements occur across different exhibition periods. Summing historical placements would falsely mark a room as permanently occupied even when it is currently free or in transition between shows.
- How does the space management interface enforce business rule BR11? canDeleteSpace checks if getPlacementsForSpace(data, spaceId).length > 0; if any placements link to the space, deletion is blocked with "This space is in use."

## Phase 16: The Curatorial Management Studio
Files: dashboard.html, js/dashboard.js, css/style.css

### dashboard.js
Purpose: Powers the Curatorial Management Studio workspace with high-density operational metrics, quick management workflows, active exhibition occupancy cards, and archive maintenance tools.
- isStoreEmpty(data): Checks whether all core gallery collections in localStorage contain zero records. Called from: renderDashboard, handleLoadSampleClick.
- renderCounts(data): Draws the primary archive inventory cards (artists, artworks, spaces, exhibitions). Called from: renderDashboard.
- renderOperationalStrip(data): Computes real-time artwork availability counts (Available, Reserved, Sold) and active physical space utilization (wings in live exhibition). Called from: renderDashboard.
- buildSpaceUsageHtml(data, exId, spaceId): Builds an exhibition room occupancy gauge bar showing filled slots against capacity. Called from: renderOnNowExhibitions.
- renderOnNowExhibitions(data): Displays running exhibitions with dates, placement counts, participating rooms, space capacity utilization, and direct management shortcuts. Called from: renderDashboard.
- renderUpcomingExhibitions(data): Renders a chronological schedule of upcoming exhibitions with planned placement counts and direct management links. Called from: renderDashboard.
- renderDashboard(): Coordinates rendering between the empty onboarding state and the active curatorial workspace. Called from: initDashboard, sample load, and erase actions.
- formatOffsetDate(days): Computes calendar date strings offset from today's date for seed demonstrations. Called from: getSampleDataset.
- getSampleDataset(): Assembles complete demonstration records (artists, spaces, artworks, exhibitions, placements) for examiners. Called from: loadSampleData.
- loadSampleData(): Serializes demonstration records into localStorage. Called from: handleLoadSampleClick.
- handleLoadSampleClick(): Validates the store is empty, requests confirmation, and loads sample data. Called from: loadSampleBtn and emptyLoadSampleBtn listeners.
- handleEraseAllClick(): Prompts for confirmation and resets all gallery data in localStorage. Called from: eraseAllBtn click listener.
- initDashboard(): Connects workspace navigation, loads storage data, and attaches maintenance listeners. Called from: end of file on startup.
Viva questions this file may raise:
- Why does Gallery Ledger have both a public homepage and a Curatorial Studio dashboard? The public homepage prioritises visual storytelling, editorial showcases, and visitor discovery, while the Curatorial Studio prioritises information density, operational status, data relationships, and immediate administrative shortcuts for staff.
- How do the quick management action buttons open the add/edit forms automatically on target pages? The quick action buttons pass ?action=new in the query string; upon loading, each management page (artists.html, artworks.html, spaces.html, exhibitions.html) detects this parameter and automatically invokes toggleAdminDesk(true).

## Phase 17: Curatorial Content Production & Complete Gallery Population (Phase 6.5)
Files: js/demo-data.js, js/storage.js, js/ui.js, img/*.svg, docs/PRD.md

### demo-data.js
Purpose: Constructs and serves the deterministic curated demonstration dataset connecting the Official Academic Team: Sukhmanpreet Kaur and Sonam Verma alongside Salik Riyaz's demonstration artist profile (identified strictly as sample content, not academic team membership; Original Website Development Credit: Salik Riyaz (External Contributor)), three architectural spaces, three scheduled exhibitions, twelve conceptual artworks, and twelve non-overlapping placements.
- formatOffsetDate(days): Computes calendar date strings offset from today's date for dynamic relative exhibition scheduling. Called from: getDemoExhibitions.
- getDemoArtists(): Returns demonstration artist records for the Official Academic Team: Sukhmanpreet Kaur and Sonam Verma; Salik Riyaz's demonstration artist profile is sample content, not academic team membership. Called from: getCuratedDemoData.
- getDemoSpaces(): Returns the three architectural gallery spaces (North Gallery, Project Room, Screening Alcove). Called from: getCuratedDemoData.
- getDemoExhibitions(): Returns the three scheduled exhibitions demonstrating active ('The Act of Looking'), upcoming ('Rooms for Light'), and closed ('Notes in Matter') states. Called from: getCuratedDemoData.
- getDemoArtworks(): Returns the twelve conceptual demonstration artworks (4 artworks associated with each of the three sample artist profiles) with valid prices, mediums, dimensions, and statuses. Called from: getCuratedDemoData.
- getDemoPlacements(): Returns the twelve non-overlapping artwork assignments to gallery spaces strictly complying with capacity, sold-artwork, and date-overlap rules. Called from: getCuratedDemoData.
- getCuratedDemoData(): Assembles and returns the full unified curated demonstration repository with nextId set to 34. Called from: loadData in storage.js and loadSampleData in dashboard.js.

## Milestone A & B: The Warm Gallery Redirection & Homepage Rebuild
Files: index.html, js/home.js, js/ui.js, css/style.css, AGENTS.md, docs/PRD.md

### Overview & Architecture
Transforms Gallery Ledger from a rigid administrative dashboard into a warm, expressive, and tactile contemporary art gallery website while strictly preserving all underlying management logic and business rules. The platform clearly delineates two connected layers:
1. **Visitor Experience (Default, Public, Read-Only):** An art-centric public gallery offering exhibition exploration, collection browsing, living artist monographs, and space architecture. Completely free from administrative forms, deletion buttons, or database clutter.
2. **Organiser Workspace (Curatorial Studio):** A dedicated staff management suite accessed via the Curatorial Studio nav link, preserving all add/edit/delete forms, space allocation rules, placement conflict checks, and catalogue generation.
3. **Honest Access-Control & Publishing:** A static client-side project cannot provide cryptographic security. Rather than implementing fake passwords or hidden links, the site operates read-only for visitors, persists staff edits locally in `localStorage`, and supports a genuine static publishing workflow (exporting data to update `js/demo-data.js` and publishing to GitHub Pages).

### home.js
Purpose: Powers the public contemporary gallery landing page with dataset-driven showcases, collection highlights, artist dossiers, architectural spaces, and entrance/scroll animations.
- renderHeroTicker(data): Computes and displays live collection metrics (active programmes, artworks, artists, wings) in a warm paper well. Called from: renderHomePage.
- buildExhibitionCard(data, ex): Constructs image-led editorial HTML for an exhibition card with dates, theme, placements summary, and direct links. Called from: renderExhibitions.
- renderExhibitions(data): Filters and renders running ('On now') and upcoming seasonal exhibitions into the programme showcase. Called from: renderHomePage.
- buildArtworkCard(data, art): Formats a tactile artwork plate with local SVG illustration, medium tag, availability status badge, artist link, and INR price. Called from: renderArtworks.
- renderArtworks(data): Selects and populates up to 6 catalogued artworks into the collection showcase grid. Called from: renderHomePage.
- buildArtistCard(data, artist): Builds personable artist spotlights highlighting creative discipline, concise bio, artwork tally, and link to artist profile. Called from: renderArtists.
- renderArtists(data): Renders all living artists into the roster directory grid. Called from: renderHomePage.
- buildSpaceCard(data, space): Constructs architectural room cards showcasing physical ambiance, natural light notes, and wall capacity. Called from: renderSpaces.
- renderSpaces(data): Populates the architectural display rooms grid. Called from: renderHomePage.
- setupScrollReveals(): Initializes IntersectionObserver to gently reveal sections as they scroll into view, respecting reduced motion preferences. Called from: renderHomePage.
- renderHomePage(): Coordinates rendering of ticker, exhibitions, artworks, artists, spaces, and scroll reveals. Called from: initHomePage.
- initHomePage(): Renders warm navigation, loads data from localStorage, and triggers homepage rendering. Called from: end of file on startup.

### ui.js (Navigation & Badges)
Purpose: Manages global navigation, responsive drawer toggles, and archival formatting helpers across the platform.
- renderNav(activePage): Injects responsive masthead navigation with brand block, public links, mobile menu toggle button, Curatorial Studio link, and archival date. Called from: startup of each page.

Viva questions this milestone may raise:
- *Why doesn't the public website include "Add Artist" or "Manage Collection" buttons on the homepage?*
  The public website is intentionally tailored for art lovers, collectors, and exhibition visitors; administrative tools are cleanly segregated into the dedicated Curatorial Studio (`dashboard.html`) to deliver a genuine gallery experience without visual confusion.
- *How does the platform handle access control without a backend or server authentication?*
  Honestly and transparently: as a static client-side project, cryptographic security is impossible; the public website is read-only by default, organiser modifications persist in browser `localStorage`, and site updates follow an authentic static publishing workflow where approved data is exported and committed to `demo-data.js`.
- *How is room occupancy calculated on the public homepage versus the curatorial workspace?*
  The public homepage highlights architectural character and active installations, whereas the curatorial workspace tracks precise operational capacity for running exhibitions, avoiding stale or historical closed placements from distorting room availability.
- *How does the animation system respect user accessibility?*
  CSS keyframes and IntersectionObserver reveals strictly respect `@media (prefers-reduced-motion: reduce)`, immediately displaying all elements without delays or transform shifts.




