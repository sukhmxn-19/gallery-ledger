// Artworks page logic: artwork creation, editing, multi-filtering, and deletion.

const artworkForm = document.getElementById('artwork-form');
const noArtistsMessage = document.getElementById('no-artists-message');
const artworkIdInput = document.getElementById('artwork-id');
const artworkArtistSelect = document.getElementById('artwork-artist');
const artworkTitleInput = document.getElementById('artwork-title');
const artworkYearInput = document.getElementById('artwork-year');
const artworkMediumInput = document.getElementById('artwork-medium');
const artworkSizeInput = document.getElementById('artwork-size');
const artworkPriceInput = document.getElementById('artwork-price');
const artworkStatusSelect = document.getElementById('artwork-status');
const artworkBuyerInput = document.getElementById('artwork-buyer');
const buyerField = document.getElementById('buyer-field');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const formHeading = document.getElementById('form-heading');
const filterArtist = document.getElementById('filter-artist');
const filterStatus = document.getElementById('filter-status');
const filterSearch = document.getElementById('filter-search');
const tableBody = document.getElementById('artworks-table-body');
const emptyState = document.getElementById('empty-state');
let galleryData = null;

// Populates artist dropdowns for both the form and the filter bar.
function populateArtistDropdowns() {
  artworkArtistSelect.innerHTML = '';
  filterArtist.innerHTML = '<option value="">All artists</option>';
  const has = galleryData.artists.length > 0;
  artworkForm.hidden = !has;
  noArtistsMessage.hidden = has;
  for (let i = 0; i < galleryData.artists.length; i++) {
    const a = galleryData.artists[i], opt = `<option value="${a.id}">${escapeHtml(a.name)}</option>`;
    artworkArtistSelect.innerHTML += opt;
    filterArtist.innerHTML += opt;
  }
}

// Toggles buyer field visibility depending on whether status is Sold.
function updateBuyerFieldVisibility() {
  const isSold = artworkStatusSelect.value === 'Sold';
  buyerField.hidden = !isSold;
  if (!isSold) artworkBuyerInput.value = '';
}

// Validates input constraints and business rules for artwork records.
function validateArtwork(artistId, title, year, medium, price, status, buyer, editId) {
  if (!artistId) return 'Artist is required.';
  const tErr = checkRequired(title, 'Title');
  if (tErr) return tErr;
  const mErr = checkRequired(medium, 'Medium');
  if (mErr) return mErr;
  const p = Number(price);
  if (isNaN(p) || p <= 0) return 'Price must be greater than 0.';
  if (year) {
    const y = Number(year), curr = new Date().getFullYear();
    if (isNaN(y) || y < 1000 || y > curr) return `Year must be between 1000 and ${curr}.`;
  }
  if (status === 'Sold' && (!buyer || buyer.trim() === '')) return 'Buyer is required when sold.';
  if (editId && status === 'Sold') return canMarkSold(galleryData, editId);
  return '';
}

// Resets form fields and returns to add mode.
function resetArtworkForm() {
  artworkForm.reset();
  artworkIdInput.value = '';
  submitBtn.textContent = 'Add artwork';
  cancelBtn.hidden = true;
  formHeading.textContent = 'Add artwork';
  updateBuyerFieldVisibility();
}

// Populates the form with existing artwork data for editing.
function setFormForEdit(art) {
  artworkIdInput.value = art.id;
  artworkArtistSelect.value = art.artistId;
  artworkTitleInput.value = art.title;
  artworkYearInput.value = art.year || '';
  artworkMediumInput.value = art.medium;
  artworkSizeInput.value = art.size || '';
  artworkPriceInput.value = art.price;
  artworkStatusSelect.value = art.status;
  updateBuyerFieldVisibility();
  artworkBuyerInput.value = art.status === 'Sold' ? (art.buyer || '') : '';
  submitBtn.textContent = 'Save changes';
  cancelBtn.hidden = false;
  formHeading.textContent = 'Edit artwork';
  showMessage('', false);
}

// Renders the artworks table according to active filter criteria.
function renderArtworksTable() {
  tableBody.innerHTML = '';
  const fA = filterArtist.value, fS = filterStatus.value;
  const fT = filterSearch.value.trim().toLowerCase();
  const list = galleryData.artworks.filter(function (art) {
    if (fA && String(art.artistId) !== fA) return false;
    if (fS && art.status !== fS) return false;
    if (fT && art.title.toLowerCase().indexOf(fT) === -1) return false;
    return true;
  });
  emptyState.hidden = list.length > 0;
  for (let i = 0; i < list.length; i++) {
    const art = list[i];
    const artist = findArtistById(galleryData, art.artistId);
    const aName = artist ? artist.name : 'Unknown';
    const sClass = art.status === 'Sold' ? ' class="sold"' : '';
    const yr = art.year ? String(art.year) : '—';
    const row = document.createElement('tr');
    row.innerHTML = `<td>${escapeHtml(art.title)}</td><td>${escapeHtml(aName)}</td><td>${escapeHtml(yr)}</td><td>${escapeHtml(art.medium)}</td><td class="num">${formatPrice(art.price)}</td><td${sClass}>${escapeHtml(art.status)}</td><td><button type="button" class="secondary btn-edit" data-id="${art.id}">Edit</button> <button type="button" class="delete btn-delete" data-id="${art.id}">Delete</button></td>`;
    tableBody.appendChild(row);
  }
}

// Handles submitting the artwork form for adding or editing.
function handleFormSubmit(event) {
  event.preventDefault();
  const id = artworkIdInput.value;
  const artistId = Number(artworkArtistSelect.value), title = artworkTitleInput.value.trim();
  const year = artworkYearInput.value.trim(), medium = artworkMediumInput.value.trim();
  const size = artworkSizeInput.value.trim(), price = artworkPriceInput.value.trim();
  const status = artworkStatusSelect.value, buyer = artworkBuyerInput.value.trim();

  const error = validateArtwork(artistId, title, year, medium, price, status, buyer, id);
  if (error) { showMessage(error, true); return; }

  const rec = id ? findArtworkById(galleryData, id) : { id: getNextId(galleryData) };
  rec.artistId = artistId;
  rec.title = title;
  rec.year = year ? Number(year) : undefined;
  rec.medium = medium;
  rec.size = size;
  rec.price = Number(price);
  rec.status = status;
  rec.buyer = status === 'Sold' ? buyer : undefined;

  if (!id) galleryData.artworks.push(rec);
  saveData(galleryData);
  showMessage(id ? 'Artwork updated.' : 'Artwork added.', false);
  resetArtworkForm();
  renderArtworksTable();
}

// Handles Edit and Delete actions clicked in the table.
function handleTableClick(event) {
  const btn = event.target, id = btn.getAttribute('data-id');
  if (!id) return;
  if (btn.classList.contains('btn-delete')) {
    const delErr = canDeleteArtwork(galleryData, id);
    if (delErr) { showMessage(delErr, true); return; }
    const art = findArtworkById(galleryData, id);
    if (art && confirm(`Delete '${art.title}'?`)) {
      galleryData.artworks = galleryData.artworks.filter(function (a) { return a.id !== Number(id); });
      saveData(galleryData);
      showMessage('Artwork deleted.', false);
      renderArtworksTable();
      if (artworkIdInput.value === String(id)) resetArtworkForm();
    }
  } else if (btn.classList.contains('btn-edit')) {
    const art = findArtworkById(galleryData, id);
    if (art) setFormForEdit(art);
  }
}

// Cancels editing and returns form to add mode.
function handleCancelClick() {
  resetArtworkForm();
  showMessage('', false);
}

// Initializes the artworks management page.
function initArtworksPage() {
  renderNav('Artworks');
  galleryData = loadData();
  populateArtistDropdowns();
  renderArtworksTable();
  artworkForm.addEventListener('submit', handleFormSubmit);
  artworkStatusSelect.addEventListener('change', updateBuyerFieldVisibility);
  tableBody.addEventListener('click', handleTableClick);
  filterArtist.addEventListener('change', renderArtworksTable);
  filterStatus.addEventListener('change', renderArtworksTable);
  filterSearch.addEventListener('input', renderArtworksTable);
  cancelBtn.addEventListener('click', handleCancelClick);
}

initArtworksPage();
