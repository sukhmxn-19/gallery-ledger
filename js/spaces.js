// Gallery spaces architectural directory, capacity gauges, and room management.

const spaceForm = document.getElementById('space-form'), spaceIdInput = document.getElementById('space-id'), spaceNameInput = document.getElementById('space-name');
const spaceCapacityInput = document.getElementById('space-capacity'), spaceNoteInput = document.getElementById('space-note'), submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn'), formHeading = document.getElementById('form-heading'), adminPanel = document.getElementById('admin-panel'), toggleAdminBtn = document.getElementById('toggle-admin-btn');
const spacesGrid = document.getElementById('spaces-grid'), tableView = document.getElementById('table-view'), tableBody = document.getElementById('spaces-table-body'), emptyState = document.getElementById('empty-state');
const spacesCountEl = document.getElementById('spaces-count'), statTotalSpaces = document.getElementById('stat-total-spaces'), statTotalCapacity = document.getElementById('stat-total-capacity');
const statActiveSpaces = document.getElementById('stat-active-spaces'), registryCountEl = document.getElementById('registry-count');
let galleryData = null;

// Validates input fields and business rules for a gallery space record.
function validateSpace(name, capacity, ignoreId) {
  const reqErr = checkRequired(name, 'Name'); if (reqErr) return reqErr;
  const uniqueErr = checkSpaceName(galleryData, name, ignoreId); if (uniqueErr) return uniqueErr;
  const cap = Number(capacity);
  if (isNaN(cap) || !Number.isInteger(cap) || cap < 1 || cap > 100) return 'Capacity must be an integer between 1 and 100.';
  return '';
}

// Toggles visibility of the collapsible curatorial space allocation desk.
function toggleAdminDesk(show) {
  const willShow = typeof show === 'boolean' ? show : adminPanel.hidden;
  adminPanel.hidden = !willShow;
  toggleAdminBtn.textContent = willShow ? '✕ Close Desk' : '✦ Register Space';
}

// Resets the space form back to add mode.
function resetSpaceForm() {
  spaceForm.reset(); spaceIdInput.value = '';
  submitBtn.textContent = 'Add space'; cancelBtn.hidden = true;
  formHeading.textContent = 'Add space';
}

// Populates the form with existing space values for editing and reveals desk.
function setFormForEdit(space) {
  spaceIdInput.value = space.id; spaceNameInput.value = space.name;
  spaceCapacityInput.value = space.capacity; spaceNoteInput.value = space.note || '';
  submitBtn.textContent = 'Save changes'; cancelBtn.hidden = false;
  formHeading.textContent = 'Edit space'; toggleAdminDesk(true);
}

// Analyzes exhibition placements, active status, and artwork load for a space.
function getSpaceExhibitionData(spaceId) {
  const places = getPlacementsForSpace(galleryData, spaceId), exMap = {}, list = [];
  for (let i = 0; i < places.length; i++) {
    const exId = places[i].exhibitionId;
    exMap[exId] = (exMap[exId] || 0) + 1;
  }
  let activeEx = null, activeCount = 0;
  for (const exId in exMap) {
    const ex = findExhibitionById(galleryData, exId);
    if (ex) {
      const status = getExhibitionStatus(ex);
      list.push({ ex: ex, count: exMap[exId], status: status });
      if (status === 'On now') { activeEx = ex; activeCount = exMap[exId]; }
    }
  }
  list.sort(function (a, b) { return b.ex.startDate.localeCompare(a.ex.startDate); });
  return { list: list, activeEx: activeEx, activeCount: activeCount };
}

// Builds HTML for an architectural gallery space card with occupancy gauge.
function buildSpaceCard(space, index, isProminent) {
  const pClass = isProminent ? ' prominent' : '', img = getSpaceImage(space);
  const data = getSpaceExhibitionData(space.id);
  const pct = Math.min(100, Math.round((data.activeCount / space.capacity) * 100));
  const meterColor = pct > 80 ? 'vermilion' : (pct > 50 ? 'ochre' : 'sage');
  let gaugeHtml = '';
  if (data.activeEx) {
    gaugeHtml = `<div class="space-gauge-module"><div class="space-gauge-head"><span class="space-gauge-title">On View: <a href="exhibition.html?id=${data.activeEx.id}">${escapeHtml(data.activeEx.title)}</a></span><span>${pct}% Occupied</span></div><div class="meter-track"><div class="meter-fill meter-${meterColor}" style="width:${pct}%;"></div></div><div class="space-gauge-foot"><span>${data.activeCount} of ${space.capacity} slots filled</span><span>${space.capacity - data.activeCount} slots free</span></div></div>`;
  } else {
    gaugeHtml = `<div class="space-gauge-module"><div class="space-gauge-head"><span class="space-gauge-title">Status: Available (Free)</span><span>0% Occupied</span></div><div class="meter-track"><div class="meter-fill meter-sage" style="width:0%;"></div></div><div class="space-gauge-foot"><span>0 of ${space.capacity} slots occupied</span><span>Full capacity available</span></div></div>`;
  }
  let exHtml = '';
  if (data.list.length > 0) {
    exHtml = '<ul class="space-exhibitions-list">';
    for (let i = 0; i < Math.min(3, data.list.length); i++) {
      const item = data.list[i];
      exHtml += `<li class="space-exhibition-item"><div><a href="exhibition.html?id=${item.ex.id}">${escapeHtml(item.ex.title)}</a> &bull; <span style="color:var(--ink-muted);">${item.count} works</span></div>${renderStatusBadge(item.status)}</li>`;
    }
    exHtml += '</ul>';
  }
  return `<article class="space-arch-card${pClass}"><div class="space-arch-media"><img src="${img}" alt="${escapeHtml(space.name)}"><span class="space-arch-media-caption">Illustrative Perspective</span></div><div class="space-arch-body"><div class="space-arch-top"><span class="space-wing-tag">WING 0${index + 1}</span><span class="space-capacity-tag">Max Cap: ${space.capacity} works</span></div><h2 class="space-arch-name">${escapeHtml(space.name)}</h2><p class="space-arch-note">${escapeHtml(space.note || 'General exhibition hall.')}</p>${gaugeHtml}${exHtml}<div class="space-arch-foot"><span class="space-arch-status-pill">${renderStatusBadge(data.activeEx ? 'On now' : 'Upcoming')}</span><div><button type="button" class="secondary" style="font-size:11px;padding:4px 8px;" data-action="edit" data-id="${space.id}">Edit</button> <button type="button" class="delete" style="font-size:11px;padding:4px 6px;" data-action="delete" data-id="${space.id}">Delete</button></div></div></div></article>`;
}

// Renders the spatial directory, staff table, and live aggregate stats.
function renderSpaces() {
  const list = galleryData.spaces;
  spacesCountEl.textContent = `${list.length} Wings`;
  registryCountEl.textContent = `${list.length} Wings`;
  statTotalSpaces.textContent = list.length;
  let totCap = 0, activeCount = 0;
  for (let i = 0; i < list.length; i++) totCap += list[i].capacity;
  statTotalCapacity.textContent = totCap;
  emptyState.hidden = list.length > 0;
  spacesGrid.innerHTML = ''; tableBody.innerHTML = '';
  for (let i = 0; i < list.length; i++) {
    const s = list[i], data = getSpaceExhibitionData(s.id);
    if (data.activeEx) activeCount++;
    spacesGrid.innerHTML += buildSpaceCard(s, i, i === 0 && list.length >= 2);
    const inUse = data.activeEx ? data.activeEx.title : (data.list.length > 0 ? `${data.list[0].ex.title} (${data.list[0].status})` : 'Free');
    tableBody.innerHTML += `<tr><td><strong>${escapeHtml(s.name)}</strong></td><td class="num">${s.capacity}</td><td>${escapeHtml(s.note || '—')}</td><td>${escapeHtml(inUse)}</td><td><button type="button" class="secondary" style="font-size:11px;padding:3px 7px;" data-action="edit" data-id="${s.id}">Edit</button> <button type="button" class="delete" style="font-size:11px;padding:3px 6px;" data-action="delete" data-id="${s.id}">Delete</button></td></tr>`;
  }
  statActiveSpaces.textContent = activeCount;
}

// Creates a new space record or updates an existing space in localStorage.
function saveSpaceRecord(id, name, capacity, note) {
  if (id) {
    const space = findSpaceById(galleryData, id);
    if (space) {
      space.name = name; space.capacity = Number(capacity); space.note = note;
      showMessage('Space updated.', false);
    }
  } else {
    galleryData.spaces.push({ id: getNextId(galleryData), name: name, capacity: Number(capacity), note: note });
    showMessage('Space added.', false);
  }
  saveData(galleryData);
}

// Handles submitting the space form for adding or updating.
function handleFormSubmit(event) {
  event.preventDefault();
  const id = spaceIdInput.value, name = spaceNameInput.value.trim();
  const capacity = spaceCapacityInput.value.trim(), note = spaceNoteInput.value.trim();
  const error = validateSpace(name, capacity, id);
  if (error) { showMessage(error, true); return; }
  saveSpaceRecord(id, name, capacity, note);
  resetSpaceForm(); toggleAdminDesk(false); renderSpaces();
}

// Switches view between architectural cards and tabular registry.
function setViewMode(mode) {
  const isG = mode === 'grid';
  spacesGrid.hidden = !isG; tableView.hidden = isG;
  document.getElementById('view-grid-btn').className = 'view-btn' + (isG ? ' active' : '');
  document.getElementById('view-table-btn').className = 'view-btn' + (!isG ? ' active' : '');
}

// Handles Edit, Delete, view toggles, and admin desk actions.
function handleActionClick(event) {
  const el = event.target.closest('[data-action]');
  if (!el) return;
  event.preventDefault();
  const action = el.getAttribute('data-action'), id = el.getAttribute('data-id');
  if (action === 'view-grid') setViewMode('grid');
  if (action === 'view-table') setViewMode('table');
  if (action === 'toggle-admin') toggleAdminDesk(true);
  if (action === 'edit') { const space = findSpaceById(galleryData, id); if (space) setFormForEdit(space); }
  if (action === 'delete') {
    const delErr = canDeleteSpace(galleryData, id);
    if (delErr) { showMessage(delErr, true); return; }
    const space = findSpaceById(galleryData, id);
    if (space && confirm(`Delete '${space.name}'?`)) {
      galleryData.spaces = galleryData.spaces.filter(function (s) { return s.id !== Number(id); });
      saveData(galleryData); showMessage('Space deleted.', false);
      renderSpaces();
      if (spaceIdInput.value === String(id)) resetSpaceForm();
    }
  }
}

// Initializes the spaces page on load.
function initSpacesPage() {
  renderNav('Spaces'); galleryData = loadData();
  renderSpaces();
  spaceForm.addEventListener('submit', handleFormSubmit);
  toggleAdminBtn.addEventListener('click', function () { toggleAdminDesk(); });
  cancelBtn.addEventListener('click', function () { resetSpaceForm(); toggleAdminDesk(false); });
  document.addEventListener('click', handleActionClick);
  if (window.location.search.indexOf('action=new') !== -1) toggleAdminDesk(true);
}

initSpacesPage();
