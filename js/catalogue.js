// Printable catalogue logic: wall labels, running numbering, and print trigger.

const notFoundView = document.getElementById('not-found');
const emptyStateView = document.getElementById('empty-state');
const catalogueView = document.getElementById('catalogue-view');
const emptyPlaceLink = document.getElementById('empty-place-link');
const backLink = document.getElementById('back-link');
const printBtn = document.getElementById('print-btn');
const catTitle = document.getElementById('cat-title');
const catMeta = document.getElementById('cat-meta');
const catDesc = document.getElementById('cat-desc');
const catSpaces = document.getElementById('cat-spaces');
const catSummary = document.getElementById('cat-summary');
let galleryData = null;

// Counts the number of distinct artists represented across an array of artworks.
function countUniqueArtists(artworks) {
  const ids = [];
  for (let i = 0; i < artworks.length; i++) {
    if (artworks[i] && ids.indexOf(artworks[i].artistId) === -1) {
      ids.push(artworks[i].artistId);
    }
  }
  return ids.length;
}

// Calculates the sum of prices for all artworks with Available status.
function calculateAvailableTotal(artworks) {
  let total = 0;
  for (let i = 0; i < artworks.length; i++) {
    if (artworks[i] && artworks[i].status === 'Available') {
      total += artworks[i].price;
    }
  }
  return total;
}

// Builds the HTML placard for a single artwork with running number and details.
function buildLabelCardHtml(art, artist, number) {
  const artistName = artist ? artist.name.toUpperCase() : 'UNKNOWN ARTIST';
  const metaParts = [];
  if (art.year) metaParts.push(art.year);
  if (art.medium) metaParts.push(art.medium);
  if (art.size) metaParts.push(art.size);
  const metaText = metaParts.join(' · ');
  let priceHtml = '';
  if (art.status === 'Sold') {
    priceHtml = '<span class="sold">Sold</span>';
  } else {
    priceHtml = formatPrice(art.price);
  }
  return `<div class="label-card">
    <div class="label-num">No. ${number}</div>
    <div class="label-artist">${escapeHtml(artistName)}</div>
    <div class="label-title">${escapeHtml(art.title)}</div>
    <div class="label-meta">${escapeHtml(metaText)}</div>
    <div class="label-price">${priceHtml}</div>
  </div>`;
}

// Generates the HTML for one space and its placed artwork cards.
function buildSpaceSectionHtml(space, spacePlacements, startNumber) {
  let html = `<h2>${escapeHtml(space.name)}</h2>`;
  let currentNum = startNumber;
  for (let i = 0; i < spacePlacements.length; i++) {
    const art = findArtworkById(galleryData, spacePlacements[i].artworkId);
    if (art) {
      const artist = findArtistById(galleryData, art.artistId);
      html += buildLabelCardHtml(art, artist, currentNum);
      currentNum++;
    }
  }
  return { html: html, nextNumber: currentNum };
}

// Returns unique spaces for placements sorted alphabetically by name.
function getSortedSpaces(placements) {
  const spaceIds = [];
  for (let i = 0; i < placements.length; i++) {
    if (spaceIds.indexOf(placements[i].spaceId) === -1) spaceIds.push(placements[i].spaceId);
  }
  const spaces = [];
  for (let j = 0; j < spaceIds.length; j++) {
    const s = findSpaceById(galleryData, spaceIds[j]);
    if (s) spaces.push(s);
  }
  return spaces.sort(function (a, b) {
    return a.name.localeCompare(b.name);
  });
}

// Renders all catalogue sections sorted by space name, with closing summary.
function renderCatalogueSections(placements) {
  const spaces = getSortedSpaces(placements);
  let fullHtml = '';
  let runningNumber = 1;
  const allArtworks = [];
  for (let k = 0; k < spaces.length; k++) {
    const space = spaces[k];
    const sPlacements = placements.filter(function (p) { return p.spaceId === space.id; });
    const section = buildSpaceSectionHtml(space, sPlacements, runningNumber);
    fullHtml += section.html;
    runningNumber = section.nextNumber;
  }
  catSpaces.innerHTML = fullHtml;
  for (let m = 0; m < placements.length; m++) {
    const art = findArtworkById(galleryData, placements[m].artworkId);
    if (art) allArtworks.push(art);
  }
  const uniqueArtists = countUniqueArtists(allArtworks);
  const availableSum = calculateAvailableTotal(allArtworks);
  catSummary.textContent = `${allArtworks.length} works · ${uniqueArtists} artists · ${formatPrice(availableSum)} available`;
}

// Populates exhibition header, theme, dates, description, and return links.
function renderCatalogueHeader(ex) {
  catTitle.textContent = ex.title;
  const dates = `${formatDate(ex.startDate)} to ${formatDate(ex.endDate)}`;
  const metaParts = [`Dates: ${dates}`];
  if (ex.theme) metaParts.push(`Theme: ${ex.theme}`);
  catMeta.textContent = metaParts.join(' · ');
  catDesc.textContent = ex.description || '';
  backLink.href = `exhibition.html?id=${ex.id}`;
}

// Triggers the browser print dialog to print or save as PDF.
function handlePrintClick() {
  window.print();
}

// Initializes the catalogue page view based on exhibition ID and placements.
function initCataloguePage() {
  renderNav('Exhibitions');
  galleryData = loadData();
  const id = getIdFromUrl();
  const exhibition = findExhibitionById(galleryData, id);
  if (!exhibition) {
    notFoundView.hidden = false;
    return;
  }
  const placements = getPlacementsForExhibition(galleryData, exhibition.id);
  if (placements.length === 0) {
    emptyStateView.hidden = false;
    emptyPlaceLink.href = `exhibition.html?id=${exhibition.id}`;
    return;
  }
  catalogueView.hidden = false;
  renderCatalogueHeader(exhibition);
  renderCatalogueSections(placements);
  printBtn.addEventListener('click', handlePrintClick);
}

initCataloguePage();
