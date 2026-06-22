document.addEventListener("DOMContentLoaded", async () => {
  try {
    const data = await fetchSpreadsheetData();

    if (document.getElementById("totalSekolah")) {
      renderHomepageSummary(data);
    }

    if (document.getElementById("schoolTable")) {
      renderInventoryTable(data);
    }
  } catch (error) {
    console.error(error);
    showSimpleError("Terjadi kesalahan saat memuat data spreadsheet.");
  }
});

function renderHomepageSummary(data) {
  const totalSekolah = data.length;
  const totalZoSS = data.filter((item) => normalizeZoSS(item.statusZoSS) === "Ya").length;
  const totalKapanewon = new Set(data.map((item) => item.kapanewon).filter(Boolean)).size;
  const totalJenjang = new Set(data.map((item) => item.jenjangSekolah).filter(Boolean)).size;

  document.getElementById("totalSekolah").textContent = totalSekolah;
  document.getElementById("totalZoSS").textContent = totalZoSS;
  document.getElementById("totalKapanewon").textContent = totalKapanewon;
  document.getElementById("totalJenjang").textContent = totalJenjang;
}

function renderInventoryTable(data) {
  const loading = document.getElementById("tableLoading");
  if (loading) loading.style.display = "none";

  const rows = data.map((item, index) => [
    index + 1,
    item.namaSekolah,
    item.jenjangSekolah,
    item.alamatSekolah,
    item.kapanewon,
    item.titikKoordinat,
    renderZoSSBadge(item.statusZoSS),
    item.tahunPemasangan || "-"
  ]);

  $("#schoolTable").DataTable({
    data: rows,
    destroy: true,
    responsive: true,
    dom: "Bfrtip",
    buttons: [
      {
        extend: "excelHtml5",
        title: "Data Inventarisasi SiOSS"
      },
      {
        extend: "csvHtml5",
        title: "Data Inventarisasi SiOSS"
      },
      {
        extend: "print",
        title: "Data Inventarisasi SiOSS"
      }
    ],
    columnDefs: [
      { targets: [0], className: "text-center" },
      { targets: [6], className: "text-center" }
    ],
    language: {
      search: "Cari:",
      lengthMenu: "Tampilkan _MENU_ data",
      info: "Menampilkan _START_ sampai _END_ dari _TOTAL_ data",
      infoEmpty: "Tidak ada data",
      zeroRecords: "Data tidak ditemukan",
      paginate: {
        first: "Awal",
        last: "Akhir",
        next: "Berikutnya",
        previous: "Sebelumnya"
      },
      buttons: {
        copy: "Salin",
        csv: "CSV",
        excel: "Excel",
        print: "Cetak"
      }
    }
  });
}

function normalizeZoSS(value) {
  const text = (value || "").toString().trim().toLowerCase();
  if (text === "ya") return "Ya";
  if (text === "tidak") return "Tidak";
  return value || "-";
}

function renderZoSSBadge(status) {
  const normalized = normalizeZoSS(status);
  if (normalized === "Ya") {
    return '<span class="badge badge-zoss-yes">Ya</span>';
  }
  if (normalized === "Tidak") {
    return '<span class="badge badge-zoss-no">Tidak</span>';
  }
  return `<span class="badge text-bg-secondary">${normalized}</span>`;
}

function showSimpleError(message) {
  const loaders = ["tableLoading", "statsLoading", "mapLoading"];
  loaders.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = `<div class="alert alert-danger mb-0">${message}</div>`;
    }
  });
}

