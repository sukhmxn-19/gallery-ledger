// Shared UI helpers for navigation, curatorial badges, occupancy meters, and feedback.

// Formats today's local date in an archival format for the masthead.
function getArchivalTodayString() {
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

// Fills nav with gallery masthead, primary gallery links, studio link, and mobile toggle.
function renderNav(activePage) {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const items = [
    { name: 'Home', href: 'index.html' },
    { name: 'Exhibitions', href: 'exhibitions.html' },
    { name: 'Artworks', href: 'artworks.html' },
    { name: 'Artists', href: 'artists.html' },
    { name: 'Spaces', href: 'spaces.html' }
  ];
  let linksHtml = '';
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const active = item.name.toLowerCase() === activePage.toLowerCase() ? ' class="active"' : '';
    linksHtml += `<a href="${item.href}"${active}>${item.name}</a>`;
  }
  const isWs = activePage.toLowerCase() === 'workspace' || activePage.toLowerCase() === 'dashboard';
  const wsActive = isWs ? ' class="nav-workspace-link active"' : ' class="nav-workspace-link"';
  nav.innerHTML = `
    <a href="index.html" class="brand-block">
      <span class="brand">GALLERY LEDGER</span>
      <span class="brand-sub">Contemporary Art Gallery &amp; Archive</span>
    </a>
    <button type="button" class="nav-toggle" id="nav-toggle" aria-label="Toggle navigation menu">
      <span class="nav-toggle-bar"></span>
      <span class="nav-toggle-bar"></span>
      <span class="nav-toggle-bar"></span>
    </button>
    <div class="nav-links" id="nav-links">
      ${linksHtml}
      <a href="dashboard.html"${wsActive} title="Curatorial Workspace &amp; Administration">Curatorial Studio</a>
      <span class="nav-date">${getArchivalTodayString()}</span>
    </div>
  `;
  const toggleBtn = document.getElementById('nav-toggle');
  const linksBox = document.getElementById('nav-links');
  if (toggleBtn && linksBox) {
    toggleBtn.addEventListener('click', function () {
      linksBox.classList.toggle('nav-open');
    });
  }
}

// Escapes special characters for safe insertion into HTML strings.
function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Formats a number as Indian Rupee currency.
function formatPrice(number) {
  const n = Number(number) || 0;
  return '₹ ' + n.toLocaleString('en-IN');
}

// Formats a YYYY-MM-DD date string to DD Mon YYYY.
function formatDate(yyyymmdd) {
  if (!yyyymmdd || typeof yyyymmdd !== 'string') return '';
  const parts = yyyymmdd.split('-');
  if (parts.length !== 3) return yyyymmdd;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const mIndex = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  if (mIndex < 0 || mIndex > 11) return yyyymmdd;
  return `${day} ${months[mIndex]} ${parts[0]}`;
}

// Reads the ?id= parameter from URL query string.
function getIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get('id'));
  if (isNaN(id) || id <= 0) return 0;
  return id;
}

// Renders an editorial status badge with an indicator light.
function renderStatusBadge(status) {
  const clean = (status || '').trim();
  let badgeClass = 'badge';
  if (clean === 'On now') badgeClass = 'badge badge-live';
  else if (clean === 'Upcoming') badgeClass = 'badge badge-upcoming';
  else if (clean === 'Closed') badgeClass = 'badge badge-closed';
  else if (clean === 'Available') badgeClass = 'badge badge-available';
  else if (clean === 'Reserved') badgeClass = 'badge badge-reserved';
  else if (clean === 'Sold') badgeClass = 'badge badge-sold';
  return `<span class="${badgeClass}"><span class="badge-dot"></span>${escapeHtml(clean)}</span>`;
}

// Builds a graphical room occupancy meter bar with percentage fill and capacity ratio.
function renderOccupancyBar(current, capacity) {
  const curr = Number(current) || 0;
  const cap = Number(capacity) || 1;
  const pct = Math.min(100, Math.round((curr / cap) * 100));
  let tier = 'meter-sage';
  if (pct >= 100) tier = 'meter-terracotta';
  else if (pct >= 70) tier = 'meter-ochre';
  return `
    <div class="meter-box">
      <div class="meter-label-row">
        <span>Wall Occupancy</span>
        <span>${curr} / ${cap} works (${pct}%)</span>
      </div>
      <div class="meter-track">
        <div class="meter-fill ${tier}" style="width: ${pct}%;"></div>
      </div>
    </div>
  `;
}

// Displays a status or error message in #message container.
function showMessage(text, isError) {
  const box = document.getElementById('message');
  if (!box) return;
  box.textContent = text || '';
  if (!text) {
    box.className = 'message';
    return;
  }
  box.className = isError ? 'message error' : 'message success';
}

// Resolves local SVG illustration path for an artwork record.
function getArtworkImage(art) {
  if (!art) return 'img/artwork-fold-study.svg';
  const idMap = {
    10: 'fold-study', 11: 'pressure-plane', 12: 'between-two-edges', 13: 'quiet-grid',
    14: 'window-417pm', 15: 'soft-architecture', 16: 'luminous-interval', 17: 'rooms-in-memory',
    18: 'stone-constellation', 19: 'orbit-notation', 20: 'field-of-witnesses', 21: 'between-frames'
  };
  if (idMap[art.id]) return `img/artwork-${idMap[art.id]}.svg`;
  const t = (art.title || '').toLowerCase();
  if (t.indexOf('fold') !== -1) return 'img/artwork-fold-study.svg';
  if (t.indexOf('pressure') !== -1) return 'img/artwork-pressure-plane.svg';
  if (t.indexOf('edge') !== -1) return 'img/artwork-between-two-edges.svg';
  if (t.indexOf('grid') !== -1) return 'img/artwork-quiet-grid.svg';
  if (t.indexOf('window') !== -1) return 'img/artwork-window-417pm.svg';
  if (t.indexOf('soft') !== -1) return 'img/artwork-soft-architecture.svg';
  if (t.indexOf('interval') !== -1) return 'img/artwork-luminous-interval.svg';
  if (t.indexOf('rooms') !== -1) return 'img/artwork-rooms-in-memory.svg';
  if (t.indexOf('stone') !== -1) return 'img/artwork-stone-constellation.svg';
  if (t.indexOf('orbit') !== -1) return 'img/artwork-orbit-notation.svg';
  if (t.indexOf('witness') !== -1) return 'img/artwork-field-of-witnesses.svg';
  if (t.indexOf('frame') !== -1) return 'img/artwork-between-frames.svg';
  return 'img/artwork-fold-study.svg';
}

// Resolves local SVG curated plate for an exhibition.
function getExhibitionImage(ex) {
  if (!ex) return 'img/exhibition-act-of-looking.svg';
  const t = (ex.title || '').toLowerCase();
  if (t.indexOf('looking') !== -1 || ex.id === 7) return 'img/exhibition-act-of-looking.svg';
  if (t.indexOf('light') !== -1 || ex.id === 8) return 'img/exhibition-rooms-for-light.svg';
  if (t.indexOf('matter') !== -1 || ex.id === 9) return 'img/exhibition-notes-in-matter.svg';
  return 'img/exhibition-act-of-looking.svg';
}

// Resolves local SVG architectural perspective for a gallery space.
function getSpaceImage(space) {
  if (!space) return 'img/space-north-gallery.svg';
  const n = (space.name || '').toLowerCase();
  if (n.indexOf('project') !== -1 || space.id === 5) return 'img/space-project-room.svg';
  if (n.indexOf('alcove') !== -1 || n.indexOf('screening') !== -1 || space.id === 6) return 'img/space-screening-alcove.svg';
  return 'img/space-north-gallery.svg';
}
