(function () {
  'use strict';

  var reservations = [
    { id: 1, room: 'Ruang A101', date: '2026-10-22', start: '08:00', end: '10:00', purpose: 'Kuliah pengganti', status: 'Disetujui' },
    { id: 2, room: 'Lab Komputer 1', date: '2026-10-23', start: '10:00', end: '12:00', purpose: 'Praktikum', status: 'Diajukan' },
    { id: 3, room: 'Aula Mini', date: '2026-10-25', start: '16:00', end: '18:00', purpose: 'Seminar', status: 'Diajukan' },
    { id: 4, room: 'Ruang B202', date: '2026-10-26', start: '13:00', end: '15:00', purpose: 'Diskusi kelompok', status: 'Selesai' },
    { id: 5, room: 'Ruang A102', date: '2026-10-27', start: '09:00', end: '11:00', purpose: 'Rapat himpunan', status: 'Batal' }
  ];

  var tableBody = document.getElementById('tabel-reservasi');
  var emptyState = document.getElementById('keadaan-kosong-reservasi');
  var form = document.getElementById('form-reservasi');
  var modalForm = document.getElementById('modal-reservasi');
  var cancelForm = document.getElementById('form-batalkan-reservasi');
  var cancelSummary = document.getElementById('ringkasan-batalkan-reservasi');
  var timeError = document.getElementById('err-jam-reservasi');
  var roomField = document.getElementById('field-ruang');
  var dateField = document.getElementById('field-tanggal');
  var startField = document.getElementById('field-jam-mulai');
  var endField = document.getElementById('field-jam-selesai');
  var purposeField = document.getElementById('field-keperluan');
  var cancelId = null;

  function formatDate(value) {
    var parts = value.split('-');
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }

  function timeRange(reservation) {
    return reservation.start + '–' + reservation.end;
  }

  function statusClass(status) {
    return {
      'Diajukan': 'is-pending',
      'Disetujui': 'is-approved',
      'Selesai': 'is-finished',
      'Batal': 'is-cancelled'
    }[status] || 'is-pending';
  }

  function makeCell(text) {
    var cell = document.createElement('td');
    cell.textContent = text;
    return cell;
  }

  function renderReservations() {
    tableBody.textContent = '';
    reservations.forEach(function (reservation) {
      var row = document.createElement('tr');
      var statusCell = document.createElement('td');
      var badge = document.createElement('span');
      var actionCell = document.createElement('td');

      row.appendChild(makeCell(reservation.room));
      row.appendChild(makeCell(formatDate(reservation.date)));
      row.appendChild(makeCell(timeRange(reservation)));
      row.appendChild(makeCell(reservation.purpose));

      badge.className = 'badge-status reservation-status ' + statusClass(reservation.status);
      badge.textContent = reservation.status;
      statusCell.appendChild(badge);
      row.appendChild(statusCell);

      if (reservation.status === 'Diajukan') {
        var cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.className = 'reservation-action';
        cancelButton.dataset.reservationId = String(reservation.id);
        cancelButton.textContent = 'Batalkan';
        cancelButton.setAttribute('aria-label', 'Batalkan reservasi ' + reservation.room +
          ', tanggal ' + formatDate(reservation.date) + ', pukul ' + timeRange(reservation));
        actionCell.appendChild(cancelButton);
      } else {
        actionCell.textContent = '-';
      }
      row.appendChild(actionCell);
      tableBody.appendChild(row);
    });
    emptyState.hidden = reservations.length > 0;
  }

  function clearFormValidation() {
    [roomField, dateField, startField, endField, purposeField].forEach(function (field) {
      field.classList.remove('is-invalid');
    });
    timeError.classList.remove('d-block');
  }

  function validateReservation() {
    clearFormValidation();
    var isValid = true;
    [roomField, dateField, startField, endField, purposeField].forEach(function (field) {
      if (!field.checkValidity()) {
        field.classList.add('is-invalid');
        isValid = false;
      }
    });

    if (purposeField.value.trim().length < 3) {
      purposeField.classList.add('is-invalid');
      isValid = false;
    }
    if (startField.value && endField.value && endField.value <= startField.value) {
      endField.classList.add('is-invalid');
      timeError.classList.add('d-block');
      isValid = false;
    }
    if (!isValid) {
      var firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) {
        firstInvalid.focus();
      }
    }
    return isValid;
  }

  function parseQueryParameters() {
    var params = new URLSearchParams(window.location.search);
    var room = params.get('ruang');
    var date = params.get('tanggal');
    var time = params.get('jam');
    if (!room && !date && !time) {
      return false;
    }

    if (room && Array.prototype.some.call(roomField.options, function (option) {
      return option.value === room;
    })) {
      roomField.value = room;
    }
    if (date) {
      dateField.value = date;
    }
    if (time) {
      var times = time.split(/[–-]/);
      if (times.length === 2) {
        startField.value = times[0].trim();
        endField.value = times[1].trim();
      }
    }
    return true;
  }

  document.getElementById('btn-ajukan-reservasi').addEventListener('click', function () {
    form.reset();
    clearFormValidation();
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!validateReservation()) {
      return;
    }
    reservations.unshift({
      id: Date.now(),
      room: roomField.value,
      date: dateField.value,
      start: startField.value,
      end: endField.value,
      purpose: purposeField.value.trim(),
      status: 'Diajukan'
    });
    renderReservations();
    form.reset();
    bootstrap.Modal.getOrCreateInstance(modalForm).hide();
    document.getElementById('area-notifikasi-reservasi').innerHTML =
      '<div class="alert alert-success alert-feedback" role="status">' +
      '<i class="fa-solid fa-circle-check me-2" aria-hidden="true"></i>' +
      'Pengajuan reservasi berhasil ditambahkan.</div>';
  });

  [roomField, dateField, startField, endField, purposeField].forEach(function (field) {
    field.addEventListener('input', function () {
      field.classList.remove('is-invalid');
      if (field === startField || field === endField) {
        timeError.classList.remove('d-block');
        startField.classList.remove('is-invalid');
        endField.classList.remove('is-invalid');
      }
    });
    field.addEventListener('change', function () {
      field.classList.remove('is-invalid');
      if (field === startField || field === endField) {
        timeError.classList.remove('d-block');
        startField.classList.remove('is-invalid');
        endField.classList.remove('is-invalid');
      }
    });
  });

  tableBody.addEventListener('click', function (event) {
    var button = event.target.closest('button[data-reservation-id]');
    if (!button) {
      return;
    }
    var reservation = reservations.find(function (item) {
      return String(item.id) === button.dataset.reservationId;
    });
    if (!reservation || reservation.status !== 'Diajukan') {
      return;
    }
    cancelId = reservation.id;
    cancelSummary.textContent = reservation.room + '  ·  ' +
      formatDate(reservation.date) + ', ' + timeRange(reservation);
    bootstrap.Modal.getOrCreateInstance(
      document.getElementById('modal-batalkan-reservasi')
    ).show();
  });

  cancelForm.addEventListener('submit', function (event) {
    event.preventDefault();
    var reservation = reservations.find(function (item) {
      return item.id === cancelId;
    });
    if (!reservation) {
      return;
    }
    reservation.status = 'Batal';
    renderReservations();
    bootstrap.Modal.getOrCreateInstance(
      document.getElementById('modal-batalkan-reservasi')
    ).hide();
  });

  modalForm.addEventListener('shown.bs.modal', function () {
    roomField.focus();
  });
  modalForm.addEventListener('hidden.bs.modal', clearFormValidation);

  renderReservations();
  if (parseQueryParameters()) {
    bootstrap.Modal.getOrCreateInstance(modalForm).show();
  }
})();
