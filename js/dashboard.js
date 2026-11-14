// Curatorial studio dashboard logic, operational metrics, and archive maintenance.

const emptyStateEl = document.getElementById('empty-state'), dashboardContentEl = document.getElementById('dashboard-content');
const countsRow = document.getElementById('counts-row'), operationalStrip = document.getElementById('operational-strip');
const onNowContainer = document.getElementById('on-now-container'), upcomingContainer = document.getElementById('upcoming-container');
const loadSampleBtn = document.getElementById('load-sample-btn'), eraseAllBtn = document.getElementById('erase-all-btn'), emptyLoadSampleBtn = document.getElementById('empty-load-sample-btn');
let galleryData = null;

// Checks whether all core gallery collections in storage are empty.
function isStoreEmpty(data) {
  return data.artists.length === 0 && data.artworks.length === 0 && data.spaces.length === 0 && data.exhibitions.length === 0;
}

// Renders four primary archive count cards for core inventory.
function renderCounts(data) {
  countsRow.innerHTML = `
    <div class="count-item"><div class="count-num">${data.artists.length}</div><div class="count-label">Artists</div><div class="count-desc">Living profiles</div></div>
    <div class="count-item"><div class="count-num">${data.artworks.length}</div><div class="count-label">Artworks</div><div class="count-desc">Catalogued pieces</div></div>
    <div class="count-item"><div class="count-num">${data.spaces.length}</div><div class="count-label">Spaces</div><div class="count-desc">Display wings</div></div>
    <div class="count-item"><div class="count-num">${data.exhibitions.length}</div><div class="count-label">Exhibitions</div><div class="count-desc">Scheduled shows</div></div>
  `;
}

// Renders operational status strip showing artwork availability and wing allocations.
function renderOperationalStrip(data) {
  let avail = 0, res = 0, sold = 0;
  for (let i = 0; i < data.artworks.length; i++) {
    const st = data.artworks[i].status;
    if (st === 'Available') avail++; else if (st === 'Reserved') res++; else if (st === 'Sold') sold++;
  }
  const onNowEx = data.exhibitions.filter(function (e) { return getExhibitionStatus(e) === 'On now'; });
  const activeSpaces = {};
  for (let j = 0; j < onNowEx.length; j++) {
    const pl = getPlacementsForExhibition(data, onNowEx[j].id);
    for (let k = 0; k < pl.length; k++) activeSpaces[pl[k].spaceId] = true;
  }
  const activeWingCount = Object.keys(activeSpaces).length;
  operationalStrip.innerHTML = `
    <div class="operational-group"><span class="operational-label">Collection Status:</span><div class="status-pill-row"><span class="badge badge-available">${avail} Available</span><span class="badge badge-upcoming">${res} Reserved</span><span class="badge badge-sold">${sold} Sold</span></div></div>
    <div class="operational-group"><span class="operational-label">Physical Architecture:</span><span style="font-family:var(--font-mono); font-size:12px; font-weight:bold; color:var(--ink-primary);">${activeWingCount} of ${data.spaces.length} Wings in Live Exhibition</span></div>
  `;
}

// Builds room item HTML with space name and visual occupancy meter bar.
function buildSpaceUsageHtml(data, exId, spaceId) {
  const space = findSpaceById(data, spaceId);
  const places = data.placements.filter(function (p) { return p.exhibitionId === exId && p.spaceId === spaceId; });
  const cap = space ? space.capacity : 0, name = escapeHtml(space ? space.name : 'Gallery Room');
  return `<div class="studio-room-item"><div class="studio-room-item-head"><span>${name}</span><span>${places.length} of ${cap} slots</span></div>${renderOccupancyBar(places.length, cap)}</div>`;
}

// Lists currently running exhibitions with placement counts and room occupancy meters.
function renderOnNowExhibitions(data) {
  const onNow = data.exhibitions.filter(function (ex) { return getExhibitionStatus(ex) === 'On now'; });
  const qPlace = document.getElementById('quick-placements-btn'), qCat = document.getElementById('quick-catalogue-btn');
  if (onNow.length > 0) {
    if (qPlace) qPlace.href = `exhibition.html?id=${onNow[0].id}`;
    if (qCat) qCat.href = `catalogue.html?id=${onNow[0].id}`;
  }
  if (onNow.length === 0) {
    onNowContainer.innerHTML = '<p class="label-meta">No exhibitions currently on view in gallery rooms.</p>';
    return;
  }
  let html = '';
  for (let i = 0; i < onNow.length; i++) {
    const ex = onNow[i], places = getPlacementsForExhibition(data, ex.id);
    const countText = `${places.length} ${places.length === 1 ? 'artwork' : 'artworks'} on view`;
    const dates = `${formatDate(ex.startDate)} to ${formatDate(ex.endDate)}`;
    html += `<article class="studio-exhibition-card"><div class="studio-exhibition-header"><div><h3 class="studio-exhibition-title"><a href="exhibition.html?id=${ex.id}">${escapeHtml(ex.title)}</a></h3><p class="studio-exhibition-meta">${dates} &bull; ${countText}</p></div>${renderStatusBadge('On now')}</div>`;
    if (ex.description) html += `<p style="font-size:14px; color:var(--ink-secondary); margin:0;">${escapeHtml(ex.description)}</p>`;
    const spaceIds = [];
    for (let j = 0; j < places.length; j++) {
      if (spaceIds.indexOf(places[j].spaceId) === -1) spaceIds.push(places[j].spaceId);
    }
    if (spaceIds.length > 0) {
      html += '<div class="studio-rooms-grid">';
      for (let k = 0; k < spaceIds.length; k++) html += buildSpaceUsageHtml(data, ex.id, spaceIds[k]);
      html += '</div>';
    }
    html += `<div class="studio-card-actions"><a href="exhibition.html?id=${ex.id}" class="btn" style="font-size:11px; padding:6px 12px;">Manage Exhibition</a><a href="catalogue.html?id=${ex.id}" class="btn secondary" style="font-size:11px; padding:6px 12px;">Open Catalogue</a></div></article>`;
  }
  onNowContainer.innerHTML = html;
}

// Lists upcoming exhibitions ordered chronologically by start date.
function renderUpcomingExhibitions(data) {
  const upcoming = data.exhibitions.filter(function (ex) { return getExhibitionStatus(ex) === 'Upcoming'; });
  upcoming.sort(function (a, b) { return a.startDate.localeCompare(b.startDate); });
  if (upcoming.length === 0) {
    upcomingContainer.innerHTML = '<p class="label-meta">No upcoming exhibitions scheduled on the calendar.</p>';
    return;
  }
  let html = '';
  for (let i = 0; i < upcoming.length; i++) {
    const ex = upcoming[i], places = getPlacementsForExhibition(data, ex.id);
    const countText = `${places.length} works allocated`;
    const dates = `${formatDate(ex.startDate)} &ndash; ${formatDate(ex.endDate)}`;
    html += `<div class="studio-upcoming-item"><div class="studio-upcoming-item-info"><h4><a href="exhibition.html?id=${ex.id}">${escapeHtml(ex.title)}</a></h4><p class="studio-upcoming-meta">${dates} &bull; ${countText} &bull; Theme: ${escapeHtml(ex.theme || 'Curatorial survey')}</p></div><div style="display:flex; gap:8px; align-items:center;">${renderStatusBadge('Upcoming')} <a href="exhibition.html?id=${ex.id}" class="btn secondary" style="font-size:11px; padding:4px 8px;">View</a></div></div>`;
  }
  upcomingContainer.innerHTML = html;
}

// Updates the dashboard display showing either empty state or active records.
function renderDashboard() {
  const empty = isStoreEmpty(galleryData);
  emptyStateEl.hidden = !empty; dashboardContentEl.hidden = empty;
  if (!empty) {
    renderCounts(galleryData);
    renderOperationalStrip(galleryData);
    renderOnNowExhibitions(galleryData);
    renderUpcomingExhibitions(galleryData);
  }
}

// Populates localStorage with curated demonstration collection.
function loadSampleData() {
  const d = getCuratedDemoData();
  saveData(d);
  return d;
}

// Handles user request to restore the curated demo collection.
function handleLoadSampleClick() {
  if (!confirm('Load curated demonstration collection?')) return;
  galleryData = loadSampleData();
  showMessage('Curated collection loaded successfully.', false);
  renderDashboard();
}

// Confirms and erases all records from localStorage.
function handleEraseAllClick() {
  if (!confirm('Erase all gallery data? This action cannot be undone.')) return;
  galleryData = { artists: [], artworks: [], spaces: [], exhibitions: [], placements: [], nextId: 1 };
  saveData(galleryData);
  showMessage('All gallery data erased.', false);
  renderDashboard();
}

// Initializes top navigation, reads storage, and sets up dashboard listeners.
function initDashboard() {
  renderNav('Workspace');
  galleryData = loadData();
  renderDashboard();
  loadSampleBtn.addEventListener('click', handleLoadSampleClick);
  eraseAllBtn.addEventListener('click', handleEraseAllClick);
  if (emptyLoadSampleBtn) emptyLoadSampleBtn.addEventListener('click', handleLoadSampleClick);
}

initDashboard();
