(function () {
  'use strict';

  var rooms = [
    { id: '1', nama: 'Ruang A101', kapasitas: 40, lokasi: 'Gedung A Lt.1', status: 'aktif' },
    { id: '2', nama: 'Ruang A102', kapasitas: 35, lokasi: 'Gedung A Lt.1', status: 'aktif' },
    { id: '3', nama: 'Lab Komputer 1', kapasitas: 30, lokasi: 'Gedung B Lt.2', status: 'aktif' },
    { id: '4', nama: 'Ruang B202', kapasitas: 50, lokasi: 'Gedung B Lt.2', status: 'aktif' },
    { id: '5', nama: 'Aula Mini', kapasitas: 120, lokasi: 'Gedung C Lt.1', status: 'aktif' },
    { id: '6', nama: 'Ruang C301', kapasitas: 25, lokasi: 'Gedung C Lt.3', status: 'nonaktif' }
  ];
  var pageSize = 5;
  var currentPage = 1;

  var tbody = document.getElementById('tabel-ruang');
  var emptyState = document.getElementById('keadaan-kosong-ruang');
  var emptyText = document.getElementById('teks-kosong-ruang');
  var noticeArea = document.getElementById('area-notifikasi-ruang');
  var searchForm = document.getElementById('form-cari-ruang');
  var searchInput = document.getElementById('cari-nama-ruang');
  var statusFilter = document.getElementById('cari-status-ruang');
  var roomModal = document.getElementById('modal-ruang');
  var roomForm = document.getElementById('form-ruang');
  var roomTitle = document.getElementById('judul-modal-ruang');
  var saveButton = document.getElementById('btn-simpan-ruang');
  var roomId = document.getElementById('field-id-ruang');
  var nameField = document.getElementById('field-nama-ruang');
  var capacityField = document.getElementById('field-kapasitas');
  var locationField = document.getElementById('field-lokasi');
  var activeField = document.getElementById('field-status-aktif');
  var deleteModal = document.getElementById('modal-hapus-ruang');
  var deleteForm = document.getElementById('form-hapus-ruang');
  var deleteId = document.getElementById('hapus-id-ruang');
  var deleteSummary = document.getElementById('hapus-ringkasan-ruang');
  var nextId = 7;

  function showNotice(type, message) {
    var iconNames = {
      success: 'fa-circle-check',
      info: 'fa-circle-info',
      danger: 'fa-circle-exclamation'
    };
    var alert = document.createElement('div');
    var icon = document.createElement('i');
    var closeButton = document.createElement('button');

    noticeArea.textContent = '';
    alert.className = 'alert alert-' + type + ' alert-feedback alert-dismissible fade show';
    alert.setAttribute('role', 'status');
    icon.className = 'fa-solid ' + iconNames[type] + ' me-2';
    icon.setAttribute('aria-hidden', 'true');
    closeButton.type = 'button';
    closeButton.className = 'btn-close';
    closeButton.setAttribute('data-bs-dismiss', 'alert');
    closeButton.setAttribute('aria-label', 'Tutup notifikasi');

    alert.appendChild(icon);
    alert.appendChild(document.createTextNode(message));
    alert.appendChild(closeButton);
    noticeArea.appendChild(alert);
  }

  function createCell(text, className) {
    var cell = document.createElement('td');
    cell.textContent = text;
    if (className) {
      cell.className = className;
    }
    return cell;
  }

  function createAction(label, className, room) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn-aksi ' + className;
    button.dataset.id = room.id;
    button.setAttribute('aria-label', label + ' ruang ' + room.nama);
    button.textContent = label;
    return button;
  }

  function renderRows() {
    var query = searchInput.value.trim().toLocaleLowerCase('id');
    var status = statusFilter.value;
    var matches = rooms.filter(function (room) {
      var matchesName = !query || room.nama.toLocaleLowerCase('id').indexOf(query) !== -1;
      var matchesStatus = !status || room.status === status;
      return matchesName && matchesStatus;
    });
    var pageCount = Math.ceil(matches.length / pageSize);
    if (currentPage > pageCount) {
      currentPage = Math.max(1, pageCount);
    }
    var startIndex = (currentPage - 1) * pageSize;
    var pageRooms = matches.slice(startIndex, startIndex + pageSize);

    tbody.textContent = '';
    pageRooms.forEach(function (room, index) {
      var row = document.createElement('tr');
      var statusBadge = document.createElement('span');
      var actionCell = document.createElement('td');

      row.appendChild(createCell(String(startIndex + index + 1), 'tabular'));
      row.appendChild(createCell(room.nama));
      row.appendChild(createCell(String(room.kapasitas), 'tabular'));
      row.appendChild(createCell(room.lokasi));

      statusBadge.className = 'badge-status ' + (room.status === 'aktif' ? 'is-aktif' : 'is-nonaktif');
      statusBadge.textContent = room.status === 'aktif' ? 'Aktif' : 'Nonaktif';
      row.appendChild(createCellWithNode(statusBadge, ''));

      actionCell.className = 'text-nowrap';
      actionCell.appendChild(createAction('Edit', 'btn-ubah', room));
      actionCell.appendChild(document.createTextNode(' '));
      actionCell.appendChild(createAction('Hapus', 'btn-hapus is-danger', room));
      row.appendChild(actionCell);
      tbody.appendChild(row);
    });

    emptyState.hidden = matches.length > 0;
    if (matches.length === 0) {
      emptyText.textContent = rooms.length === 0
        ? 'Belum ada data ruang.'
        : 'Tidak ada ruang yang cocok dengan pencarian.';
    }
    document.getElementById('info-ruang').textContent = matches.length
      ? 'Menampilkan ' + (startIndex + 1) + '–' + Math.min(startIndex + pageSize, matches.length) +
        ' dari ' + matches.length + ' ruang'
      : 'Tidak ada data ruang untuk ditampilkan.';
    renderPagination(pageCount);
  }

  function renderPagination(pageCount) {
    var pagination = document.getElementById('pagination-ruang');
    pagination.textContent = '';
    if (pageCount <= 1) {
      return;
    }

    addPaginationItem(pagination, currentPage - 1, 'Halaman sebelumnya',
      '<i class="fa-solid fa-chevron-left" aria-hidden="true"></i>', currentPage === 1);

    for (var page = 1; page <= pageCount; page++) {
      var item = document.createElement('li');
      var link = document.createElement('a');
      item.className = 'page-item' + (page === currentPage ? ' active' : '');
      if (page === currentPage) {
        item.setAttribute('aria-current', 'page');
      }
      link.className = 'page-link';
      link.href = '#';
      link.dataset.page = String(page);
      link.textContent = String(page);
      item.appendChild(link);
      pagination.appendChild(item);
    }

    addPaginationItem(pagination, currentPage + 1, 'Halaman berikutnya',
      '<i class="fa-solid fa-chevron-right" aria-hidden="true"></i>', currentPage === pageCount);
  }

  function addPaginationItem(pagination, page, label, icon, disabled) {
    var item = document.createElement('li');
    item.className = 'page-item' + (disabled ? ' disabled' : '');
    if (disabled) {
      var text = document.createElement('span');
      text.className = 'page-link';
      text.setAttribute('aria-label', label);
      text.setAttribute('aria-disabled', 'true');
      text.innerHTML = icon;
      item.appendChild(text);
    } else {
      var link = document.createElement('a');
      link.className = 'page-link';
      link.href = '#';
      link.dataset.page = String(page);
      link.setAttribute('aria-label', label);
      link.innerHTML = icon;
      item.appendChild(link);
    }
    pagination.appendChild(item);
  }

  function createCellWithNode(node, className) {
    var cell = document.createElement('td');
    if (className) {
      cell.className = className;
    }
    cell.appendChild(node);
    return cell;
  }

  function clearValidation() {
    [nameField, capacityField, locationField].forEach(function (field) {
      field.classList.remove('is-invalid');
    });
  }

  function validateForm() {
    clearValidation();
    var valid = true;

    nameField.value = nameField.value.trim();
    locationField.value = locationField.value.trim();

    if (!nameField.value) {
      nameField.classList.add('is-invalid');
      valid = false;
    }
    if (!capacityField.value || !capacityField.validity.valid) {
      capacityField.classList.add('is-invalid');
      valid = false;
    }
    if (!locationField.value) {
      locationField.classList.add('is-invalid');
      valid = false;
    }

    var firstInvalid = roomForm.querySelector('.is-invalid');
    if (firstInvalid) {
      firstInvalid.focus();
    }
    return valid;
  }

  function resetForm() {
    roomForm.reset();
    roomId.value = '';
    activeField.checked = true;
    clearValidation();
  }

  function openAddModal() {
    resetForm();
    roomTitle.textContent = 'Tambah Ruang';
    saveButton.textContent = 'Simpan';
  }

  function openEditModal(room) {
    roomTitle.textContent = 'Ubah Ruang';
    saveButton.textContent = 'Simpan Perubahan';
    roomId.value = room.id;
    nameField.value = room.nama;
    capacityField.value = String(room.kapasitas);
    locationField.value = room.lokasi;
    activeField.checked = room.status === 'aktif';
    clearValidation();
    bootstrap.Modal.getOrCreateInstance(roomModal).show();
  }

  function getRoom(id) {
    return rooms.find(function (room) {
      return room.id === id;
    });
  }

  document.getElementById('btn-tambah-ruang').addEventListener('click', openAddModal);

  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    currentPage = 1;
    renderRows();
    var visibleCount = tbody.querySelectorAll('tr').length;
    showNotice(visibleCount ? 'info' : 'danger',
      visibleCount ? visibleCount + ' ruang ditemukan.' : 'Tidak ada ruang yang cocok dengan pencarian.');
  });

  searchInput.addEventListener('input', function () {
    currentPage = 1;
    renderRows();
  });
  statusFilter.addEventListener('change', function () {
    currentPage = 1;
    renderRows();
  });

  document.getElementById('pagination-ruang').addEventListener('click', function (event) {
    var link = event.target.closest('a[data-page]');
    if (!link) {
      return;
    }
    event.preventDefault();
    currentPage = Number(link.dataset.page);
    renderRows();
  });

  tbody.addEventListener('click', function (event) {
    var editButton = event.target.closest('.btn-ubah');
    var deleteButton = event.target.closest('.btn-hapus');

    if (editButton) {
      var roomToEdit = getRoom(editButton.dataset.id);
      if (roomToEdit) {
        openEditModal(roomToEdit);
      }
    }

    if (deleteButton) {
      var roomToDelete = getRoom(deleteButton.dataset.id);
      if (roomToDelete) {
        deleteId.value = roomToDelete.id;
        deleteSummary.textContent = roomToDelete.nama + '  ·  Kapasitas ' +
          roomToDelete.kapasitas + '  ·  ' + roomToDelete.lokasi;
        bootstrap.Modal.getOrCreateInstance(deleteModal).show();
      }
    }
  });

  roomForm.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    var isEditing = Boolean(roomId.value);
    var updatedRoom = {
      id: isEditing ? roomId.value : String(nextId++),
      nama: nameField.value,
      kapasitas: Number(capacityField.value),
      lokasi: locationField.value,
      status: activeField.checked ? 'aktif' : 'nonaktif'
    };

    if (isEditing) {
      rooms = rooms.map(function (room) {
        return room.id === updatedRoom.id ? updatedRoom : room;
      });
    } else {
      rooms.push(updatedRoom);
    }

    renderRows();
    bootstrap.Modal.getOrCreateInstance(roomModal).hide();
    showNotice('success', isEditing
      ? 'Perubahan ruang diperbarui sementara di halaman ini; data belum tersimpan ke database.'
      : 'Ruang ditambahkan sementara di halaman ini; data belum tersimpan ke database.');
  });

  deleteForm.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!deleteId.value || !getRoom(deleteId.value)) {
      return;
    }

    rooms = rooms.filter(function (room) {
      return room.id !== deleteId.value;
    });
    deleteId.value = '';
    renderRows();
    bootstrap.Modal.getOrCreateInstance(deleteModal).hide();
    showNotice('success', 'Ruang dihapus dari tampilan sementara; perubahan belum disimpan ke database.');
  });

  [nameField, capacityField, locationField].forEach(function (field) {
    field.addEventListener('input', function () {
      field.classList.remove('is-invalid');
    });
    field.addEventListener('change', function () {
      field.classList.remove('is-invalid');
    });
  });

  roomModal.addEventListener('shown.bs.modal', function () {
    nameField.focus();
  });

  roomModal.addEventListener('hidden.bs.modal', resetForm);
  [roomModal, deleteModal].forEach(function (modal) {
    modal.addEventListener('show.bs.modal', function () {
      noticeArea.textContent = '';
    });
  });

  renderRows();
})();
