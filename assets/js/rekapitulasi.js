(function () {
  'use strict';

  var reportRows = [
    { room: 'Ruang A101', total: 32, approved: 28, completed: 26, cancelled: 4, hours: 64 },
    { room: 'Ruang A102', total: 24, approved: 22, completed: 20, cancelled: 2, hours: 48 },
    { room: 'Lab Komputer 1', total: 30, approved: 27, completed: 25, cancelled: 3, hours: 75 },
    { room: 'Ruang B202', total: 21, approved: 18, completed: 17, cancelled: 3, hours: 42 },
    { room: 'Aula Mini', total: 17, approved: 15, completed: 15, cancelled: 2, hours: 51 }
  ];

  var tableBody = document.getElementById('tabel-rekap-ruang');
  var chartBars = document.getElementById('chart-bars');
  var emptyState = document.getElementById('rekap-kosong');
  var roomFilter = document.getElementById('filter-ruang');
  var fromDate = document.getElementById('periode-dari');
  var toDate = document.getElementById('periode-sampai');

  function addCell(row, value, className, tagName) {
    var cell = document.createElement(tagName || 'td');
    cell.textContent = String(value);
    if (className) {
      cell.className = className;
    }
    row.appendChild(cell);
  }

  function renderTable(rows) {
    tableBody.textContent = '';

    rows.forEach(function (report) {
      var row = document.createElement('tr');
      addCell(row, report.room);
      addCell(row, report.total, 'text-end tabular');
      addCell(row, report.approved, 'text-end tabular');
      addCell(row, report.completed, 'text-end tabular');
      addCell(row, report.cancelled, 'text-end tabular');
      addCell(row, report.hours, 'text-end tabular');
      tableBody.appendChild(row);
    });

    emptyState.hidden = rows.length > 0;
    document.getElementById('total-reservasi').textContent =
      rows.length === 1 ? String(rows[0].total) : '124';
    document.getElementById('total-jam').textContent =
      (rows.length === 1 ? rows[0].hours : 312) + ' jam';
    document.getElementById('ruang-teratas').textContent =
      rows.length === 1 ? rows[0].room : 'Ruang A101';
  }

  function renderChart(rows) {
    chartBars.textContent = '';
    var maxTotal = Math.max.apply(null, rows.map(function (row) {
      return row.total;
    }).concat([1]));

    rows.forEach(function (report) {
      var item = document.createElement('div');
      var bar = document.createElement('div');
      var label = document.createElement('span');
      var abbreviatedName = {
        'Ruang A101': 'A101',
        'Ruang A102': 'A102',
        'Lab Komputer 1': 'Lab 1',
        'Ruang B202': 'B202',
        'Aula Mini': 'Aula'
      }[report.room] || report.room;

      item.className = 'chart-bar-item';
      var barHeight = Math.max(10, Math.round(report.total / maxTotal * 10) * 10);
      bar.className = 'chart-bar chart-bar-' + barHeight;
      label.className = 'chart-label';
      label.textContent = abbreviatedName;
      label.title = report.room + ': ' + report.total + ' reservasi';
      item.appendChild(bar);
      item.appendChild(label);
      chartBars.appendChild(item);
    });

    document.getElementById('grafik-ruang').setAttribute(
      'aria-label',
      rows.length
        ? 'Grafik jumlah reservasi per ruang: ' + rows.map(function (row) {
          return row.room + ', ' + row.total + ' reservasi';
        }).join('; ')
        : 'Tidak ada data reservasi untuk ditampilkan'
    );
  }

  function applyFilter() {
    var selectedRoom = roomFilter.value;
    var filteredRows = reportRows.filter(function (report) {
      return !selectedRoom || report.room === selectedRoom;
    });
    renderTable(filteredRows);
    renderChart(filteredRows);
  }

  document.getElementById('form-filter-laporan').addEventListener('submit', function (event) {
    event.preventDefault();
    if (!fromDate.value || !toDate.value) {
      fromDate.reportValidity();
      return;
    }
    if (fromDate.value > toDate.value) {
      toDate.setCustomValidity('Tanggal akhir harus sama dengan atau setelah tanggal awal.');
      toDate.reportValidity();
      toDate.setCustomValidity('');
      return;
    }
    applyFilter();
  });

  fromDate.addEventListener('change', function () {
    toDate.min = fromDate.value;
  });
  roomFilter.addEventListener('change', applyFilter);
  document.getElementById('btn-ekspor').addEventListener('click', function () {
    window.print();
  });

  applyFilter();
})();
