// Artist profile page logic: details, artworks portfolio, and exhibition history.

const profileContent = document.getElementById('profile-content');
let galleryData = null;

// Gathers all unique exhibitions where the artist's works were placed.
function getExhibitionsForArtist(artistId) {
  const artworks = getArtworksForArtist(galleryData, artistId);
  const exhibitionIds = [];
  for (let i = 0; i < artworks.length; i++) {
    const places = getPlacementsForArtwork(galleryData, artworks[i].id);
    for (let j = 0; j < places.length; j++) {
      const exId = places[j].exhibitionId;
      if (exhibitionIds.indexOf(exId) === -1) {
        exhibitionIds.push(exId);
      }
    }
  }
  const exhibitions = [];
  for (let k = 0; k < exhibitionIds.length; k++) {
    const ex = findExhibitionById(galleryData, exhibitionIds[k]);
    if (ex) exhibitions.push(ex);
  }
  return exhibitions;
}

// Renders the not found state when artist id does not exist.
function renderNotFound() {
  profileContent.innerHTML = `
    <h1>Artist not found</h1>
    <p>The requested artist does not exist.</p>
    <p><a href="artists.html">&larr; Back to artists</a></p>
  `;
}

// Builds the HTML table displaying the artist's artworks.
function buildArtworksTableHtml(artworks) {
  if (artworks.length === 0) return '<p>No artworks recorded yet.</p>';
  let html = '<table><thead><tr><th>Title</th><th>Year</th><th>Medium</th><th class="num">Price</th><th>Status</th></tr></thead><tbody>';
  for (let i = 0; i < artworks.length; i++) {
    const art = artworks[i];
    const sClass = art.status === 'Sold' ? ' class="sold"' : '';
    const yearStr = art.year ? String(art.year) : '—';
    html += `<tr><td>${escapeHtml(art.title)}</td><td>${escapeHtml(yearStr)}</td><td>${escapeHtml(art.medium)}</td><td class="num">${formatPrice(art.price)}</td><td${sClass}>${escapeHtml(art.status)}</td></tr>`;
  }
  return html + '</tbody></table>';
}

// Builds the HTML table displaying the artist's exhibition history.
function buildExhibitionsTableHtml(exhibitions) {
  if (exhibitions.length === 0) {
    return '<p>No exhibitions yet.</p>';
  }
  let html = `
    <table>
      <thead>
        <tr>
          <th>Exhibition</th>
          <th>Dates</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
  `;
  for (let i = 0; i < exhibitions.length; i++) {
    const ex = exhibitions[i];
    const status = getExhibitionStatus(ex);
    html += `
      <tr>
        <td><a href="exhibition.html?id=${ex.id}">${escapeHtml(ex.title)}</a></td>
        <td>${formatDate(ex.startDate)} to ${formatDate(ex.endDate)}</td>
        <td>${escapeHtml(status)}</td>
      </tr>
    `;
  }
  html += '</tbody></table>';
  return html;
}

// Renders the full artist profile view.
function renderProfile(artist) {
  const artworks = getArtworksForArtist(galleryData, artist.id);
  const exhibitions = getExhibitionsForArtist(artist.id);

  const bornStr = artist.born ? `b. ${artist.born}` : '';
  const natStr = artist.nationality || '';
  const styleStr = artist.style || '';
  const metaParts = [];
  if (bornStr) metaParts.push(bornStr);
  if (natStr) metaParts.push(natStr);
  if (styleStr) metaParts.push(styleStr);
  const metaLine = metaParts.join(' · ');

  // Safe rendering via escapeHtml
  profileContent.innerHTML = `
    <p><a href="artists.html">&larr; Back to artists</a></p>
    <h1>${escapeHtml(artist.name)}</h1>
    <p class="label-meta">${escapeHtml(metaLine)}</p>
    ${artist.bio ? `<p>${escapeHtml(artist.bio)}</p>` : ''}
    <hr>
    <h2>Artworks (${artworks.length})</h2>
    ${buildArtworksTableHtml(artworks)}
    <hr>
    <h2>Exhibitions (${exhibitions.length})</h2>
    ${buildExhibitionsTableHtml(exhibitions)}
  `;
}

// Initializes the artist profile page.
function initArtistProfile() {
  renderNav('Artists');
  galleryData = loadData();
  const id = getIdFromUrl();
  if (!id) {
    renderNotFound();
    return;
  }
  const artist = findArtistById(galleryData, id);
  if (!artist) {
    renderNotFound();
    return;
  }
  renderProfile(artist);
}

initArtistProfile();
