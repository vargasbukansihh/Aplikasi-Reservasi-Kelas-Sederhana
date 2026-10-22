(function () {
  'use strict';

  var pageSize = 7;
  var currentPage = 1;
  var rooms = {
    'Ruang A101': { capacity: 40, location: 'Gedung A Lt.1' },
    'Ruang A102': { capacity: 35, location: 'Gedung A Lt.1' },
    'Lab Komputer 1': { capacity: 30, location: 'Gedung B Lt.2' },
    'Ruang B202': { capacity: 50, location: 'Gedung B Lt.2' },
    'Aula Mini': { capacity: 120, location: 'Gedung C Lt.1' }
  };
  var schedule = [
    { date: '2026-10-22', room: 'Ruang A101', time: '08:00–10:00', status: 'terpakai' },
    { date: '2026-10-22', room: 'Ruang A101', time: '10:00–12:00', status: 'tersedia' },
    { date: '2026-10-22', room: 'Lab Komputer 1', time: '10:00–12:00', status: 'terpakai' },
    { date: '2026-10-22', room: 'Ruang B202', time: '13:00–15:00', status: 'terpakai' },
    { date: '2026-10-23', room: 'Aula Mini', time: '16:00–18:00', status: 'tersedia' },
    { date: '2026-10-23', room: 'Ruang A102', time: '09:00–11:00', status: 'tersedia' },
    { date: '2026-10-24', room: 'Ruang A101', time: '13:00–15:00', status: 'terpakai' }
  ];
  var baseSchedule = schedule.slice();

  for (var index = 7; index < 48; index++) {
    var template = baseSchedule[index % baseSchedule.length];
    var dateNumber = 22 + Math.floor(index / baseSchedule.length);
    var roomInfo = rooms[template.room];
    schedule.push({
      date: '2026-10-' + String(dateNumber).padStart(2, '0'),
      room: template.room,
      time: template.time,
      status: template.status,
      capacity: roomInfo.capacity,
      location: roomInfo.location
    });
  }

  var tableBody = document.getElementById('tabel-jadwal');
  var emptyState = document.getElementById('keadaan-kosong-jadwal');
  var dateFilter = document.getElementById('filter-tanggal');
  var roomFilter = document.getElementById('filter-nama-ruang');
  var statusFilter = document.getElementById('filter-status');
  var pagination = document.getElementById('pagination-jadwal');

  function displayDate(value) {
    var parts = value.split('-');
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }

  function createCell(value, className) {
    var cell = document.createElement('td');
    cell.textContent = value;
    if (className) {
      cell.className = className;
    }
    return cell;
  }

  function getFilteredRows() {
    return schedule.filter(function (item) {
      return (!dateFilter.value || item.date === dateFilter.value) &&
        (!roomFilter.value || item.room === roomFilter.value) &&
        (!statusFilter.value || item.status === statusFilter.value);
    });
  }

  function renderRows(filtered) {
    var pageCount = Math.ceil(filtered.length / pageSize);
    if (currentPage > pageCount) {
      currentPage = Math.max(1, pageCount);
    }

    var startIndex = (currentPage - 1) * pageSize;
    var rows = filtered.slice(startIndex, startIndex + pageSize);
    tableBody.textContent = '';

    rows.forEach(function (item, index) {
      var room = rooms[item.room];
      var row = document.createElement('tr');
      var statusCell;
      var statusBadge = document.createElement('span');
      var actionCell = document.createElement('td');
      var action = document.createElement(item.status === 'tersedia' ? 'a' : 'span');

      row.appendChild(createCell(displayDate(item.date), 'tabular'));
      row.appendChild(createCell(item.room));
      row.appendChild(createCell(String(room.capacity), 'text-end tabular'));
      row.appendChild(createCell(room.location));
      row.appendChild(createCell(item.time, 'tabular'));

      statusBadge.className = 'availability-badge ' +
        (item.status === 'tersedia' ? 'is-free' : 'is-used');
      statusBadge.textContent = item.status === 'tersedia' ? 'Tersedia' : 'Terpakai';
      statusCell = document.createElement('td');
      statusCell.appendChild(statusBadge);
      row.appendChild(statusCell);

      action.className = 'schedule-action';
      action.textContent = item.status === 'tersedia' ? 'Ajukan' : '-';
      if (item.status === 'tersedia') {
        var params = new URLSearchParams({
          ruang: item.room,
          tanggal: item.date,
          jam: item.time
        });
        action.href = 'reservasi.html?' + params.toString();
        action.setAttribute('aria-label', 'Ajukan reservasi ' + item.room + ' tanggal ' +
          displayDate(item.date) + ' pukul ' + item.time);
      } else {
        action.setAttribute('aria-hidden', 'true');
      }

      actionCell.appendChild(action);
      row.appendChild(actionCell);
      row.dataset.rowNumber = String(startIndex + index + 1);
      tableBody.appendChild(row);
    });

    emptyState.hidden = filtered.length > 0;
    var endIndex = Math.min(startIndex + pageSize, filtered.length);
    document.getElementById('info-jadwal').textContent = filtered.length
      ? 'Menampilkan ' + (startIndex + 1) + '–' + endIndex + ' dari ' + filtered.length + ' jadwal'
      : 'Tidak ada jadwal yang cocok dengan filter.';
    renderPagination(pageCount);
  }

  function addPageItem(label, page, disabled, active) {
    var item = document.createElement('li');
    var control = document.createElement(disabled || active ? 'span' : 'a');
    item.className = 'page-item' + (disabled ? ' disabled' : '') + (active ? ' active' : '');
    control.className = 'page-link';
    control.textContent = label;
    if (active) {
      item.setAttribute('aria-current', 'page');
    }
    if (disabled) {
      control.setAttribute('aria-disabled', 'true');
      control.setAttribute('aria-label', label === '‹' ? 'Halaman sebelumnya' : 'Halaman berikutnya');
    } else if (!active) {
      control.href = '#';
      control.dataset.page = String(page);
      if (label === '‹' || label === '›') {
        control.setAttribute('aria-label', label === '‹' ? 'Halaman sebelumnya' : 'Halaman berikutnya');
      }
    }
    item.appendChild(control);
    pagination.appendChild(item);
  }

  function renderPagination(pageCount) {
    pagination.textContent = '';
    if (pageCount <= 1) {
      return;
    }

    addPageItem('‹', currentPage - 1, currentPage === 1, false);
    for (var page = 1; page <= pageCount; page++) {
      addPageItem(String(page), page, false, page === currentPage);
    }
    addPageItem('›', currentPage + 1, currentPage === pageCount, false);
  }

  function applyFilters(resetPage) {
    if (resetPage) {
      currentPage = 1;
    }
    renderRows(getFilteredRows());
  }

  document.getElementById('form-filter-jadwal').addEventListener('submit', function (event) {
    event.preventDefault();
    applyFilters(true);
  });

  document.getElementById('btn-reset-jadwal').addEventListener('click', function () {
    window.setTimeout(function () {
      applyFilters(true);
    }, 0);
  });

  pagination.addEventListener('click', function (event) {
    var link = event.target.closest('a[data-page]');
    if (!link) {
      return;
    }
    event.preventDefault();
    currentPage = Number(link.dataset.page);
    applyFilters(false);
  });

  applyFilters(true);
})();
