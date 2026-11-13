// Exhibitions page logic: scheduling, clash validation, date sorting, and cascade deletion.

const exhibitionForm = document.getElementById('exhibition-form');
const exhibitionIdInput = document.getElementById('exhibition-id');
const exhibitionTitleInput = document.getElementById('exhibition-title');
const exhibitionThemeInput = document.getElementById('exhibition-theme');
const exhibitionDescInput = document.getElementById('exhibition-description');
const exhibitionStartInput = document.getElementById('exhibition-start');
const exhibitionEndInput = document.getElementById('exhibition-end');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const formHeading = document.getElementById('form-heading');
const tableBody = document.getElementById('exhibitions-table-body');
const emptyState = document.getElementById('empty-state');
let galleryData = null;

// Validates input fields and scheduling business rules for exhibitions.
function validateExhibition(title, start, end, desc, editId) {
  const tErr = checkRequired(title, 'Title');
  if (tErr) return tErr;
  const sErr = checkRequired(start, 'Start date');
  if (sErr) return sErr;
  const eErr = checkRequired(end, 'End date');
  if (eErr) return eErr;
  const uniqueErr = checkExhibitionTitle(galleryData, title, editId);
  if (uniqueErr) return uniqueErr;
  const dateErr = checkExhibitionDatesOrder(start, end);
  if (dateErr) return dateErr;
  if (desc && desc.length > 400) {
    return 'Description cannot exceed 400 characters.';
  }
  if (editId) {
    const clashErr = checkExhibitionDates(galleryData, editId, start, end);
    if (clashErr) return clashErr;
  }
  return '';
}

// Resets exhibition form back to initial add state.
function resetExhibitionForm() {
  exhibitionForm.reset();
  exhibitionIdInput.value = '';
  submitBtn.textContent = 'Create exhibition';
  cancelBtn.hidden = true;
  formHeading.textContent = 'Create exhibition';
}

// Populates form inputs with existing exhibition details for editing.
function setFormForEdit(ex) {
  exhibitionIdInput.value = ex.id;
  exhibitionTitleInput.value = ex.title;
  exhibitionThemeInput.value = ex.theme || '';
  exhibitionDescInput.value = ex.description || '';
  exhibitionStartInput.value = ex.startDate;
  exhibitionEndInput.value = ex.endDate;
  submitBtn.textContent = 'Save changes';
  cancelBtn.hidden = false;
  formHeading.textContent = 'Edit exhibition';
  showMessage('', false);
}

// Renders the exhibitions table sorted by start date, newest first.
function renderExhibitionsTable() {
  tableBody.innerHTML = '';
  if (galleryData.exhibitions.length === 0) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;
  const sorted = galleryData.exhibitions.slice().sort(function (a, b) {
    return b.startDate.localeCompare(a.startDate);
  });
  for (let i = 0; i < sorted.length; i++) {
    const ex = sorted[i];
    const status = getExhibitionStatus(ex);
    const count = getPlacementsForExhibition(galleryData, ex.id).length;
    const dates = `${formatDate(ex.startDate)} to ${formatDate(ex.endDate)}`;
    const row = document.createElement('tr');
    row.innerHTML = `<td><a href="exhibition.html?id=${ex.id}">${escapeHtml(ex.title)}</a></td><td>${dates}</td><td>${escapeHtml(status)}</td><td class="num">${count}</td><td><button type="button" class="secondary btn-edit" data-id="${ex.id}">Edit</button> <button type="button" class="delete btn-delete" data-id="${ex.id}">Delete</button></td>`;
    tableBody.appendChild(row);
  }
}

// Creates a new exhibition or updates an existing record and saves data.
function saveExhibitionRecord(id, title, theme, desc, start, end) {
  if (id) {
    const ex = findExhibitionById(galleryData, id);
    if (ex) {
      ex.title = title;
      ex.theme = theme;
      ex.description = desc;
      ex.startDate = start;
      ex.endDate = end;
      showMessage('Exhibition updated.', false);
    }
  } else {
    galleryData.exhibitions.push({
      id: getNextId(galleryData),
      title: title,
      theme: theme,
      description: desc,
      startDate: start,
      endDate: end
    });
    showMessage('Exhibition created.', false);
  }
  saveData(galleryData);
}

// Handles submitting the form to add a new exhibition or save edits.
function handleFormSubmit(event) {
  event.preventDefault();
  const id = exhibitionIdInput.value;
  const title = exhibitionTitleInput.value.trim();
  const theme = exhibitionThemeInput.value.trim();
  const desc = exhibitionDescInput.value.trim();
  const start = exhibitionStartInput.value;
  const end = exhibitionEndInput.value;

  const error = validateExhibition(title, start, end, desc, id);
  if (error) {
    showMessage(error, true);
    return;
  }
  saveExhibitionRecord(id, title, theme, desc, start, end);
  resetExhibitionForm();
  renderExhibitionsTable();
}

// Handles Edit and Delete clicks, cascading deletion to placements.
function handleTableClick(event) {
  const target = event.target;
  const id = target.getAttribute('data-id');
  if (!id) return;

  if (target.classList.contains('btn-delete')) {
    const confirmMsg = getDeleteExhibitionConfirm(galleryData, id);
    if (confirm(confirmMsg)) {
      galleryData.exhibitions = galleryData.exhibitions.filter(function (e) {
        return e.id !== Number(id);
      });
      galleryData.placements = galleryData.placements.filter(function (p) {
        return p.exhibitionId !== Number(id);
      });
      saveData(galleryData);
      showMessage('Exhibition deleted.', false);
      renderExhibitionsTable();
      if (exhibitionIdInput.value === String(id)) resetExhibitionForm();
    }
  } else if (target.classList.contains('btn-edit')) {
    const ex = findExhibitionById(galleryData, id);
    if (ex) setFormForEdit(ex);
  }
}

// Cancels editing and returns the form to create mode.
function handleCancelClick() {
  resetExhibitionForm();
  showMessage('', false);
}

// Initializes the exhibitions page and checks for incoming edit queries.
function initExhibitionsPage() {
  renderNav('Exhibitions');
  galleryData = loadData();
  renderExhibitionsTable();
  exhibitionForm.addEventListener('submit', handleFormSubmit);
  tableBody.addEventListener('click', handleTableClick);
  cancelBtn.addEventListener('click', handleCancelClick);

  const editId = getIdFromUrl();
  if (editId) {
    const target = findExhibitionById(galleryData, editId);
    if (target) setFormForEdit(target);
  }
}

initExhibitionsPage();

