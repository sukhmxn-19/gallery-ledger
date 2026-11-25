// Exhibitions directory presentation, dynamic status filtering, and administration.

const exhibitionForm = document.getElementById('exhibition-form');
const exhibitionIdInput = document.getElementById('exhibition-id');
const titleInput = document.getElementById('exhibition-title');
const themeInput = document.getElementById('exhibition-theme');
const descInput = document.getElementById('exhibition-description');
const startInput = document.getElementById('exhibition-start');
const endInput = document.getElementById('exhibition-end');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const formHeading = document.getElementById('form-heading');
const adminPanel = document.getElementById('admin-panel');
const toggleAdminBtn = document.getElementById('toggle-admin-btn');
const filterBar = document.getElementById('filter-bar');
const featuredEl = document.getElementById('featured-showcase-container');
const directoryEl = document.getElementById('directory-grid-container');
const emptyStateEl = document.getElementById('empty-state');
const emptyScheduleBtn = document.getElementById('empty-schedule-btn');
let galleryData = null;
let activeFilter = 'all';

// Validates input fields and scheduling business rules.
function validateExhibition(title, start, end, desc, editId) {
  const req = checkRequired(title, 'Title') || checkRequired(start, 'Start date') || checkRequired(end, 'End date');
  if (req) return req;
  const uniqueErr = checkExhibitionTitle(galleryData, title, editId);
  if (uniqueErr) return uniqueErr;
  const dateErr = checkExhibitionDatesOrder(start, end);
  if (dateErr) return dateErr;
  if (desc && desc.length > 400) return 'Description cannot exceed 400 characters.';
  if (editId) {
    const clashErr = checkExhibitionDates(galleryData, editId, start, end);
    if (clashErr) return clashErr;
  }
  return '';
}

// Toggles display visibility of curatorial scheduling desk.
function toggleAdminDesk(show) {
  const target = (show !== undefined) ? !show : !adminPanel.hidden;
  adminPanel.hidden = target;
  toggleAdminBtn.textContent = target ? '✦ Schedule Exhibition' : '✕ Close Scheduling Desk';
}

// Resets curatorial scheduling form to default blank add state.
function resetExhibitionForm() {
  exhibitionForm.reset();
  exhibitionIdInput.value = '';
  submitBtn.textContent = 'Save Exhibition';
  cancelBtn.hidden = true;
  formHeading.textContent = 'Schedule New Exhibition';
}

// Populates form inputs with exhibition details for editing.
function setFormForEdit(ex) {
  exhibitionIdInput.value = ex.id;
  titleInput.value = ex.title;
  themeInput.value = ex.theme || '';
  descInput.value = ex.description || '';
  startInput.value = ex.startDate;
  endInput.value = ex.endDate;
  submitBtn.textContent = 'Save Changes';
  cancelBtn.hidden = false;
  formHeading.textContent = 'Edit Exhibition Record';
  toggleAdminDesk(true);
  adminPanel.scrollIntoView({ behavior: 'smooth' });
}

// Builds the HTML for an exhibition card (prominent spotlight or standard card).
function buildExhibitionCard(ex, isSpotlight) {
  const status = getExhibitionStatus(ex);
  const places = getPlacementsForExhibition(galleryData, ex.id);
  const dates = `${formatDate(ex.startDate)} &ndash; ${formatDate(ex.endDate)}`;
  const img = getExhibitionImage(ex);
  const title = escapeHtml(ex.title);
  if (isSpotlight) {
    return `<section class="featured-spotlight"><div class="spotlight-media"><img src="${img}" alt="${title}"></div><div class="spotlight-body"><div class="spotlight-meta-top">${renderStatusBadge(status)}<span class="card-dates">${dates}</span></div><div><h2 class="spotlight-title"><a href="exhibition.html?id=${ex.id}">${title}</a></h2><p class="spotlight-theme">Theme: ${escapeHtml(ex.theme || 'Archival survey')}</p><p class="spotlight-desc">${escapeHtml(ex.description || 'Curated survey.')}</p></div><div class="spotlight-footer"><span class="card-count">${places.length} works placed</span><div class="card-actions"><a href="exhibition.html?id=${ex.id}" class="btn">Explore Exhibition</a><a href="catalogue.html?id=${ex.id}" class="btn btn-secondary">Catalogue</a><button type="button" class="btn-secondary btn-edit" data-id="${ex.id}">Edit</button><button type="button" class="delete btn-delete" data-id="${ex.id}">Delete</button></div></div></div></section>`;
  }
  return `<article class="directory-card"><div class="directory-card-media"><img src="${img}" alt="${title}"></div><div class="directory-card-body"><div class="directory-card-meta">${renderStatusBadge(status)}<span class="card-dates">${dates}</span></div><h3 class="directory-card-title"><a href="exhibition.html?id=${ex.id}">${title}</a></h3><p class="directory-card-theme">${escapeHtml(ex.theme || 'Study')}</p><p class="directory-card-desc">${escapeHtml(ex.description || '')}</p><div class="directory-card-foot"><span class="card-count">${places.length} works</span><div class="card-actions"><a href="exhibition.html?id=${ex.id}" class="btn">Explore</a><button type="button" class="btn-secondary btn-edit" data-id="${ex.id}">Edit</button><button type="button" class="delete btn-delete" data-id="${ex.id}">Delete</button></div></div></div></article>`;
}

// Filters exhibitions by active tab: all, on-now, upcoming, or closed.
function getFilteredExhibitions() {
  const sorted = galleryData.exhibitions.slice().sort(function (a, b) {
    return b.startDate.localeCompare(a.startDate);
  });
  if (activeFilter === 'all') return sorted;
  return sorted.filter(function (ex) {
    return getExhibitionStatus(ex).toLowerCase().replace(' ', '-') === activeFilter;
  });
}

// Renders the spotlight card and directory grid based on active filter.
function renderExhibitionsDisplay() {
  featuredEl.innerHTML = '';
  directoryEl.innerHTML = '';
  const filtered = getFilteredExhibitions();
  if (filtered.length === 0) { emptyStateEl.hidden = false; return; }
  emptyStateEl.hidden = true;
  let spotlight = null;
  const rest = [];
  for (let i = 0; i < filtered.length; i++) {
    if (!spotlight && getExhibitionStatus(filtered[i]) === 'On now') spotlight = filtered[i];
    else rest.push(filtered[i]);
  }
  if (!spotlight && filtered.length > 0) spotlight = rest.shift();
  if (spotlight) featuredEl.innerHTML = buildExhibitionCard(spotlight, true);
  let gridHtml = '';
  for (let j = 0; j < rest.length; j++) gridHtml += buildExhibitionCard(rest[j], false);
  directoryEl.innerHTML = gridHtml;
}

// Saves a new exhibition record or updates an existing record in storage.
function saveExhibition(id, title, theme, desc, start, end) {
  if (id) {
    const ex = findExhibitionById(galleryData, id);
    if (ex) {
      ex.title = title; ex.theme = theme; ex.description = desc;
      ex.startDate = start; ex.endDate = end;
      showMessage('Exhibition record updated.', false);
    }
  } else {
    galleryData.exhibitions.push({ id: getNextId(galleryData), title: title, theme: theme, description: desc, startDate: start, endDate: end });
    showMessage('Exhibition successfully scheduled.', false);
  }
  saveData(galleryData);
}

// Handles submitting the form to schedule a new exhibition or save edits.
function handleFormSubmit(event) {
  event.preventDefault();
  const id = exhibitionIdInput.value;
  const error = validateExhibition(titleInput.value.trim(), startInput.value, endInput.value, descInput.value.trim(), id);
  if (error) { showMessage(error, true); return; }
  saveExhibition(id, titleInput.value.trim(), themeInput.value.trim(), descInput.value.trim(), startInput.value, endInput.value);
  resetExhibitionForm();
  toggleAdminDesk(false);
  renderExhibitionsDisplay();
}

// Handles clicks on edit and delete buttons in exhibition cards.
function handleCardActionClick(event) {
  const btn = event.target;
  const id = btn.getAttribute('data-id');
  if (!id) return;
  if (btn.classList.contains('btn-delete')) {
    if (confirm(getDeleteExhibitionConfirm(galleryData, id))) {
      galleryData.exhibitions = galleryData.exhibitions.filter(function (e) { return e.id !== Number(id); });
      galleryData.placements = galleryData.placements.filter(function (p) { return p.exhibitionId !== Number(id); });
      saveData(galleryData);
      showMessage('Exhibition and associated placements removed.', false);
      renderExhibitionsDisplay();
      if (exhibitionIdInput.value === String(id)) resetExhibitionForm();
    }
  } else if (btn.classList.contains('btn-edit')) {
    const ex = findExhibitionById(galleryData, id);
    if (ex) setFormForEdit(ex);
  }
}

// Switches the active category filter when a filter tab is clicked.
function handleFilterClick(event) {
  const btn = event.target;
  if (!btn.classList.contains('filter-btn')) return;
  const buttons = filterBar.querySelectorAll('.filter-btn');
  for (let i = 0; i < buttons.length; i++) buttons[i].classList.remove('active');
  btn.classList.add('active');
  activeFilter = btn.getAttribute('data-filter');
  renderExhibitionsDisplay();
}

// Initializes page navigation, loads storage data, and attaches event listeners.
function initExhibitionsPage() {
  renderNav('Exhibitions');
  galleryData = loadData();
  renderExhibitionsDisplay();
  exhibitionForm.addEventListener('submit', handleFormSubmit);
  cancelBtn.addEventListener('click', function () { resetExhibitionForm(); toggleAdminDesk(false); showMessage('', false); });
  toggleAdminBtn.addEventListener('click', function () { toggleAdminDesk(); });
  emptyScheduleBtn.addEventListener('click', function () { toggleAdminDesk(true); });
  filterBar.addEventListener('click', handleFilterClick);
  featuredEl.addEventListener('click', handleCardActionClick);
  directoryEl.addEventListener('click', handleCardActionClick);
  const editId = getIdFromUrl();
  if (editId) { const target = findExhibitionById(galleryData, editId); if (target) setFormForEdit(target); }
  if (window.location.search.indexOf('action=new') !== -1) toggleAdminDesk(true);
}

initExhibitionsPage();
