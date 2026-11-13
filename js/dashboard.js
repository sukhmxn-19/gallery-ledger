// Dashboard page logic, inventory counts, and sample data controls.

const emptyStateEl = document.getElementById('empty-state');
const dashboardContentEl = document.getElementById('dashboard-content');
const countsRow = document.getElementById('counts-row');
const onNowContainer = document.getElementById('on-now-container');
const upcomingContainer = document.getElementById('upcoming-container');
const loadSampleBtn = document.getElementById('load-sample-btn');
const eraseAllBtn = document.getElementById('erase-all-btn');
let galleryData = null;

// Checks whether all core gallery collections in storage are empty.
function isStoreEmpty(data) {
  return data.artists.length === 0 && data.artworks.length === 0 && data.spaces.length === 0 && data.exhibitions.length === 0;
}

// Renders the four main entity totals in the dashboard count row.
function renderCounts(data) {
  countsRow.innerHTML = `<div class="count-item"><div class="count-num">${data.artists.length}</div><div class="count-label">Artists</div></div><div class="count-item"><div class="count-num">${data.artworks.length}</div><div class="count-label">Artworks</div></div><div class="count-item"><div class="count-num">${data.spaces.length}</div><div class="count-label">Spaces</div></div><div class="count-item"><div class="count-num">${data.exhibitions.length}</div><div class="count-label">Exhibitions</div></div>`;
}

// Formats a room occupancy line displaying current placements over capacity.
function buildSpaceUsageLine(data, exId, spaceId) {
  const space = findSpaceById(data, spaceId);
  const places = data.placements.filter(function (p) {
    return p.exhibitionId === exId && p.spaceId === spaceId;
  });
  return `${escapeHtml(space ? space.name : 'Space')} ${places.length} / ${space ? space.capacity : 0}`;
}

// Lists currently running exhibitions with placement counts and room occupancy.
function renderOnNowExhibitions(data) {
  const onNow = data.exhibitions.filter(function (ex) { return getExhibitionStatus(ex) === 'On now'; });
  if (onNow.length === 0) {
    onNowContainer.innerHTML = '<p>No exhibitions currently on view.</p>';
    return;
  }
  let html = '';
  for (let i = 0; i < onNow.length; i++) {
    const ex = onNow[i];
    const places = getPlacementsForExhibition(data, ex.id);
    const countText = `${places.length} ${places.length === 1 ? 'artwork' : 'artworks'}`;
    const dates = `${formatDate(ex.startDate)} to ${formatDate(ex.endDate)}`;
    html += `<div class="label-card"><h3><a href="exhibition.html?id=${ex.id}">${escapeHtml(ex.title)}</a></h3><p class="label-meta">${dates} · ${countText}</p>`;
    const spaceIds = [];
    for (let j = 0; j < places.length; j++) {
      if (spaceIds.indexOf(places[j].spaceId) === -1) spaceIds.push(places[j].spaceId);
    }
    for (let k = 0; k < spaceIds.length; k++) {
      html += `<p class="label-meta">${buildSpaceUsageLine(data, ex.id, spaceIds[k])}</p>`;
    }
    html += '</div>';
  }
  onNowContainer.innerHTML = html;
}

// Lists upcoming exhibitions ordered chronologically by start date.
function renderUpcomingExhibitions(data) {
  const upcoming = data.exhibitions.filter(function (ex) { return getExhibitionStatus(ex) === 'Upcoming'; });
  upcoming.sort(function (a, b) { return a.startDate.localeCompare(b.startDate); });
  if (upcoming.length === 0) {
    upcomingContainer.innerHTML = '<p>No upcoming exhibitions scheduled.</p>';
    return;
  }
  let html = '';
  for (let i = 0; i < upcoming.length; i++) {
    const ex = upcoming[i];
    const places = getPlacementsForExhibition(data, ex.id);
    const countText = `${places.length} ${places.length === 1 ? 'artwork' : 'artworks'}`;
    const dates = `${formatDate(ex.startDate)} to ${formatDate(ex.endDate)}`;
    html += `<div class="label-card"><h3><a href="exhibition.html?id=${ex.id}">${escapeHtml(ex.title)}</a></h3><p class="label-meta">${dates} · ${countText}</p></div>`;
  }
  upcomingContainer.innerHTML = html;
}

// Updates the dashboard display showing either empty state or active records.
function renderDashboard() {
  const empty = isStoreEmpty(galleryData);
  emptyStateEl.hidden = !empty;
  dashboardContentEl.hidden = empty;
  if (!empty) {
    renderCounts(galleryData);
    renderOnNowExhibitions(galleryData);
    renderUpcomingExhibitions(galleryData);
  }
}

// Generates a local date string offset from today by a specified number of days.
function formatOffsetDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

// Returns four fictional artist records for demonstration.
function getSampleArtists() {
  return [
    { id: 1, name: 'Meera Kohli', born: 1978, nationality: 'Indian', style: 'Printmaking', bio: 'Specializes in architectural woodblock prints.' },
    { id: 2, name: 'Tomas Reyes', born: 1965, nationality: 'Spanish', style: 'Sculpture', bio: 'Creates monumental works from reclaimed steel and stone.' },
    { id: 3, name: 'Anika Rao', born: 1990, nationality: 'Indian', style: 'Oil painting', bio: 'Explores domestic memory using natural earth pigments.' },
    { id: 4, name: 'Lukas Brandt', born: 1983, nationality: 'German', style: 'Photography', bio: 'Documents post-industrial transition landscapes.' }
  ];
}

// Returns three gallery space records with physical capacities.
function getSampleSpaces() {
  return [
    { id: 5, name: 'North Hall', capacity: 6, note: 'Main gallery with skylights' },
    { id: 6, name: 'Garden Room', capacity: 4, note: 'East wing facing courtyard' },
    { id: 7, name: 'Long Corridor', capacity: 8, note: 'Connecting hall with track lighting' }
  ];
}

// Returns nine artworks spanning available, reserved, and sold statuses.
function getSampleArtworks() {
  return [
    { id: 8, artistId: 1, title: 'Morning Shadows', year: 2023, medium: 'Woodcut print', size: '60 × 45 cm', price: 28000, status: 'Available', buyer: '' },
    { id: 9, artistId: 1, title: 'Monsoon Canopy', year: 2024, medium: 'Etching', size: '50 × 40 cm', price: 34000, status: 'Available', buyer: '' },
    { id: 10, artistId: 2, title: 'Torso in Steel', year: 2021, medium: 'Welded steel', size: '90 × 40 cm', price: 185000, status: 'Available', buyer: '' },
    { id: 11, artistId: 2, title: 'Sentinel II', year: 2023, medium: 'Limestone and iron', size: '110 × 35 cm', price: 240000, status: 'Available', buyer: '' },
    { id: 12, artistId: 3, title: 'Interior at Dusk', year: 2024, medium: 'Oil on linen', size: '120 × 90 cm', price: 160000, status: 'Reserved', buyer: '' },
    { id: 13, artistId: 3, title: 'Still Life with Quinces', year: 2022, medium: 'Oil on panel', size: '40 × 30 cm', price: 45000, status: 'Available', buyer: '' },
    { id: 14, artistId: 4, title: 'Reflections on the Spree', year: 2023, medium: 'Archival print', size: '100 × 70 cm', price: 55000, status: 'Available', buyer: '' },
    { id: 15, artistId: 4, title: 'Concrete Horizon', year: 2022, medium: 'Gelatin print', size: '80 × 60 cm', price: 38000, status: 'Available', buyer: '' },
    { id: 16, artistId: 1, title: 'Passing Rain', year: 2021, medium: 'Linocut on paper', size: '30 × 30 cm', price: 18000, status: 'Sold', buyer: 'Private Collector' }
  ];
}

// Builds three exhibitions and seven placements relative to today.
function getSampleSchedule() {
  const exhibitions = [
    { id: 17, title: 'Urban Fragments', theme: 'Architecture', description: 'Monochrome prints of changing cities.', startDate: formatOffsetDate(-30), endDate: formatOffsetDate(-10) },
    { id: 18, title: 'Forms of Earth and Steel', theme: 'Materiality', description: 'Contemporary sculpture and textured paintings.', startDate: formatOffsetDate(-7), endDate: formatOffsetDate(14) },
    { id: 19, title: 'New Printmakers', theme: 'Contemporary Graphics', description: 'Survey of contemporary relief techniques.', startDate: formatOffsetDate(20), endDate: formatOffsetDate(45) }
  ];
  const placements = [
    { id: 20, exhibitionId: 18, artworkId: 10, spaceId: 5 },
    { id: 21, exhibitionId: 18, artworkId: 11, spaceId: 5 },
    { id: 22, exhibitionId: 18, artworkId: 12, spaceId: 5 },
    { id: 23, exhibitionId: 18, artworkId: 13, spaceId: 6 },
    { id: 24, exhibitionId: 18, artworkId: 14, spaceId: 6 },
    { id: 25, exhibitionId: 19, artworkId: 8, spaceId: 7 },
    { id: 26, exhibitionId: 19, artworkId: 9, spaceId: 7 }
  ];
  return { exhibitions: exhibitions, placements: placements };
}

// Populates localStorage with demonstration records if store is empty.
function loadSampleData() {
  const s = getSampleSchedule();
  const d = { artists: getSampleArtists(), spaces: getSampleSpaces(), artworks: getSampleArtworks(), exhibitions: s.exhibitions, placements: s.placements, nextId: 27 };
  saveData(d);
  return d;
}

// Handles user request to populate the gallery with sample demo data.
function handleLoadSampleClick() {
  if (!isStoreEmpty(galleryData)) {
    showMessage('Sample data can only be loaded when the store is empty.', true);
    return;
  }
  if (!confirm('Load sample demonstration data?')) return;
  galleryData = loadSampleData();
  showMessage('Sample data loaded.', false);
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
  renderNav('Dashboard');
  galleryData = loadData();
  renderDashboard();
  loadSampleBtn.addEventListener('click', handleLoadSampleClick);
  eraseAllBtn.addEventListener('click', handleEraseAllClick);
}

initDashboard();
