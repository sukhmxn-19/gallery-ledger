// Artist individual monograph and exhibition history logic.

const profileContent = document.getElementById('profile-content');
let galleryData = null;

// Extracts uppercase initials from an artist name for the archival seal.
function getArtistInitials(name) {
  const parts = (name || '').trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Gathers all unique exhibitions where the artist's works were placed.
function getExhibitionsForArtist(artistId) {
  const artworks = getArtworksForArtist(galleryData, artistId), exhibitionIds = [];
  for (let i = 0; i < artworks.length; i++) {
    const places = getPlacementsForArtwork(galleryData, artworks[i].id);
    for (let j = 0; j < places.length; j++) {
      if (exhibitionIds.indexOf(places[j].exhibitionId) === -1) exhibitionIds.push(places[j].exhibitionId);
    }
  }
  const exhibitions = [];
  for (let k = 0; k < exhibitionIds.length; k++) {
    const ex = findExhibitionById(galleryData, exhibitionIds[k]);
    if (ex) exhibitions.push(ex);
  }
  return exhibitions.sort(function (a, b) { return b.startDate.localeCompare(a.startDate); });
}

// Builds the HTML grid for works created by this artist.
function buildArtistWorksGrid(artworks) {
  if (artworks.length === 0) return '<div class="empty-curatorial"><h3>No catalogued works</h3><p>No original works by this artist are currently recorded in the collection.</p><a href="artworks.html" class="btn secondary">Register Artwork</a></div>';
  let html = '<div class="collection-grid">';
  for (let i = 0; i < artworks.length; i++) {
    const art = artworks[i], img = getArtworkImage(art), yr = art.year ? String(art.year) : '';
    html += `<article class="collection-card"><div class="collection-media"><img src="${img}" alt="${escapeHtml(art.title)}"><div class="collection-media-badge">${renderStatusBadge(art.status)}</div><span class="collection-media-demo">Plate #${art.id}</span></div><div class="collection-body"><div class="collection-top-meta"><span class="collection-medium-tag">${escapeHtml(art.medium)}</span><span class="collection-year-tag">${yr}</span></div><h3 class="collection-title">${escapeHtml(art.title)}</h3><div class="collection-dimensions">${escapeHtml(art.size || 'Dimensions unrecorded')}</div><div class="collection-foot"><span class="collection-price">${formatPrice(art.price)}</span><a href="artworks.html" class="btn secondary" style="font-size:11px;padding:4px 8px;">Collection</a></div></div></article>`;
  }
  return html + '</div>';
}

// Builds the chronological timeline displaying the artist's exhibition history.
function buildExhibitionsTimeline(exhibitions) {
  if (exhibitions.length === 0) return '<div class="empty-curatorial"><h3>No exhibition placements</h3><p>This artist does not currently have works placed in gallery exhibitions.</p><a href="exhibitions.html" class="btn secondary">View Exhibitions</a></div>';
  let html = '<div class="artist-timeline">';
  for (let i = 0; i < exhibitions.length; i++) {
    const ex = exhibitions[i], status = getExhibitionStatus(ex);
    const dateStr = `${formatDate(ex.startDate)} &ndash; ${formatDate(ex.endDate)}`;
    html += `<div class="artist-timeline-item"><div class="artist-timeline-info"><h3><a href="exhibition.html?id=${ex.id}">${escapeHtml(ex.title)}</a></h3><div class="artist-timeline-theme">Theme: ${escapeHtml(ex.theme || 'Curatorial survey')}</div><div class="artist-timeline-dates">${dateStr}</div></div><div class="artist-timeline-side">${renderStatusBadge(status)} <a href="exhibition.html?id=${ex.id}" class="btn secondary" style="font-size:11px;padding:4px 8px;">Explore</a></div></div>`;
  }
  return html + '</div>';
}

// Renders the full artist monograph and portfolio view.
function renderProfile(artist) {
  const artworks = getArtworksForArtist(galleryData, artist.id), exhibitions = getExhibitionsForArtist(artist.id);
  const initials = getArtistInitials(artist.name), bornStr = artist.born ? `b. ${artist.born}` : '';
  const natStr = artist.nationality || '', styleStr = artist.style || 'Contemporary';
  const metaParts = [bornStr, natStr].filter(function (x) { return x !== ''; }).join(' &bull; ');
  const bio = artist.bio ? escapeHtml(artist.bio) : 'No formal curatorial biography recorded for this artist.';

  profileContent.innerHTML = `<div class="artist-profile-nav"><a href="artists.html" class="exhibition-nav-back">&larr; Return to Artists Directory</a><div class="exhibition-nav-links"><a href="artists.html" class="btn secondary" style="font-size:11px;padding:4px 8px;">All Artists</a><a href="artworks.html" class="btn secondary" style="font-size:11px;padding:4px 8px;">Collection</a></div></div>
  <div class="artist-profile-hero"><div class="artist-hero-seal-wrap"><div class="artist-hero-seal"><div class="artist-hero-seal-initials">${escapeHtml(initials)}</div><span class="artist-hero-seal-sub">CURATORIAL MONOGRAPH</span></div></div><div class="artist-hero-content"><div class="artist-hero-tag">Represented Artist &bull; Dossier #${artist.id}</div><h1 class="artist-hero-name">${escapeHtml(artist.name)}</h1><div class="artist-hero-meta">${metaParts || 'Living Artist'}</div><div class="artist-hero-style">${escapeHtml(styleStr)}</div><div class="artist-hero-stats"><div class="artist-stat-item"><span class="artist-stat-num">${artworks.length}</span><span class="artist-stat-lbl">Catalogued Works</span></div><div class="artist-stat-item"><span class="artist-stat-num">${exhibitions.length}</span><span class="artist-stat-lbl">Exhibitions</span></div></div></div></div>
  <section class="artist-bio-section"><div class="section-tag">Curatorial Practice</div><h2>Artist Biography</h2><p class="artist-bio-text">${bio}</p><div class="coursework-disclaimer" style="margin-top:16px; padding:12px 14px; background:var(--bg-linen); border-left:3px solid var(--accent-ochre); font-size:12px; color:var(--ink-secondary); line-height:1.5;"><strong>Coursework Demonstration Notice:</strong> Catalogued artworks, simulated valuations, and exhibition placements are conceptual coursework studies developed for the Gallery Ledger demonstration and distinguish factual research from fictional curricular scenarios.</div></section>
  <section class="home-section"><div class="section-header"><div class="section-tag">Selected Works</div><h2>Catalogued Artworks (${artworks.length})</h2><p class="section-desc">Original works by ${escapeHtml(artist.name)} accessioned in the permanent gallery archive.</p></div>${buildArtistWorksGrid(artworks)}</section>
  <section class="home-section"><div class="section-header"><div class="section-tag">Curatorial Record</div><h2>Exhibition History (${exhibitions.length})</h2><p class="section-desc">Past, present, and scheduled exhibitions featuring works by ${escapeHtml(artist.name)}.</p></div>${buildExhibitionsTimeline(exhibitions)}</section>`;
}

// Renders the not found state when artist id does not exist.
function renderNotFound() {
  profileContent.innerHTML = `<div class="artist-profile-nav"><a href="artists.html" class="exhibition-nav-back">&larr; Return to Artists Directory</a></div><div class="empty-curatorial" style="padding:60px 20px;"><h2>Artist Not Found</h2><p>The requested artist monograph does not exist or has been unlinked from the archive.</p><a href="artists.html" class="btn" style="margin-top:16px;">Return to Artists Directory</a></div>`;
}

// Initializes the artist profile page.
function initArtistProfile() {
  renderNav('Artists'); galleryData = loadData();
  const id = getIdFromUrl();
  if (!id) { renderNotFound(); return; }
  const artist = findArtistById(galleryData, id);
  if (!artist) { renderNotFound(); return; }
  renderProfile(artist);
}

initArtistProfile();
