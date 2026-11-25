// Individual exhibition experience, room occupancy visualizations, and curatorial placement desk.

const notFoundView = document.getElementById('not-found');
const exhibitionView = document.getElementById('exhibition-view');
const titleEl = document.getElementById('exhibition-title');
const datesEl = document.getElementById('exhibition-dates');
const statusEl = document.getElementById('exhibition-status');
const themeEl = document.getElementById('exhibition-theme');
const descEl = document.getElementById('exhibition-desc');
const heroImgEl = document.getElementById('exhibition-hero-img');
const editLink = document.getElementById('edit-exhibition-link');
const catalogueLink = document.getElementById('open-catalogue-link');
const heroCatalogueBtn = document.getElementById('hero-catalogue-btn');
const bannerCatalogueBtn = document.getElementById('banner-catalogue-btn');
const placementForm = document.getElementById('placement-form');
const artworkSelect = document.getElementById('placement-artwork');
const spaceSelect = document.getElementById('placement-space');
const placeBtn = document.getElementById('place-btn');
const disabledReason = document.getElementById('disabled-reason');
const roomsContainer = document.getElementById('rooms-container');
let galleryData = null;
let currentExhibition = null;

// Filters artworks eligible for this exhibition under rules BR5, BR6, and BR9.
function getEligibleArtworks(exId) {
  return galleryData.artworks.filter(function (art) {
    return !checkArtworkNotSold(art) && !checkArtworkNotPlacedTwice(galleryData, exId, art.id) && !checkArtworkOverlap(galleryData, exId, art.id);
  });
}

// Filters spaces not overlapping with other exhibitions and having capacity (BR7, BR8).
function getEligibleSpaces(exId) {
  const result = [];
  for (let i = 0; i < galleryData.spaces.length; i++) {
    const s = galleryData.spaces[i];
    if (!checkSpaceOverlap(galleryData, exId, s.id)) {
      const places = galleryData.placements.filter(function (p) {
        return p.exhibitionId === Number(exId) && p.spaceId === s.id;
      });
      const remaining = s.capacity - places.length;
      if (remaining > 0) result.push({ space: s, remaining: remaining });
    }
  }
  return result;
}

// Updates the place button state and reason when lists are empty.
function updatePlacementButton(hasArtworks, hasSpaces) {
  placeBtn.disabled = !hasArtworks || !hasSpaces;
  if (!hasArtworks && !hasSpaces) disabledReason.textContent = 'No eligible artworks or rooms with capacity remaining.';
  else if (!hasArtworks) disabledReason.textContent = 'No eligible artworks available to place in this exhibition.';
  else if (!hasSpaces) disabledReason.textContent = 'No display rooms with remaining wall capacity available.';
  else disabledReason.textContent = '';
}

// Populates dropdowns with eligible artworks and available spaces.
function populatePlacementDropdowns(exId) {
  artworkSelect.innerHTML = '';
  spaceSelect.innerHTML = '';
  const arts = getEligibleArtworks(exId);
  const spaces = getEligibleSpaces(exId);
  for (let i = 0; i < arts.length; i++) {
    const artist = findArtistById(galleryData, arts[i].artistId);
    const label = `${arts[i].title}, ${artist ? artist.name : 'Unknown'}`;
    artworkSelect.innerHTML += `<option value="${arts[i].id}">${escapeHtml(label)}</option>`;
  }
  for (let j = 0; j < spaces.length; j++) {
    const label = `${spaces[j].space.name} (${spaces[j].remaining} left)`;
    spaceSelect.innerHTML += `<option value="${spaces[j].space.id}">${escapeHtml(label)}</option>`;
  }
  updatePlacementButton(arts.length > 0, spaces.length > 0);
}

// Renders the exhibition hero header, dates, status, and navigation links.
function renderExhibitionHero(ex) {
  titleEl.textContent = ex.title;
  const status = getExhibitionStatus(ex);
  statusEl.innerHTML = renderStatusBadge(status);
  datesEl.innerHTML = `${formatDate(ex.startDate)} &ndash; ${formatDate(ex.endDate)}`;
  themeEl.textContent = ex.theme ? `Theme: ${ex.theme}` : 'General Curatorial Collection';
  descEl.textContent = ex.description || 'Curated seasonal exhibition survey.';
  heroImgEl.src = getExhibitionImage(ex);
  heroImgEl.alt = ex.title;
  editLink.href = `exhibitions.html?id=${ex.id}`;
  catalogueLink.href = `catalogue.html?id=${ex.id}`;
  heroCatalogueBtn.href = `catalogue.html?id=${ex.id}`;
  bannerCatalogueBtn.href = `catalogue.html?id=${ex.id}`;
}

// Builds the HTML card for one placed artwork placard.
function buildArtworkPlacard(placement) {
  const art = findArtworkById(galleryData, placement.artworkId);
  const artist = art ? findArtistById(galleryData, art.artistId) : null;
  const artistName = artist ? artist.name : 'Unknown Artist';
  const title = art ? art.title : 'Untitled Piece';
  const medium = art ? art.medium : 'Fine Art';
  const price = art ? formatPrice(art.price) : '—';
  const img = art ? getArtworkImage(art) : 'img/artwork-morning-shadows.svg';
  return `<article class="placard-item"><img src="${img}" alt="${escapeHtml(title)}" class="placard-img"><div class="placard-content"><div class="placard-meta-top"><span class="placard-medium">${escapeHtml(medium)}</span>${renderStatusBadge(art ? art.status : '')}</div><h4 class="placard-title">${escapeHtml(title)}</h4><p class="placard-artist"><a href="artist.html?id=${art ? art.artistId : 0}">${escapeHtml(artistName)}</a> (${art ? art.year || 'n.d.' : ''})</p><div class="placard-foot"><span class="placard-price">${price}</span><button type="button" class="delete btn-remove" data-id="${placement.id}">Remove</button></div></div></article>`;
}

// Renders existing artwork placements grouped by gallery room with occupancy meters.
function renderRoomsAndPlacements(exId) {
  roomsContainer.innerHTML = '';
  const placements = getPlacementsForExhibition(galleryData, exId);
  if (placements.length === 0) {
    roomsContainer.innerHTML = '<div class="empty-curatorial"><p>No artworks placed in this exhibition yet. Use the Curatorial Placement Desk below to assign works to rooms.</p></div>';
    return;
  }
  const spaceIds = [];
  for (let i = 0; i < placements.length; i++) {
    if (spaceIds.indexOf(placements[i].spaceId) === -1) spaceIds.push(placements[i].spaceId);
  }
  let html = '';
  for (let s = 0; s < spaceIds.length; s++) {
    const space = findSpaceById(galleryData, spaceIds[s]);
    const inSpace = placements.filter(function (p) { return p.spaceId === spaceIds[s]; });
    const cap = space ? space.capacity : inSpace.length;
    let cardsHtml = '';
    for (let c = 0; c < inSpace.length; c++) cardsHtml += buildArtworkPlacard(inSpace[c]);
    html += `<section class="room-section"><div class="room-header"><div class="room-title-block"><h3>${escapeHtml(space ? space.name : 'Gallery Room')}</h3><p class="room-note">${escapeHtml(space ? space.note || 'Display wing' : '')}</p></div><div class="room-meter-col">${renderOccupancyBar(inSpace.length, cap)}</div></div><div class="placard-grid">${cardsHtml}</div></section>`;
  }
  roomsContainer.innerHTML = html;
}

// Handles placing an artwork in a room after validating BR5 through BR9.
function handlePlacementSubmit(event) {
  event.preventDefault();
  const artId = Number(artworkSelect.value);
  const spaceId = Number(spaceSelect.value);
  const error = checkPlacement(galleryData, currentExhibition.id, artId, spaceId);
  if (error) { showMessage(error, true); return; }
  galleryData.placements.push({ id: getNextId(galleryData), exhibitionId: currentExhibition.id, artworkId: artId, spaceId: spaceId });
  saveData(galleryData);
  showMessage('Artwork assigned to room successfully.', false);
  populatePlacementDropdowns(currentExhibition.id);
  renderRoomsAndPlacements(currentExhibition.id);
}

// Handles unassigning an artwork from a gallery room.
function handleRoomsClick(event) {
  const btn = event.target;
  if (!btn.classList.contains('btn-remove')) return;
  const placeId = Number(btn.getAttribute('data-id'));
  galleryData.placements = galleryData.placements.filter(function (p) { return p.id !== placeId; });
  saveData(galleryData);
  showMessage('Artwork placement removed.', false);
  populatePlacementDropdowns(currentExhibition.id);
  renderRoomsAndPlacements(currentExhibition.id);
}

// Initializes the exhibition details view and binds action listeners.
function initExhibitionPage() {
  renderNav('Exhibitions');
  galleryData = loadData();
  const id = getIdFromUrl();
  currentExhibition = findExhibitionById(galleryData, id);
  if (!currentExhibition) {
    notFoundView.hidden = false;
    exhibitionView.hidden = true;
    return;
  }
  notFoundView.hidden = true;
  exhibitionView.hidden = false;
  renderExhibitionHero(currentExhibition);
  populatePlacementDropdowns(currentExhibition.id);
  renderRoomsAndPlacements(currentExhibition.id);
  placementForm.addEventListener('submit', handlePlacementSubmit);
  roomsContainer.addEventListener('click', handleRoomsClick);
}

initExhibitionPage();
