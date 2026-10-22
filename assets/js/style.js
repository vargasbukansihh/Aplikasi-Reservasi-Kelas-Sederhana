(function () {
  'use strict';

  var tbody = document.getElementById('tabel-pengguna');
  var kosong = document.getElementById('keadaan-kosong');
  var teksKosong = document.getElementById('teks-kosong');
  var area = document.getElementById('area-notifikasi');

  var formCari = document.getElementById('form-cari');
  var inputCari = document.getElementById('cari-kata');
  var selectCariPeran = document.getElementById('cari-peran');

  var modalPengguna = document.getElementById('modal-pengguna');
  var formPengguna = document.getElementById('form-pengguna');
  var judulModal = document.getElementById('judul-modal-pengguna');
  var btnSimpan = document.getElementById('btn-simpan');
  var fieldId = document.getElementById('field-id');
  var fields = {
    nama: document.getElementById('field-nama'),
    identitas: document.getElementById('field-identitas'),
    email: document.getElementById('field-email'),
    peran: document.getElementById('field-peran')
  };
  var fieldAktif = document.getElementById('field-aktif');

  var modalHapus = document.getElementById('modal-hapus');
  var formHapus = document.getElementById('form-hapus');
  var hapusId = document.getElementById('hapus-id');
  var hapusRingkasan = document.getElementById('hapus-ringkasan');

  /* ---------- Notifikasi ---------- */
  function notifikasi(tipe, pesan) {
    var ikon = { success: 'fa-circle-check', info: 'fa-circle-info', danger: 'fa-circle-exclamation' }[tipe];
    area.textContent = '';
    var el = document.createElement('div');
    el.className = 'alert alert-' + tipe + ' alert-feedback alert-dismissible fade show';
    el.setAttribute('role', 'status');
    var i = document.createElement('i');
    i.className = 'fa-solid ' + ikon + ' me-2';
    i.setAttribute('aria-hidden', 'true');
    el.appendChild(i);
    el.appendChild(document.createTextNode(pesan));
    var tutup = document.createElement('button');
    tutup.type = 'button';
    tutup.className = 'btn-close';
    tutup.setAttribute('data-bs-dismiss', 'alert');
    tutup.setAttribute('aria-label', 'Tutup notifikasi');
    el.appendChild(tutup);
    area.appendChild(el);
  }

  /* ---------- Pencarian dan filter (sisi klien, pada baris yang tampil) ---------- */
  function baris() {
    return Array.prototype.slice.call(tbody.querySelectorAll('tr'));
  }

  function terapkanFilter(umpanBalik) {
    var kata = inputCari.value.trim().toLowerCase();
    var peran = selectCariPeran.value;
    var semua = baris();
    var tampil = 0;

    semua.forEach(function (tr) {
      var sel = tr.cells;
      var nama = sel[1].textContent.toLowerCase();
      var identitas = sel[2].textContent.toLowerCase();
      var teksPeran = sel[3].textContent.trim();
      var cocokKata = !kata || nama.indexOf(kata) !== -1 || identitas.indexOf(kata) !== -1;
      var cocokPeran = !peran || teksPeran === peran;
      var cocok = cocokKata && cocokPeran;
      tr.hidden = !cocok;
      if (cocok) { tampil++; }
    });

    kosong.hidden = tampil > 0;
    if (tampil === 0) {
      teksKosong.textContent = semua.length === 0
        ? 'Belum ada data pengguna.'
        : 'Tidak ada pengguna yang cocok dengan pencarian.';
    }

    if (umpanBalik && semua.length > 0) {
      notifikasi(tampil > 0 ? 'info' : 'danger',
        tampil > 0 ? tampil + ' pengguna ditemukan.' : 'Tidak ada pengguna yang cocok dengan pencarian.');
    }
  }

  formCari.addEventListener('submit', function (e) { e.preventDefault(); terapkanFilter(true); });
  inputCari.addEventListener('input', function () { terapkanFilter(false); });
  selectCariPeran.addEventListener('change', function () { terapkanFilter(true); });

  /* ---------- Validasi form ---------- */
  function setPesan(field, pesan) {
    var el = document.getElementById(field.getAttribute('aria-describedby'));
    if (el) { el.textContent = pesan; }
  }

  function bersihkanValidasi() {
    Object.keys(fields).forEach(function (k) { fields[k].classList.remove('is-invalid'); });
  }

  function validasi() {
    bersihkanValidasi();
    var pertama = null;

    function tandai(field, pesan) {
      field.classList.add('is-invalid');
      if (pesan) { setPesan(field, pesan); }
      pertama = pertama || field;
    }

    fields.nama.value = fields.nama.value.trim();
    if (!fields.nama.value) { tandai(fields.nama, 'Nama lengkap wajib diisi.'); }

    fields.identitas.value = fields.identitas.value.trim();
    if (!fields.identitas.value) { tandai(fields.identitas, 'NIM / ID wajib diisi.'); }

    fields.email.value = fields.email.value.trim();
    if (!fields.email.value) {
      tandai(fields.email, 'Email wajib diisi.');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.value)) {
      tandai(fields.email, 'Format email tidak valid.');
    }

    if (!fields.peran.value) { tandai(fields.peran, 'Peran wajib dipilih.'); }

    if (pertama) { pertama.focus(); return false; }
    return true;
  }

  formPengguna.addEventListener('submit', function (e) {
    /* Kesalahan ditampilkan inline di dekat field; jika valid, form dikirim
       apa adanya (method POST) agar diproses backend. */
    if (!validasi()) { e.preventDefault(); }
  });

  Object.keys(fields).forEach(function (k) {
    fields[k].addEventListener('input', function () { fields[k].classList.remove('is-invalid'); });
    fields[k].addEventListener('change', function () { fields[k].classList.remove('is-invalid'); });
  });

  /* ---------- Modal tambah / ubah / hapus ---------- */
  function modeTambah() {
    judulModal.textContent = 'Tambah Pengguna';
    btnSimpan.textContent = 'Simpan';
    formPengguna.reset();
    fieldId.value = '';
    fieldAktif.checked = true;
    bersihkanValidasi();
  }

  function modeUbah(data) {
    judulModal.textContent = 'Ubah Pengguna';
    btnSimpan.textContent = 'Simpan Perubahan';
    bersihkanValidasi();
    fieldId.value = data.id || '';
    fields.nama.value = data.nama || '';
    fields.identitas.value = data.identitas || '';
    fields.email.value = data.email || '';
    fields.peran.value = data.peran || '';
    fieldAktif.checked = data.status !== 'nonaktif';
  }

  document.getElementById('btn-tambah').addEventListener('click', modeTambah);

  tbody.addEventListener('click', function (e) {
    var ubah = e.target.closest('.btn-ubah');
    var hapus = e.target.closest('.btn-hapus');

    if (ubah) {
      modeUbah(ubah.dataset);
      bootstrap.Modal.getOrCreateInstance(modalPengguna).show();
    }

    if (hapus) {
      hapusId.value = hapus.dataset.id || '';
      hapusRingkasan.textContent = [hapus.dataset.nama, hapus.dataset.identitas, hapus.dataset.peran]
        .filter(Boolean).join('  ·  ');
      bootstrap.Modal.getOrCreateInstance(modalHapus).show();
    }
  });

  modalPengguna.addEventListener('shown.bs.modal', function () { fields.nama.focus(); });

  /* Notifikasi lama dibersihkan saat modal dibuka/ditutup agar tidak basi */
  [modalPengguna, modalHapus].forEach(function (m) {
    m.addEventListener('show.bs.modal', function () { area.textContent = ''; });
    m.addEventListener('hidden.bs.modal', function () { area.textContent = ''; });
  });

  formHapus.addEventListener('submit', function (e) {
    if (!hapusId.value) { e.preventDefault(); }
  });

  /* Keadaan awal */
  terapkanFilter(false);
})();