// Shared UI helpers for navigation, formatting, and feedback.

// Fills nav with brand and links, marking the active page.
function renderNav(activePage) {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const items = [
    { name: 'Dashboard', href: 'index.html' },
    { name: 'Artists', href: 'artists.html' },
    { name: 'Artworks', href: 'artworks.html' },
    { name: 'Spaces', href: 'spaces.html' },
    { name: 'Exhibitions', href: 'exhibitions.html' }
  ];
  let html = '<span class="brand">Gallery Ledger</span><div class="nav-links">';
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const active = item.name.toLowerCase() === activePage.toLowerCase() ? ' class="active"' : '';
    html += `<a href="${item.href}"${active}>${item.name}</a>`;
  }
  html += '</div>';
  nav.innerHTML = html;
}

// Escapes special characters for safe insertion into HTML.
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

// Displays a status or error message in #message container.
function showMessage(text, isError) {
  const box = document.getElementById('message');
  if (!box) return;
  box.textContent = text || '';
  if (!text) {
    box.className = 'message';
    return;
  }
  if (isError) {
    box.className = 'message error';
  } else {
    box.className = 'message success';
  }
}
