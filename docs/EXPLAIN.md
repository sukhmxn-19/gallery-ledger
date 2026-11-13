# How the pages connect

This trace follows one complete workflow across the gallery system from initial record creation to printable catalogue output, naming the primary function executing at each step:

1. **Add Artist**:
   - User opens `artists.html`. `initArtistsPage()` calls `loadData()` and `renderArtistsTable()`.
   - User fills in name, birth year, nationality, style, bio, and clicks "Add artist".
   - `handleFormSubmit()` validates inputs using `validateArtist()` (checking `checkArtistName()` for BR1 and `checkRequired()` for BR15).
   - Generates ID using `getNextId()`, pushes new artist to `data.artists`, calls `saveData()`, and updates the table via `renderArtistsTable()`.

2. **Add Artwork**:
   - User opens `artworks.html`. `initArtworksPage()` calls `loadData()` and populates the artist selector via `populateArtistDropdowns()`.
   - User selects the artist, enters title, year, medium, size, price, and status, and submits.
   - `handleFormSubmit()` calls `validateArtwork()` (validating positive price, valid year bounds, and buyer requirement if sold).
   - Generates ID via `getNextId()`, appends artwork to `data.artworks`, calls `saveData()`, and updates the table via `renderArtworksTable()`.

3. **Create Space**:
   - User opens `spaces.html`. `initSpacesPage()` calls `loadData()` and `renderSpacesTable()`.
   - User enters space name (e.g., "North Hall"), capacity (1–100), and note, then submits.
   - `handleFormSubmit()` calls `validateSpace()` (verifying uniqueness via `checkSpaceName()` for BR3 and capacity range for BR15).
   - Generates ID via `getNextId()`, appends space to `data.spaces`, calls `saveData()`, and refreshes `renderSpacesTable()`.

4. **Create Exhibition**:
   - User opens `exhibitions.html`. `initExhibitionsPage()` calls `loadData()` and `renderExhibitionsTable()`.
   - User enters title, theme, description, start date, and end date, then submits.
   - `handleFormSubmit()` calls `validateExhibition()` (validating uniqueness with `checkExhibitionTitle()` for BR3 and date order with `checkExhibitionDatesOrder()` for BR4).
   - Generates ID via `getNextId()`, appends exhibition to `data.exhibitions`, calls `saveData()`, and redraws table sorted newest first.

5. **Place Artwork in Exhibition**:
   - User clicks the exhibition title link, opening `exhibition.html?id=N`.
   - `initExhibitionPage()` reads `?id=` via `getIdFromUrl()`, queries `findExhibitionById()`, and populates eligible dropdowns via `populatePlacementDropdowns()` and existing assignments via `renderPlacements()`.
   - User picks an eligible artwork and space with remaining capacity, then clicks "Place artwork".
   - `handlePlacementSubmit()` verifies `checkPlacement()` covering BR5 (not Sold), BR6 (no artwork schedule overlap), BR7 (no room double-booking), BR8 (room capacity limit), and BR9 (no duplicate placement).
   - Assigns placement ID with `getNextId()`, appends to `data.placements`, calls `saveData()`, and updates room groupings and dropdown options.

6. **Open Printable Catalogue**:
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
