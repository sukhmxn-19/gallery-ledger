// Gallery spaces page logic: room management form and occupancy view.

const spaceForm = document.getElementById('space-form');
const spaceIdInput = document.getElementById('space-id');
const spaceNameInput = document.getElementById('space-name');
const spaceCapacityInput = document.getElementById('space-capacity');
const spaceNoteInput = document.getElementById('space-note');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const formHeading = document.getElementById('form-heading');
const tableBody = document.getElementById('spaces-table-body');
const emptyState = document.getElementById('empty-state');
let galleryData = null;

// Validates input fields and business rules for a gallery space.
function validateSpace(name, capacity, ignoreId) {
  const reqErr = checkRequired(name, 'Name');
  if (reqErr) return reqErr;
  const uniqueErr = checkSpaceName(galleryData, name, ignoreId);
  if (uniqueErr) return uniqueErr;
  const cap = Number(capacity);
  if (isNaN(cap) || !Number.isInteger(cap) || cap < 1 || cap > 100) {
    return 'Capacity must be an integer between 1 and 100.';
  }
  return '';
}

// Determines which active or upcoming exhibition is currently using a space.
function getSpaceInUseBy(spaceId) {
  const places = getPlacementsForSpace(galleryData, spaceId);
  for (let i = 0; i < places.length; i++) {
    const ex = findExhibitionById(galleryData, places[i].exhibitionId);
    if (ex) {
      const status = getExhibitionStatus(ex);
      if (status === 'On now' || status === 'Upcoming') {
        return ex.title;
      }
    }
  }
  return 'Free';
}

// Resets the space form back to add mode.
function resetSpaceForm() {
  spaceForm.reset();
  spaceIdInput.value = '';
  submitBtn.textContent = 'Add space';
  cancelBtn.hidden = true;
  formHeading.textContent = 'Add space';
}

// Populates the form with existing space values for editing.
function setFormForEdit(space) {
  spaceIdInput.value = space.id;
  spaceNameInput.value = space.name;
  spaceCapacityInput.value = space.capacity;
  spaceNoteInput.value = space.note || '';
  submitBtn.textContent = 'Save changes';
  cancelBtn.hidden = false;
  formHeading.textContent = 'Edit space';
  showMessage('', false);
}

// Renders the spaces table rows with safe HTML escaping.
function renderSpacesTable() {
  tableBody.innerHTML = '';
  if (galleryData.spaces.length === 0) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  for (let i = 0; i < galleryData.spaces.length; i++) {
    const s = galleryData.spaces[i];
    const inUse = getSpaceInUseBy(s.id);
    const row = document.createElement('tr');
    row.innerHTML = `<td>${escapeHtml(s.name)}</td><td class="num">${s.capacity}</td><td>${escapeHtml(s.note || '—')}</td><td>${escapeHtml(inUse)}</td><td><button type="button" class="secondary btn-edit" data-id="${s.id}">Edit</button> <button type="button" class="delete btn-delete" data-id="${s.id}">Delete</button></td>`;
    tableBody.appendChild(row);
  }
}

// Creates a new space record or updates an existing space.
function saveSpaceRecord(id, name, capacity, note) {
  if (id) {
    const space = findSpaceById(galleryData, id);
    if (space) {
      space.name = name;
      space.capacity = Number(capacity);
      space.note = note;
      showMessage('Space updated.', false);
    }
  } else {
    galleryData.spaces.push({
      id: getNextId(galleryData),
      name: name,
      capacity: Number(capacity),
      note: note
    });
    showMessage('Space added.', false);
  }
  saveData(galleryData);
}

// Handles submitting the space form for adding or updating.
function handleFormSubmit(event) {
  event.preventDefault();
  const id = spaceIdInput.value;
  const name = spaceNameInput.value.trim();
  const capacity = spaceCapacityInput.value.trim();
  const note = spaceNoteInput.value.trim();

  const error = validateSpace(name, capacity, id);
  if (error) {
    showMessage(error, true);
    return;
  }
  saveSpaceRecord(id, name, capacity, note);
  resetSpaceForm();
  renderSpacesTable();
}

// Handles table click events for editing or deleting a space.
function handleTableClick(event) {
  const target = event.target;
  const id = target.getAttribute('data-id');
  if (!id) return;

  if (target.classList.contains('btn-delete')) {
    const delErr = canDeleteSpace(galleryData, id);
    if (delErr) {
      showMessage(delErr, true);
      return;
    }
    const space = findSpaceById(galleryData, id);
    if (!space) return;
    if (confirm(`Delete '${space.name}'?`)) {
      galleryData.spaces = galleryData.spaces.filter(function (s) { return s.id !== Number(id); });
      saveData(galleryData);
      showMessage('Space deleted.', false);
      renderSpacesTable();
      if (spaceIdInput.value === String(id)) resetSpaceForm();
    }
  } else if (target.classList.contains('btn-edit')) {
    const space = findSpaceById(galleryData, id);
    if (space) setFormForEdit(space);
  }
}

// Cancels editing and returns the form to add state.
function handleCancelClick() {
  resetSpaceForm();
  showMessage('', false);
}

// Initializes the spaces page on load.
function initSpacesPage() {
  renderNav('Spaces');
  galleryData = loadData();
  renderSpacesTable();
  spaceForm.addEventListener('submit', handleFormSubmit);
  tableBody.addEventListener('click', handleTableClick);
  cancelBtn.addEventListener('click', handleCancelClick);
}

initSpacesPage();
