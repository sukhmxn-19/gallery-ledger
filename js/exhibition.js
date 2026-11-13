// Exhibition view logic: header details, placement eligibility, and room groupings.

const notFoundView = document.getElementById('not-found');
const exhibitionView = document.getElementById('exhibition-view');
const editLink = document.getElementById('edit-exhibition-link');
const catalogueLink = document.getElementById('open-catalogue-link');
const titleEl = document.getElementById('exhibition-title');
const metaEl = document.getElementById('exhibition-meta');
const descEl = document.getElementById('exhibition-desc');
const placementForm = document.getElementById('placement-form');
const artworkSelect = document.getElementById('placement-artwork');
const spaceSelect = document.getElementById('placement-space');
const placeBtn = document.getElementById('place-btn');
const disabledReason = document.getElementById('disabled-reason');
const placementsContainer = document.getElementById('placements-container');
let galleryData = null;
let currentExhibition = null;

// Filters artworks eligible for this exhibition under rules BR5, BR6, and BR9.
function getEligibleArtworks(exId) {
  return galleryData.artworks.filter(function (art) {
    if (checkArtworkNotSold(art)) return false;
    if (checkArtworkNotPlacedTwice(galleryData, exId, art.id)) return false;
    if (checkArtworkOverlap(galleryData, exId, art.id)) return false;
    return true;
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
  if (!hasArtworks || !hasSpaces) {
    placeBtn.disabled = true;
    if (!hasArtworks && !hasSpaces) {
      disabledReason.textContent = 'No eligible artworks or rooms with remaining capacity available.';
    } else if (!hasArtworks) {
      disabledReason.textContent = 'No eligible artworks available to place in this exhibition.';
    } else {
      disabledReason.textContent = 'No gallery spaces with remaining capacity available.';
    }
  } else {
    placeBtn.disabled = false;
    disabledReason.textContent = '';
  }
}

// Populates dropdowns with eligible artworks and available spaces or shows why disabled.
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

// Renders the exhibition header, theme, dates, status, and navigation links.
function renderExhibitionHeader(ex) {
  titleEl.textContent = ex.title;
  const status = getExhibitionStatus(ex);
  const dates = `${formatDate(ex.startDate)} to ${formatDate(ex.endDate)}`;
  const metaParts = [`Dates: ${dates}`, `Status: ${status}`];
  if (ex.theme) metaParts.push(`Theme: ${ex.theme}`);
  metaEl.textContent = metaParts.join(' · ');
  descEl.textContent = ex.description || '';
  editLink.href = `exhibitions.html?id=${ex.id}`;
  catalogueLink.href = `catalogue.html?id=${ex.id}`;
}

// Builds HTML table rows for placements within a single space.
function renderSpaceTable(space, inSpace) {
  let html = `<h3>${escapeHtml(space ? space.name : 'Room')}, ${inSpace.length} / ${space ? space.capacity : 0}</h3>`;
  html += '<table><thead><tr><th>Title</th><th>Artist</th><th>Medium</th><th class="num">Price</th><th>Status</th><th>Action</th></tr></thead><tbody>';
  for (let j = 0; j < inSpace.length; j++) {
    const p = inSpace[j];
    const art = findArtworkById(galleryData, p.artworkId);
    const artist = art ? findArtistById(galleryData, art.artistId) : null;
    const sClass = (art && art.status === 'Sold') ? ' class="sold"' : '';
    html += `<tr><td>${escapeHtml(art ? art.title : '—')}</td><td>${escapeHtml(artist ? artist.name : '—')}</td><td>${escapeHtml(art ? art.medium : '—')}</td><td class="num">${formatPrice(art ? art.price : 0)}</td><td${sClass}>${escapeHtml(art ? art.status : '—')}</td><td><button type="button" class="delete btn-remove" data-id="${p.id}">Remove</button></td></tr>`;
  }
  return html + '</tbody></table>';
}

// Renders existing artwork placements grouped by space with remove buttons.
function renderPlacements(exId) {
  placementsContainer.innerHTML = '';
  const placements = getPlacementsForExhibition(galleryData, exId);
  if (placements.length === 0) {
    placementsContainer.innerHTML = '<p>No artworks placed in this exhibition yet.</p>';
    return;
  }
  const spaceIds = [];
  for (let i = 0; i < placements.length; i++) {
    if (spaceIds.indexOf(placements[i].spaceId) === -1) spaceIds.push(placements[i].spaceId);
  }
  let fullHtml = '';
  for (let s = 0; s < spaceIds.length; s++) {
    const space = findSpaceById(galleryData, spaceIds[s]);
    const inSpace = placements.filter(function (p) { return p.spaceId === spaceIds[s]; });
    fullHtml += renderSpaceTable(space, inSpace);
  }
  placementsContainer.innerHTML = fullHtml;
}

// Handles placing an artwork in a space after validating BR5 through BR9.
function handlePlacementSubmit(event) {
  event.preventDefault();
  const artId = Number(artworkSelect.value);
  const spaceId = Number(spaceSelect.value);
  const error = checkPlacement(galleryData, currentExhibition.id, artId, spaceId);
  if (error) {
    showMessage(error, true);
    return;
  }
  galleryData.placements.push({
    id: getNextId(galleryData),
    exhibitionId: currentExhibition.id,
    artworkId: artId,
    spaceId: spaceId
  });
  saveData(galleryData);
  showMessage('Artwork placed successfully.', false);
  populatePlacementDropdowns(currentExhibition.id);
  renderPlacements(currentExhibition.id);
}

// Handles clicking the Remove button to unassign an artwork from a room.
function handlePlacementsClick(event) {
  const btn = event.target;
  if (!btn.classList.contains('btn-remove')) return;
  const placeId = Number(btn.getAttribute('data-id'));
  galleryData.placements = galleryData.placements.filter(function (p) {
    return p.id !== placeId;
  });
  saveData(galleryData);
  showMessage('Placement removed.', false);
  populatePlacementDropdowns(currentExhibition.id);
  renderPlacements(currentExhibition.id);
}

// Initializes the exhibition details and placement view.
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
  renderExhibitionHeader(currentExhibition);
  populatePlacementDropdowns(currentExhibition.id);
  renderPlacements(currentExhibition.id);
  placementForm.addEventListener('submit', handlePlacementSubmit);
  placementsContainer.addEventListener('click', handlePlacementsClick);
}

initExhibitionPage();
