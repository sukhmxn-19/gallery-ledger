// Artists directory and curatorial registry logic.

const artistForm = document.getElementById('artist-form'), artistIdInput = document.getElementById('artist-id'), artistNameInput = document.getElementById('artist-name');
const artistBornInput = document.getElementById('artist-born'), artistNationalityInput = document.getElementById('artist-nationality'), artistStyleInput = document.getElementById('artist-style');
const artistBioInput = document.getElementById('artist-bio'), submitBtn = document.getElementById('submit-btn'), cancelBtn = document.getElementById('cancel-btn'), formHeading = document.getElementById('form-heading');
const adminPanel = document.getElementById('admin-panel'), toggleAdminBtn = document.getElementById('toggle-admin-btn'), searchInput = document.getElementById('search-input');
const artistsGrid = document.getElementById('artists-grid'), tableView = document.getElementById('table-view'), tableBody = document.getElementById('artists-table-body');
const emptyState = document.getElementById('empty-state'), artistCountEl = document.getElementById('artist-count'), registryCountEl = document.getElementById('registry-count');
let galleryData = null;

// Extracts uppercase initials from an artist name for the archival seal.
function getArtistInitials(name) {
  const parts = (name || '').trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Validates input fields and business rules for an artist record.
function validateArtist(name, born, bio, ignoreId) {
  const reqErr = checkRequired(name, 'Name'); if (reqErr) return reqErr;
  const uniqueErr = checkArtistName(galleryData, name, ignoreId); if (uniqueErr) return uniqueErr;
  if (born) {
    const bornNum = Number(born), curr = new Date().getFullYear();
    if (isNaN(bornNum) || bornNum < 1000 || bornNum > curr) return 'Year born must be a valid 4-digit year.';
  }
  if (bio && bio.length > 400) return 'Biography cannot exceed 400 characters.';
  return '';
}

// Toggles visibility of the collapsible curatorial registration desk.
function toggleAdminDesk(show) {
  const willShow = typeof show === 'boolean' ? show : adminPanel.hidden;
  adminPanel.hidden = !willShow;
  toggleAdminBtn.textContent = willShow ? '✕ Close Desk' : '✦ Register Artist';
}

// Resets the artist form back to initial creation state.
function resetArtistForm() {
  artistForm.reset(); artistIdInput.value = '';
  submitBtn.textContent = 'Add artist'; cancelBtn.hidden = true;
  formHeading.textContent = 'Add artist';
}

// Populates form fields to edit an existing artist and opens the desk.
function setFormForEdit(artist) {
  artistIdInput.value = artist.id; artistNameInput.value = artist.name;
  artistBornInput.value = artist.born || ''; artistNationalityInput.value = artist.nationality || '';
  artistStyleInput.value = artist.style || ''; artistBioInput.value = artist.bio || '';
  submitBtn.textContent = 'Save changes'; cancelBtn.hidden = false;
  formHeading.textContent = 'Edit artist'; toggleAdminDesk(true);
}

// Filters artists list by search query matching artist name.
function getFilteredArtists(filterText) {
  const query = (filterText || '').trim().toLowerCase();
  return galleryData.artists.filter(function (artist) {
    return artist.name.toLowerCase().indexOf(query) !== -1;
  });
}

// Builds the HTML for one artist editorial card in the directory grid.
function buildArtistCard(artist, artworkCount, isFeatured) {
  const feat = isFeatured ? ' featured' : '', initials = getArtistInitials(artist.name);
  const born = artist.born ? `b. ${artist.born}` : '', nat = artist.nationality || '';
  const meta = [born, nat].filter(function (x) { return x !== ''; }).join(' &bull; ');
  const bio = artist.bio ? escapeHtml(artist.bio) : 'Curatorial biography in preparation.';
  return `<article class="artist-directory-card${feat}"><div class="artist-card-header"><div class="artist-seal">${escapeHtml(initials)}</div><div class="artist-card-headline"><div class="artist-card-meta">${meta || 'Living Artist'}</div><h2 class="artist-card-name"><a href="artist.html?id=${artist.id}">${escapeHtml(artist.name)}</a></h2><div class="artist-card-style">${escapeHtml(artist.style || 'Contemporary')}</div></div></div><p class="artist-card-bio">${bio}</p><div class="artist-card-foot"><span class="artist-works-badge">${artworkCount} catalogued works</span><div class="artist-card-actions"><a href="artist.html?id=${artist.id}" class="btn secondary" style="font-size:11px;padding:4px 8px;">Dossier</a> <button type="button" class="secondary" style="font-size:11px;padding:4px 8px;" data-action="edit" data-id="${artist.id}">Edit</button> <button type="button" class="delete" style="font-size:11px;padding:4px 6px;" data-action="delete" data-id="${artist.id}">Delete</button></div></div></article>`;
}

// Renders the artists into both the editorial directory grid and tabular registry.
function renderArtists(filterText) {
  const list = getFilteredArtists(filterText);
  artistCountEl.textContent = `${list.length} of ${galleryData.artists.length} Artists`;
  registryCountEl.textContent = `${list.length} Artists`;
  emptyState.hidden = list.length > 0;
  artistsGrid.innerHTML = ''; tableBody.innerHTML = '';
  for (let i = 0; i < list.length; i++) {
    const a = list[i], count = getArtworksForArtist(galleryData, a.id).length;
    artistsGrid.innerHTML += buildArtistCard(a, count, i === 0 && list.length >= 2);
    tableBody.innerHTML += `<tr><td><strong><a href="artist.html?id=${a.id}">${escapeHtml(a.name)}</a></strong></td><td>${escapeHtml(a.nationality || '—')}</td><td>${escapeHtml(a.born ? String(a.born) : '—')}</td><td>${escapeHtml(a.style || '—')}</td><td class="num">${count}</td><td><button type="button" class="secondary" style="font-size:11px;padding:3px 7px;" data-action="edit" data-id="${a.id}">Edit</button> <button type="button" class="delete" style="font-size:11px;padding:3px 6px;" data-action="delete" data-id="${a.id}">Delete</button></td></tr>`;
  }
}

// Creates a new artist record or updates existing artist fields.
function saveArtistRecord(id, name, born, nationality, style, bio) {
  if (id) {
    const artist = findArtistById(galleryData, id);
    if (artist) {
      artist.name = name; artist.born = born ? Number(born) : undefined;
      artist.nationality = nationality; artist.style = style; artist.bio = bio;
      showMessage('Artist updated.', false);
    }
  } else {
    galleryData.artists.push({ id: getNextId(galleryData), name: name, born: born ? Number(born) : undefined, nationality: nationality, style: style, bio: bio });
    showMessage('Artist added.', false);
  }
  saveData(galleryData);
}

// Handles submitting the artist add/edit form.
function handleFormSubmit(event) {
  event.preventDefault();
  const id = artistIdInput.value, name = artistNameInput.value.trim(), born = artistBornInput.value.trim();
  const nat = artistNationalityInput.value.trim(), style = artistStyleInput.value.trim(), bio = artistBioInput.value.trim();
  const error = validateArtist(name, born, bio, id);
  if (error) { showMessage(error, true); return; }
  saveArtistRecord(id, name, born, nat, style, bio);
  resetArtistForm(); toggleAdminDesk(false); renderArtists(searchInput.value);
}

// Switches view between curated artist grid and tabular registry.
function setViewMode(mode) {
  const isG = mode === 'grid';
  artistsGrid.hidden = !isG; tableView.hidden = isG;
  document.getElementById('view-grid-btn').className = 'view-btn' + (isG ? ' active' : '');
  document.getElementById('view-table-btn').className = 'view-btn' + (!isG ? ' active' : '');
}

// Handles Edit, Delete, view toggles, and clear actions.
function handleActionClick(event) {
  const el = event.target.closest('[data-action]');
  if (!el) return;
  event.preventDefault();
  const action = el.getAttribute('data-action'), id = el.getAttribute('data-id');
  if (action === 'view-grid') setViewMode('grid');
  if (action === 'view-table') setViewMode('table');
  if (action === 'clear-search') { searchInput.value = ''; renderArtists(''); }
  if (action === 'edit') { const artist = findArtistById(galleryData, id); if (artist) setFormForEdit(artist); }
  if (action === 'delete') {
    const delErr = canDeleteArtist(galleryData, id);
    if (delErr) { showMessage(delErr, true); return; }
    const artist = findArtistById(galleryData, id);
    if (artist && confirm(`Delete '${artist.name}'?`)) {
      galleryData.artists = galleryData.artists.filter(function (a) { return a.id !== Number(id); });
      saveData(galleryData); showMessage('Artist deleted.', false);
      renderArtists(searchInput.value);
      if (artistIdInput.value === String(id)) resetArtistForm();
    }
  }
}

// Initializes the artists management page.
function initArtistsPage() {
  renderNav('Artists'); galleryData = loadData();
  renderArtists('');
  artistForm.addEventListener('submit', handleFormSubmit);
  toggleAdminBtn.addEventListener('click', function () { toggleAdminDesk(); });
  cancelBtn.addEventListener('click', function () { resetArtistForm(); toggleAdminDesk(false); });
  document.addEventListener('click', handleActionClick);
  searchInput.addEventListener('input', function () { renderArtists(searchInput.value); });
  if (window.location.search.indexOf('action=new') !== -1) toggleAdminDesk(true);
}

initArtistsPage();
