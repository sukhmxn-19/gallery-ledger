// Artists page logic: artist management form and filterable table.

const artistForm = document.getElementById('artist-form');
const artistIdInput = document.getElementById('artist-id');
const artistNameInput = document.getElementById('artist-name');
const artistBornInput = document.getElementById('artist-born');
const artistNationalityInput = document.getElementById('artist-nationality');
const artistStyleInput = document.getElementById('artist-style');
const artistBioInput = document.getElementById('artist-bio');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const formHeading = document.getElementById('form-heading');
const searchInput = document.getElementById('search-input');
const tableBody = document.getElementById('artists-table-body');
const emptyState = document.getElementById('empty-state');
let galleryData = null;

// Validates input fields and business rules for an artist.
function validateArtist(name, born, bio, ignoreId) {
  const reqErr = checkRequired(name, 'Name');
  if (reqErr) return reqErr;
  const uniqueErr = checkArtistName(galleryData, name, ignoreId);
  if (uniqueErr) return uniqueErr;
  if (born) {
    const bornNum = Number(born);
    if (isNaN(bornNum) || bornNum < 1000 || bornNum > 9999) {
      return 'Year born must be a 4-digit year.';
    }
  }
  if (bio && bio.length > 400) {
    return 'Biography cannot exceed 400 characters.';
  }
  return '';
}

// Resets the artist form back to initial add state.
function resetArtistForm() {
  artistForm.reset();
  artistIdInput.value = '';
  submitBtn.textContent = 'Add artist';
  cancelBtn.hidden = true;
  formHeading.textContent = 'Add artist';
}

// Populates form fields to edit an existing artist.
function setFormForEdit(artist) {
  artistIdInput.value = artist.id;
  artistNameInput.value = artist.name;
  artistBornInput.value = artist.born || '';
  artistNationalityInput.value = artist.nationality || '';
  artistStyleInput.value = artist.style || '';
  artistBioInput.value = artist.bio || '';
  submitBtn.textContent = 'Save changes';
  cancelBtn.hidden = false;
  formHeading.textContent = 'Edit artist';
  showMessage('', false);
}

// Renders the artists table with optional search filter.
function renderArtistsTable(filterText) {
  tableBody.innerHTML = '';
  const query = (filterText || '').trim().toLowerCase();
  const filtered = galleryData.artists.filter(function (artist) {
    return artist.name.toLowerCase().indexOf(query) !== -1;
  });
  if (filtered.length === 0) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;
  for (let i = 0; i < filtered.length; i++) {
    const a = filtered[i];
    const count = getArtworksForArtist(galleryData, a.id).length;
    const row = document.createElement('tr');
    row.innerHTML = `<td><a href="artist.html?id=${a.id}">${escapeHtml(a.name)}</a></td><td>${escapeHtml(a.nationality || '—')}</td><td>${escapeHtml(a.style || '—')}</td><td class="num">${count}</td><td><button type="button" class="secondary btn-edit" data-id="${a.id}">Edit</button> <button type="button" class="delete btn-delete" data-id="${a.id}">Delete</button></td>`;
    tableBody.appendChild(row);
  }
}

// Creates a new artist record or updates existing artist fields.
function saveArtistRecord(id, name, born, nationality, style, bio) {
  if (id) {
    const artist = findArtistById(galleryData, id);
    if (artist) {
      artist.name = name;
      artist.born = born ? Number(born) : undefined;
      artist.nationality = nationality;
      artist.style = style;
      artist.bio = bio;
      showMessage('Artist updated.', false);
    }
  } else {
    galleryData.artists.push({
      id: getNextId(galleryData),
      name: name,
      born: born ? Number(born) : undefined,
      nationality: nationality,
      style: style,
      bio: bio
    });
    showMessage('Artist added.', false);
  }
  saveData(galleryData);
}

// Handles submitting the artist add/edit form.
function handleFormSubmit(event) {
  event.preventDefault();
  const id = artistIdInput.value;
  const name = artistNameInput.value.trim();
  const born = artistBornInput.value.trim();
  const nationality = artistNationalityInput.value.trim();
  const style = artistStyleInput.value.trim();
  const bio = artistBioInput.value.trim();

  const error = validateArtist(name, born, bio, id);
  if (error) {
    showMessage(error, true);
    return;
  }
  saveArtistRecord(id, name, born, nationality, style, bio);
  resetArtistForm();
  renderArtistsTable(searchInput.value);
}

// Handles click events on Edit and Delete buttons in the table.
function handleTableClick(event) {
  const target = event.target;
  const id = target.getAttribute('data-id');
  if (!id) return;

  if (target.classList.contains('btn-delete')) {
    const delErr = canDeleteArtist(galleryData, id);
    if (delErr) {
      showMessage(delErr, true);
      return;
    }
    const artist = findArtistById(galleryData, id);
    if (!artist) return;
    if (confirm(`Delete '${artist.name}'?`)) {
      galleryData.artists = galleryData.artists.filter(function (a) { return a.id !== Number(id); });
      saveData(galleryData);
      showMessage('Artist deleted.', false);
      renderArtistsTable(searchInput.value);
      if (artistIdInput.value === String(id)) resetArtistForm();
    }
  } else if (target.classList.contains('btn-edit')) {
    const artist = findArtistById(galleryData, id);
    if (artist) setFormForEdit(artist);
  }
}

// Filters artists list as the user types into search input.
function handleSearchInput() {
  renderArtistsTable(searchInput.value);
}

// Cancels editing and returns the form to add mode.
function handleCancelClick() {
  resetArtistForm();
  showMessage('', false);
}

// Initializes the artists management page.
function initArtistsPage() {
  renderNav('Artists');
  galleryData = loadData();
  renderArtistsTable('');
  artistForm.addEventListener('submit', handleFormSubmit);
  tableBody.addEventListener('click', handleTableClick);
  searchInput.addEventListener('input', handleSearchInput);
  cancelBtn.addEventListener('click', handleCancelClick);
}

initArtistsPage();
