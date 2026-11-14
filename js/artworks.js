// Artworks collection and accession desk logic.

const artworkForm = document.getElementById('artwork-form'), noArtistsMessage = document.getElementById('no-artists-message'), artworkIdInput = document.getElementById('artwork-id'), artworkArtistSelect = document.getElementById('artwork-artist');
const artworkTitleInput = document.getElementById('artwork-title'), artworkYearInput = document.getElementById('artwork-year'), artworkMediumInput = document.getElementById('artwork-medium'), artworkSizeInput = document.getElementById('artwork-size');
const artworkPriceInput = document.getElementById('artwork-price'), artworkStatusSelect = document.getElementById('artwork-status'), artworkBuyerInput = document.getElementById('artwork-buyer'), buyerField = document.getElementById('buyer-field');
const submitBtn = document.getElementById('submit-btn'), cancelBtn = document.getElementById('cancel-btn'), formHeading = document.getElementById('form-heading'), adminPanel = document.getElementById('admin-panel'), toggleAdminBtn = document.getElementById('toggle-admin-btn');
const filterArtist = document.getElementById('filter-artist'), filterStatus = document.getElementById('filter-status'), filterSearch = document.getElementById('filter-search'), galleryView = document.getElementById('gallery-view'), inventoryView = document.getElementById('inventory-view');
const tableBody = document.getElementById('artworks-table-body'), emptyState = document.getElementById('empty-state'), collectionCountEl = document.getElementById('collection-count'), inventoryCountEl = document.getElementById('inventory-count');
const detailDrawerOverlay = document.getElementById('detail-drawer-overlay'), drawerContent = document.getElementById('drawer-content');
let galleryData = null;

// Populates artist dropdowns for both the form and the filter bar.
function populateArtistDropdowns() {
  artworkArtistSelect.innerHTML = ''; filterArtist.innerHTML = '<option value="">All artists</option>';
  const has = galleryData.artists.length > 0;
  artworkForm.hidden = !has; noArtistsMessage.hidden = has;
  for (let i = 0; i < galleryData.artists.length; i++) {
    const a = galleryData.artists[i], opt = `<option value="${a.id}">${escapeHtml(a.name)}</option>`;
    artworkArtistSelect.innerHTML += opt; filterArtist.innerHTML += opt;
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
  const tErr = checkRequired(title, 'Title'); if (tErr) return tErr;
  const mErr = checkRequired(medium, 'Medium'); if (mErr) return mErr;
  const p = Number(price); if (isNaN(p) || p <= 0) return 'Price must be greater than 0.';
  if (year && (Number(year) < 1000 || Number(year) > new Date().getFullYear())) return `Year must be between 1000 and ${new Date().getFullYear()}.`;
  if (status === 'Sold' && (!buyer || buyer.trim() === '')) return 'Buyer is required when sold.';
  return (editId && status === 'Sold') ? canMarkSold(galleryData, editId) : '';
}

// Toggles visibility of the collapsible curatorial accession desk.
function toggleAdminDesk(show) {
  const willShow = typeof show === 'boolean' ? show : adminPanel.hidden;
  adminPanel.hidden = !willShow;
  toggleAdminBtn.textContent = willShow ? '✕ Close Desk' : '✦ Accession Desk';
}

// Resets form fields and returns to add mode.
function resetArtworkForm() {
  artworkForm.reset(); artworkIdInput.value = '';
  submitBtn.textContent = 'Add artwork'; cancelBtn.hidden = true;
  formHeading.textContent = 'Add artwork'; updateBuyerFieldVisibility();
}

// Populates the form with existing artwork data for editing.
function setFormForEdit(art) {
  artworkIdInput.value = art.id; artworkArtistSelect.value = art.artistId;
  artworkTitleInput.value = art.title; artworkYearInput.value = art.year || '';
  artworkMediumInput.value = art.medium; artworkSizeInput.value = art.size || '';
  artworkPriceInput.value = art.price; artworkStatusSelect.value = art.status;
  updateBuyerFieldVisibility();
  artworkBuyerInput.value = art.status === 'Sold' ? (art.buyer || '') : '';
  submitBtn.textContent = 'Save changes'; cancelBtn.hidden = false;
  formHeading.textContent = 'Edit artwork'; toggleAdminDesk(true);
}

// Filters artworks array matching active search and category filters.
function getFilteredArtworks() {
  const fA = filterArtist.value, fS = filterStatus.value, fT = filterSearch.value.trim().toLowerCase();
  return galleryData.artworks.filter(function (art) {
    if (fA && String(art.artistId) !== fA) return false;
    if (fS && art.status !== fS) return false;
    if (fT && art.title.toLowerCase().indexOf(fT) === -1) return false;
    return true;
  });
}

// Builds HTML for an image-led artwork card in the gallery grid.
function buildArtworkCard(art, artistName, isFeatured) {
  const feat = isFeatured ? ' featured' : '', img = getArtworkImage(art), yr = art.year ? String(art.year) : '';
  const dim = art.size ? escapeHtml(art.size) : 'Dimensions unrecorded';
  return `<article class="collection-card${feat}"><div class="collection-media" data-action="explore" data-id="${art.id}"><img src="${img}" alt="${escapeHtml(art.title)}"><div class="collection-media-badge">${renderStatusBadge(art.status)}</div><span class="collection-media-demo">Plate #${art.id}</span></div><div class="collection-body"><div class="collection-top-meta"><span class="collection-medium-tag">${escapeHtml(art.medium)}</span><span class="collection-year-tag">${yr}</span></div><h3 class="collection-title"><a href="#" data-action="explore" data-id="${art.id}">${escapeHtml(art.title)}</a></h3><div class="collection-artist">${escapeHtml(artistName)}</div><div class="collection-dimensions">${dim}</div><div class="collection-foot"><span class="collection-price">${formatPrice(art.price)}</span><div class="collection-actions"><button type="button" class="secondary" style="font-size:11px;padding:4px 8px;" data-action="explore" data-id="${art.id}">Explore</button> <button type="button" class="secondary" style="font-size:11px;padding:4px 8px;" data-action="edit" data-id="${art.id}">Edit</button> <button type="button" class="delete" style="font-size:11px;padding:4px 6px;" data-action="delete" data-id="${art.id}">Delete</button></div></div></div></article>`;
}

// Renders filtered artworks into both the gallery grid and staff inventory table.
function renderCollection() {
  const list = getFilteredArtworks();
  collectionCountEl.textContent = `${list.length} of ${galleryData.artworks.length} Works`;
  inventoryCountEl.textContent = `${list.length} Items`;
  emptyState.hidden = list.length > 0;
  galleryView.innerHTML = ''; tableBody.innerHTML = '';
  for (let i = 0; i < list.length; i++) {
    const art = list[i], artist = findArtistById(galleryData, art.artistId);
    const aName = artist ? artist.name : 'Unknown', yr = art.year ? String(art.year) : '—';
    galleryView.innerHTML += buildArtworkCard(art, aName, i === 0 && list.length >= 3);
    const sClass = art.status === 'Sold' ? ' class="sold"' : '';
    tableBody.innerHTML += `<tr><td><strong>${escapeHtml(art.title)}</strong></td><td>${escapeHtml(aName)}</td><td>${yr}</td><td>${escapeHtml(art.medium)}</td><td>${escapeHtml(art.size || '—')}</td><td class="num">${formatPrice(art.price)}</td><td${sClass}>${escapeHtml(art.status)}</td><td><button type="button" class="secondary" style="font-size:11px;padding:3px 7px;" data-action="explore" data-id="${art.id}">View</button> <button type="button" class="secondary" style="font-size:11px;padding:3px 7px;" data-action="edit" data-id="${art.id}">Edit</button> <button type="button" class="delete" style="font-size:11px;padding:3px 6px;" data-action="delete" data-id="${art.id}">Delete</button></td></tr>`;
  }
}

// Opens the curatorial inspection drawer showing full metadata and placement history.
function openArtworkDetail(artId) {
  const art = findArtworkById(galleryData, artId);
  if (!art) return;
  const a = findArtistById(galleryData, art.artistId), aName = a ? a.name : 'Unknown';
  const places = getPlacementsForArtwork(galleryData, art.id);
  let ph = '<p style="font-size:13px; color:var(--ink-muted);">Not placed in any exhibitions.</p>';
  if (places.length > 0) {
    ph = '<ul class="drawer-placement-list">';
    for (let i = 0; i < places.length; i++) {
      const ex = findExhibitionById(galleryData, places[i].exhibitionId), sp = findSpaceById(galleryData, places[i].spaceId);
      ph += `<li class="drawer-placement-item"><div><strong><a href="exhibition.html?id=${places[i].exhibitionId}">${escapeHtml(ex ? ex.title : 'Exhibition')}</a></strong><div style="font-size:11px; color:var(--ink-muted);">${escapeHtml(sp ? sp.name : 'Space')}</div></div>${ex ? renderStatusBadge(getExhibitionStatus(ex)) : ''}</li>`;
    }
    ph += '</ul>';
  }
  const buyer = art.status === 'Sold' ? `<div class="drawer-meta-item"><span class="drawer-meta-label">Acquired By</span><span class="drawer-meta-val">${escapeHtml(art.buyer || 'Private Collector')}</span></div>` : '';
  const head = `<div class="drawer-visual"><img src="${getArtworkImage(art)}" alt="${escapeHtml(art.title)}"></div><div><span class="collection-medium-tag">${escapeHtml(art.medium)}</span><h2 style="font-family:var(--font-serif); font-size:24px; font-style:italic; margin:4px 0;">${escapeHtml(art.title)}</h2><div style="font-size:14px; color:var(--ink-secondary);">${escapeHtml(aName)} &bull; ${art.year || 'Date unrecorded'}</div></div>`;
  const meta = `<div class="drawer-meta-grid"><div class="drawer-meta-item"><span class="drawer-meta-label">Valuation</span><span class="drawer-meta-val">${formatPrice(art.price)}</span></div><div class="drawer-meta-item"><span class="drawer-meta-label">Status</span><span class="drawer-meta-val">${renderStatusBadge(art.status)}</span></div><div class="drawer-meta-item"><span class="drawer-meta-label">Dimensions</span><span class="drawer-meta-val">${escapeHtml(art.size || 'Unrecorded')}</span></div><div class="drawer-meta-item"><span class="drawer-meta-label">Catalog ID</span><span class="drawer-meta-val">#${art.id}</span></div>${buyer}</div>`;
  drawerContent.innerHTML = `${head}${meta}<div class="drawer-provenance"><h3>Exhibition & Placement History</h3>${ph}</div><div class="drawer-actions"><button type="button" class="secondary" data-action="edit" data-id="${art.id}">Edit Artwork</button><button type="button" class="delete" data-action="delete" data-id="${art.id}">Delete Artwork</button></div>`;
  detailDrawerOverlay.classList.add('open');
}

// Handles submitting the artwork form for adding or editing.
function handleFormSubmit(event) {
  event.preventDefault();
  const id = artworkIdInput.value, artistId = Number(artworkArtistSelect.value);
  const title = artworkTitleInput.value.trim(), year = artworkYearInput.value.trim();
  const medium = artworkMediumInput.value.trim(), size = artworkSizeInput.value.trim();
  const price = artworkPriceInput.value.trim(), status = artworkStatusSelect.value, buyer = artworkBuyerInput.value.trim();
  const err = validateArtwork(artistId, title, year, medium, price, status, buyer, id);
  if (err) { showMessage(err, true); return; }
  const rec = id ? findArtworkById(galleryData, id) : { id: getNextId(galleryData) };
  rec.artistId = artistId; rec.title = title; rec.year = year ? Number(year) : undefined;
  rec.medium = medium; rec.size = size; rec.price = Number(price);
  rec.status = status; rec.buyer = status === 'Sold' ? buyer : undefined;
  if (!id) galleryData.artworks.push(rec);
  saveData(galleryData);
  showMessage(id ? 'Artwork updated.' : 'Artwork added.', false);
  resetArtworkForm(); toggleAdminDesk(false); renderCollection();
}

// Switches view between curated gallery grid and tabular inventory.
function setViewMode(mode) {
  const isG = mode === 'gallery';
  galleryView.hidden = !isG; inventoryView.hidden = isG;
  document.getElementById('view-gallery-btn').className = 'view-btn' + (isG ? ' active' : '');
  document.getElementById('view-inventory-btn').className = 'view-btn' + (!isG ? ' active' : '');
}

// Handles Explore, Edit, Delete, view toggles, and drawer actions.
function handleActionClick(event) {
  const el = event.target.closest('[data-action]');
  if (!el) return;
  event.preventDefault();
  const action = el.getAttribute('data-action'), id = el.getAttribute('data-id');
  if (action === 'explore') openArtworkDetail(id);
  if (action === 'view-gallery') setViewMode('gallery');
  if (action === 'view-inventory') setViewMode('inventory');
  if (action === 'clear-filters') { filterSearch.value = ''; filterArtist.value = ''; filterStatus.value = ''; renderCollection(); }
  if (action === 'close-drawer') detailDrawerOverlay.classList.remove('open');
  if (action === 'edit') { detailDrawerOverlay.classList.remove('open'); const art = findArtworkById(galleryData, id); if (art) setFormForEdit(art); }
  if (action === 'delete') {
    const delErr = canDeleteArtwork(galleryData, id);
    if (delErr) { showMessage(delErr, true); return; }
    const art = findArtworkById(galleryData, id);
    if (art && confirm(`Delete '${art.title}'?`)) {
      galleryData.artworks = galleryData.artworks.filter(function (a) { return a.id !== Number(id); });
      saveData(galleryData);
      showMessage('Artwork deleted.', false);
      detailDrawerOverlay.classList.remove('open');
      renderCollection();
      if (artworkIdInput.value === String(id)) resetArtworkForm();
    }
  }
}

// Initializes the artworks collection page and binds all UI events.
function initArtworksPage() {
  renderNav('Artworks'); galleryData = loadData();
  populateArtistDropdowns(); renderCollection();
  artworkForm.addEventListener('submit', handleFormSubmit);
  artworkStatusSelect.addEventListener('change', updateBuyerFieldVisibility);
  toggleAdminBtn.addEventListener('click', function () { toggleAdminDesk(); });
  cancelBtn.addEventListener('click', function () { resetArtworkForm(); toggleAdminDesk(false); });
  document.addEventListener('click', handleActionClick);
  filterArtist.addEventListener('change', renderCollection); filterStatus.addEventListener('change', renderCollection);
  filterSearch.addEventListener('input', renderCollection);
  detailDrawerOverlay.addEventListener('click', function (e) { if (e.target === detailDrawerOverlay) detailDrawerOverlay.classList.remove('open'); });
  if (window.location.search.indexOf('action=new') !== -1) toggleAdminDesk(true);
}

initArtworksPage();
