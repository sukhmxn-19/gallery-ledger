// Data storage layer and gallery business rules.

// Loads gallery data from localStorage or returns default structure.
function loadData() {
  const blank = { nextId: 1, artists: [], artworks: [], spaces: [], exhibitions: [], placements: [] };
  const raw = localStorage.getItem('galleryData');
  if (!raw) return blank;
  try { return JSON.parse(raw) || blank; } catch (err) { return blank; }
}
// Saves gallery data object to localStorage.
function saveData(data) { localStorage.setItem('galleryData', JSON.stringify(data)); }
// Returns next available id and increments counter.
function getNextId(data) {
  const id = data.nextId;
  data.nextId++;
  return id;
}

// Finds an artist by id.
function findArtistById(data, id) { return data.artists.find(function (a) { return a.id === Number(id); }); }
// Finds an artwork by id.
function findArtworkById(data, id) { return data.artworks.find(function (a) { return a.id === Number(id); }); }
// Finds a space by id.
function findSpaceById(data, id) { return data.spaces.find(function (s) { return s.id === Number(id); }); }
// Finds an exhibition by id.
function findExhibitionById(data, id) { return data.exhibitions.find(function (e) { return e.id === Number(id); }); }

// Returns all placements for an exhibition.
function getPlacementsForExhibition(data, exhibitionId) { return data.placements.filter(function (p) { return p.exhibitionId === Number(exhibitionId); }); }
// Returns all placements for an artwork.
function getPlacementsForArtwork(data, artworkId) { return data.placements.filter(function (p) { return p.artworkId === Number(artworkId); }); }
// Returns all placements for a space.
function getPlacementsForSpace(data, spaceId) { return data.placements.filter(function (p) { return p.spaceId === Number(spaceId); }); }
// Returns all artworks by an artist.
function getArtworksForArtist(data, artistId) { return data.artworks.filter(function (a) { return a.artistId === Number(artistId); }); }

// Checks if two date ranges overlap.
function datesOverlap(startA, endA, startB, endB) { return startA <= endB && startB <= endA; }

// Computes exhibition status from today's local date.
function getExhibitionStatus(exhibition) {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const today = `${y}-${m}-${d}`;
  if (today < exhibition.startDate) return 'Upcoming';
  if (today > exhibition.endDate) return 'Closed';
  return 'On now';
}

// Finds an overlapping exhibition for a list of placements.
function findClashingExhibition(data, placements, excludeId, start, end) {
  for (let i = 0; i < placements.length; i++) {
    if (placements[i].exhibitionId !== Number(excludeId)) {
      const other = findExhibitionById(data, placements[i].exhibitionId);
      if (other && datesOverlap(start, end, other.startDate, other.endDate)) return other;
    }
  }
  return null;
}

// BR1: Checks that artist name is unique, case-insensitive.
function checkArtistName(data, name, ignoreId) {
  const clean = name.trim().toLowerCase();
  const match = data.artists.find(function (a) {
    return a.id !== Number(ignoreId) && a.name.trim().toLowerCase() === clean;
  });
  if (match) return 'An artist with this name already exists.';
  return '';
}

// BR2: Checks if an artist has artworks before deletion.
function canDeleteArtist(data, artistId) {
  if (getArtworksForArtist(data, artistId).length > 0) return 'Delete or reassign this artist\'s artworks first.';
  return '';
}

// BR3: Checks that space name or exhibition title is unique.
function checkUniqueName(items, name, ignoreId) {
  const clean = name.trim().toLowerCase();
  const match = items.find(function (item) {
    const val = (item.name || item.title || '').trim().toLowerCase();
    return item.id !== Number(ignoreId) && val === clean;
  });
  if (match) return 'This name is already used.';
  return '';
}
// Checks space name uniqueness (BR3).
function checkSpaceName(data, name, ignoreId) { return checkUniqueName(data.spaces, name, ignoreId); }
// Checks exhibition title uniqueness (BR3).
function checkExhibitionTitle(data, title, ignoreId) { return checkUniqueName(data.exhibitions, title, ignoreId); }

// BR4: Checks exhibition end date is not before start date.
function checkExhibitionDatesOrder(start, end) { return end < start ? 'End date is before start date.' : ''; }
// BR5: Checks that a sold artwork cannot be placed.
function checkArtworkNotSold(artwork) { return (artwork && artwork.status === 'Sold') ? 'Sold artworks cannot be placed.' : ''; }

// BR6: Checks artwork is not in an overlapping exhibition.
function checkArtworkOverlap(data, exhibitionId, artworkId) {
  const target = findExhibitionById(data, exhibitionId);
  const places = getPlacementsForArtwork(data, artworkId);
  const other = findClashingExhibition(data, places, exhibitionId, target.startDate, target.endDate);
  if (other) return `Already in '${other.title}' during these dates.`;
  return '';
}

// BR7: Checks space is not used by an overlapping exhibition.
function checkSpaceOverlap(data, exhibitionId, spaceId) {
  const target = findExhibitionById(data, exhibitionId);
  const space = findSpaceById(data, spaceId);
  const places = getPlacementsForSpace(data, spaceId);
  const other = findClashingExhibition(data, places, exhibitionId, target.startDate, target.endDate);
  if (other && space) return `${space.name} is used by '${other.title}' during these dates.`;
  return '';
}

// BR8: Checks space capacity is not exceeded.
function checkSpaceCapacity(data, exhibitionId, spaceId) {
  const space = findSpaceById(data, spaceId);
  const places = data.placements.filter(function (p) {
    return p.exhibitionId === Number(exhibitionId) && p.spaceId === Number(spaceId);
  });
  if (space && places.length >= space.capacity) {
    return `${space.name} is full (${places.length}/${space.capacity}).`;
  }
  return '';
}
// BR9: Checks artwork is not placed twice in the same exhibition.
function checkArtworkNotPlacedTwice(data, exhibitionId, artworkId) {
  const match = data.placements.find(function (p) {
    return p.exhibitionId === Number(exhibitionId) && p.artworkId === Number(artworkId);
  });
  if (match) return 'Already placed in this exhibition.';
  return '';
}

// Validates placement against rules BR5 through BR9.
function checkPlacement(data, exhibitionId, artworkId, spaceId) {
  const artwork = findArtworkById(data, artworkId);
  return checkArtworkNotSold(artwork) ||
    checkArtworkNotPlacedTwice(data, exhibitionId, artworkId) ||
    checkArtworkOverlap(data, exhibitionId, artworkId) ||
    checkSpaceOverlap(data, exhibitionId, spaceId) ||
    checkSpaceCapacity(data, exhibitionId, spaceId) || '';
}

// BR10: Checks artwork has no placements before deletion.
function canDeleteArtwork(data, artworkId) {
  if (getPlacementsForArtwork(data, artworkId).length > 0) return 'Remove it from its exhibitions first.';
  return '';
}
// BR11: Checks space has no placements before deletion.
function canDeleteSpace(data, spaceId) {
  if (getPlacementsForSpace(data, spaceId).length > 0) return 'This space is in use.';
  return '';
}

// BR12: Returns confirmation message for deleting an exhibition.
function getDeleteExhibitionConfirm(data, exhibitionId) {
  const ex = findExhibitionById(data, exhibitionId);
  return `Delete '${ex.title}' and its ${getPlacementsForExhibition(data, exhibitionId).length} placements?`;
}

// BR13: Checks if artwork is in active exhibitions before marking Sold.
function canMarkSold(data, artworkId) {
  const places = getPlacementsForArtwork(data, artworkId);
  for (let i = 0; i < places.length; i++) {
    const ex = findExhibitionById(data, places[i].exhibitionId);
    const status = ex ? getExhibitionStatus(ex) : '';
    if (status === 'Upcoming' || status === 'On now') return 'Remove it from active exhibitions first.';
  }
  return '';
}

// BR14: Checks updated exhibition dates do not clash with existing placements.
function checkExhibitionDates(data, exhibitionId, newStart, newEnd) {
  const places = getPlacementsForExhibition(data, exhibitionId);
  for (let i = 0; i < places.length; i++) {
    const artPlaces = getPlacementsForArtwork(data, places[i].artworkId);
    const artClash = findClashingExhibition(data, artPlaces, exhibitionId, newStart, newEnd);
    if (artClash) return `New dates clash with '${artClash.title}'.`;
    const spacePlaces = getPlacementsForSpace(data, places[i].spaceId);
    const spaceClash = findClashingExhibition(data, spacePlaces, exhibitionId, newStart, newEnd);
    if (spaceClash) return `New dates clash with '${spaceClash.title}'.`;
  }
  return '';
}

// BR15: Checks required text and non-empty string.
function checkRequired(value, fieldName) {
  if (!value || String(value).trim() === '') return `${fieldName} is required.`;
  return '';
}
