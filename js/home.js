// Homepage presentation logic, visual plates, exhibition showcases, and collection grids.

const heroTickerEl = document.getElementById('hero-ticker');
const exhibitionsEl = document.getElementById('home-exhibitions-container');
const artworksEl = document.getElementById('home-artworks-container');
const artistsEl = document.getElementById('home-artists-container');
const spacesEl = document.getElementById('home-spaces-container');
const emptyNoticeEl = document.getElementById('home-empty-notice');
let galleryData = null;

// Displays live archive totals inside the hero ticker.
function renderHeroTicker(data) {
  if (!heroTickerEl) return;
  const onNow = data.exhibitions.filter(function (e) { return getExhibitionStatus(e) === 'On now'; }).length;
  heroTickerEl.innerHTML = `
    <div class="ticker-item"><span class="ticker-num">${data.exhibitions.length}</span><span class="ticker-lbl">Shows (${onNow} on view)</span></div>
    <div class="ticker-item"><span class="ticker-num">${data.artworks.length}</span><span class="ticker-lbl">Artworks</span></div>
    <div class="ticker-item"><span class="ticker-num">${data.artists.length}</span><span class="ticker-lbl">Living Artists</span></div>
    <div class="ticker-item"><span class="ticker-num">${data.spaces.length}</span><span class="ticker-lbl">Gallery Wings</span></div>
  `;
}

// Builds the HTML markup for one featured exhibition card.
function buildExhibitionCard(data, ex) {
  const status = getExhibitionStatus(ex);
  const places = getPlacementsForExhibition(data, ex.id);
  const imgSrc = getExhibitionImage(ex);
  const dateStr = `${formatDate(ex.startDate)} &ndash; ${formatDate(ex.endDate)}`;
  return `<article class="exhibition-card">
    <div class="card-media"><img src="${imgSrc}" alt="${escapeHtml(ex.title)}"></div>
    <div class="card-body">
      <div class="card-meta">${renderStatusBadge(status)}<span class="card-dates">${dateStr}</span></div>
      <h3 class="card-title"><a href="exhibition.html?id=${ex.id}">${escapeHtml(ex.title)}</a></h3>
      <p class="card-theme">Theme: ${escapeHtml(ex.theme || 'Curatorial survey')}</p>
      <p class="card-desc">${escapeHtml(ex.description || '')}</p>
      <div class="card-foot">
        <span class="card-count">${places.length} works placed</span>
        <div class="card-actions">
          <a href="exhibition.html?id=${ex.id}" class="btn">View Details</a>
          <a href="catalogue.html?id=${ex.id}" class="btn btn-secondary">Open Catalogue</a>
        </div>
      </div>
    </div>
  </article>`;
}

// Renders running and upcoming seasonal exhibitions.
function renderExhibitions(data) {
  if (!exhibitionsEl) return;
  const active = data.exhibitions.filter(function (e) {
    const s = getExhibitionStatus(e);
    return s === 'On now' || s === 'Upcoming';
  });
  if (active.length === 0) {
    exhibitionsEl.innerHTML = '<p class="label-meta">No exhibitions currently scheduled in the registry.</p>';
    return;
  }
  let html = '';
  for (let i = 0; i < active.length; i++) html += buildExhibitionCard(data, active[i]);
  exhibitionsEl.innerHTML = html;
}

// Builds the HTML markup for one curated artwork card.
function buildArtworkCard(data, art) {
  const artist = findArtistById(data, art.artistId);
  const artistName = artist ? artist.name : 'Unknown Artist';
  const imgSrc = getArtworkImage(art);
  const priceStr = formatPrice(art.price);
  return `<article class="artwork-card">
    <div class="art-media"><img src="${imgSrc}" alt="${escapeHtml(art.title)}"></div>
    <div class="art-body">
      <div class="art-top"><span class="art-medium">${escapeHtml(art.medium)}</span>${renderStatusBadge(art.status)}</div>
      <h3 class="art-title">${escapeHtml(art.title)}</h3>
      <p class="art-artist"><a href="artist.html?id=${art.artistId}">${escapeHtml(artistName)}</a> (${art.year || 'n.d.'})</p>
      <div class="art-foot"><span class="art-price">${priceStr}</span><span class="art-dim">${escapeHtml(art.size || '')}</span></div>
    </div>
  </article>`;
}

// Renders the curated collection showcase grid.
function renderArtworks(data) {
  if (!artworksEl) return;
  if (data.artworks.length === 0) {
    artworksEl.innerHTML = '<p class="label-meta">No artworks registered in the collection.</p>';
    return;
  }
  const count = Math.min(6, data.artworks.length);
  let html = '';
  for (let i = 0; i < count; i++) html += buildArtworkCard(data, data.artworks[i]);
  artworksEl.innerHTML = html;
}

// Builds the HTML markup for one artist spotlight card.
function buildArtistCard(data, artist) {
  const works = getArtworksForArtist(data, artist.id);
  const countText = `${works.length} ${works.length === 1 ? 'work' : 'works'}`;
  const born = artist.born ? `b. ${artist.born}` : '';
  const meta = [artist.nationality, born].filter(Boolean).join(', ');
  return `<article class="artist-card">
    <div class="artist-avatar"><img src="img/artist-silhouette.svg" alt="${escapeHtml(artist.name)}"></div>
    <div class="artist-info">
      <h3 class="artist-name"><a href="artist.html?id=${artist.id}">${escapeHtml(artist.name)}</a></h3>
      <p class="artist-meta">${escapeHtml(meta)}</p>
      <p class="artist-style">Discipline: ${escapeHtml(artist.style || 'Fine Art')}</p>
      <p class="artist-bio">${escapeHtml(artist.bio || '')}</p>
      <p class="artist-count">${countText} in permanent ledger</p>
    </div>
  </article>`;
}

// Renders the living artists directory spotlight.
function renderArtists(data) {
  if (!artistsEl) return;
  if (data.artists.length === 0) {
    artistsEl.innerHTML = '<p class="label-meta">No artists currently registered.</p>';
    return;
  }
  let html = '';
  for (let i = 0; i < data.artists.length; i++) html += buildArtistCard(data, data.artists[i]);
  artistsEl.innerHTML = html;
}

// Builds the HTML markup for one architectural room card.
function buildSpaceCard(data, space) {
  const places = getPlacementsForSpace(data, space.id);
  const imgSrc = getSpaceImage(space);
  return `<article class="space-card">
    <div class="space-media"><img src="${imgSrc}" alt="${escapeHtml(space.name)}"></div>
    <div class="space-body">
      <h3 class="space-name">${escapeHtml(space.name)}</h3>
      <p class="space-note">${escapeHtml(space.note || 'General exhibition hall')}</p>
      ${renderOccupancyBar(places.length, space.capacity)}
    </div>
  </article>`;
}

// Renders the architectural gallery display rooms.
function renderSpaces(data) {
  if (!spacesEl) return;
  if (data.spaces.length === 0) {
    spacesEl.innerHTML = '<p class="label-meta">No display spaces registered.</p>';
    return;
  }
  let html = '';
  for (let i = 0; i < data.spaces.length; i++) html += buildSpaceCard(data, data.spaces[i]);
  spacesEl.innerHTML = html;
}

// Renders all public homepage sections from loaded storage data.
function renderHomePage() {
  const empty = galleryData.artists.length === 0 && galleryData.artworks.length === 0;
  if (emptyNoticeEl) emptyNoticeEl.hidden = !empty;
  renderHeroTicker(galleryData);
  renderExhibitions(galleryData);
  renderArtworks(galleryData);
  renderArtists(galleryData);
  renderSpaces(galleryData);
}

// Initializes top navigation, reads storage, and populates the homepage.
function initHomePage() {
  renderNav('Home');
  galleryData = loadData();
  renderHomePage();
}

initHomePage();
