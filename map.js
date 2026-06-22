let map;
let markersLayer;
let allSchoolData = [];

document.addEventListener("DOMContentLoaded", async () => {
  initMap();

  try {
    const data = await fetchSpreadsheetData();
    allSchoolData = data.filter((item) => parseCoordinate(item.titikKoordinat));

    populateFilters(allSchoolData);
    renderMarkers(allSchoolData);

    const loading = document.getElementById("mapLoading");
    if (loading) loading.style.display = "none";

    document.getElementById("filterJenjang").addEventListener("change", applyFilters);
    document.getElementById("filterKapanewon").addEventListener("change", applyFilters);
    document.getElementById("filterZoSS").addEventListener("change", applyFilters);
  } catch (error) {
    console.error(error);
    const loading = document.getElementById("mapLoading");
    if (loading) {
      loading.innerHTML = `<div class="alert alert-danger mb-0">Gagal memuat data peta dari spreadsheet.</div>`;
    }
  }
});

function initMap() {
  map = L.map("map").setView([-7.75, 110.37], 11);

  L.tileLayer("[{s}.tile.openstreetmap.org](https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png)", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);
}

function populateFilters(data) {
  const jenjangSet = [...new Set(data.map((item) => item.jenjangSekolah).filter(Boolean))].sort();
  const kapanewonSet = [...new Set(data.map((item) => item.kapanewon).filter(Boolean))].sort();

  const filterJenjang = document.getElementById("filterJenjang");
  const filterKapanewon = document.getElementById("filterKapanewon");

  jenjangSet.forEach((item) => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    filterJenjang.appendChild(option);
  });

  kapanewonSet.forEach((item) => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    filterKapanewon.appendChild(option);
  });
}

function renderMarkers(data) {
  markersLayer.clearLayers();

  const bounds = [];

  data.forEach((item) => {
    const coord = parseCoordinate(item.titikKoordinat);
    if (!coord) return;

    const marker = L.marker([coord.lat, coord.lng]).bindPopup(`
      <div>
        <h6 class="fw-bold mb-2">${item.namaSekolah}</h6>
        <div><strong>Jenjang:</strong> ${item.jenjangSekolah || "-"}</div>
        <div><strong>Alamat:</strong> ${item.alamatSekolah || "-"}</div>
        <div><strong>Kapanewon:</strong> ${item.kapanewon || "-"}</div>
        <div><strong>Status ZoSS:</strong> ${item.statusZoSS || "-"}</div>
        <div><strong>Tahun:</strong> ${item.tahunPemasangan || "-"}</div>
      </div>
    `);

    marker.addTo(markersLayer);
    bounds.push([coord.lat, coord.lng]);
  });

  if (bounds.length > 0) {
    map.fitBounds(bounds, { padding: [30, 30] });
  }
}

function applyFilters() {
  const jenjang = document.getElementById("filterJenjang").value;
  const kapanewon = document.getElementById("filterKapanewon").value;
  const zoss = document.getElementById("filterZoSS").value;

  const filtered = allSchoolData.filter((item) => {
    const matchJenjang = !jenjang || item.jenjangSekolah === jenjang;
    const matchKapanewon = !kapanewon || item.kapanewon === kapanewon;
    const matchZoSS = !zoss || normalizeZoSS(item.statusZoSS) === zoss;
    return matchJenjang && matchKapanewon && matchZoSS;
  });

  renderMarkers(filtered);
}

function normalizeZoSS(value) {
  const text = (value || "").toString().trim().toLowerCase();
  if (text === "ya") return "Ya";
  if (text === "tidak") return "Tidak";
  return value || "";
}
