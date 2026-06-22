/**
 * MAP.JS
 * Kontrol pemetaan geografis spasial menggunakan Leaflet JS dengan sistem filter dinamis.
 */

let map;
let markerLayerGroup;
let allMapData = [];

document.addEventListener("DOMContentLoaded", async () => {
    if (!document.getElementById("map")) return;

    // Inisialisasi awal koordinat tengah Sleman (peta utama)
    map = L.map('map').setView([-7.7150, 110.3550], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    markerLayerGroup = L.layerGroup().addTo(map);

    // Ambil data dan letakkan marker di peta
    allMapData = await fetchSpreadsheetData();
    renderMarkers(allMapData);

    // Filter Trigger Listener
    document.getElementById("filter-zoss").addEventListener("change", applyMapFilters);
    document.getElementById("filter-marka").addEventListener("change", applyMapFilters);
});

/**
 * Pengubah teks string koordinat menjadi array float lintang bujur [lat, lng]
 */
function parseLatLng(koordinatStr) {
    if (!koordinatStr) return null;
    const parts = koordinatStr.split(',');
    if (parts.length !== 2) return null;

    const lat = parseFloat(parts[0].trim());
    const lng = parseFloat(parts[1].trim());

    if (isNaN(lat) || isNaN(lng)) return null;
    return [lat, lng];
}

function renderMarkers(dataList) {
    markerLayerGroup.clearLayers();

    dataList.forEach(item => {
        const coords = parseLatLng(item.koordinat);
        if (!coords) return; 

        // Pewarnaan dinamis penanda (Hijau jika ada ZoSS, Merah jika Belum)
        const isSudah = item.status_zoss.toLowerCase().includes("sudah");
        const markerColor = isSudah ? "#198754" : "#dc3545";

        const marker = L.circleMarker(coords, {
            radius: 8,
            fillColor: markerColor,
            color: "#ffffff",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        });

        // Struktur HTML Balon Balas Informasi (Popup Card)
        const popupContent = `
            <div style="font-family: sans-serif; min-width: 200px;">
                <h6 style="margin: 0 0 8px 0; font-weight: bold; color: #1e3c72;">${item.nama_sekolah}</h6>
                <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
                    <tr><td style="color:#666; padding: 2px 0;">Kapanewon:</td><td class="leaflet-popup-content-value">${item.kapanewon}</td></tr>
                    <tr><td style="color:#666; padding: 2px 0;">Status ZoSS:</td><td class="leaflet-popup-content-value">${item.status_zoss}</td></tr>
                    <tr><td style="color:#666; padding: 2px 0;">Thn Pasang:</td><td class="leaflet-popup-content-value">${item.tahun_pasang}</td></tr>
                    <tr><td style="color:#666; padding: 2px 0;">Kondisi Marka:</td><td class="leaflet-popup-content-value">${item.kondisi_marka}</td></tr>
                    <tr><td style="color:#666; padding: 2px 0;">Status Jalan:</td><td class="leaflet-popup-content-value">${item.status_jalan}</td></tr>
                </table>
                <p style="margin: 8px 0 0 0; font-size: 11px; color:#888; font-style: italic;">${item.alamat}</p>
            </div>
        `;

        marker.bindPopup(popupContent);
        markerLayerGroup.addLayer(marker);
    });
}

function applyMapFilters() {
    const filterZoss = document.getElementById("filter-zoss").value;
    const filterMarka = document.getElementById("filter-marka").value;

    const filtered = allMapData.filter(item => {
        let matchZoss = true;
        let matchMarka = true;

        if (filterZoss !== "all") {
            matchZoss = item.status_zoss.toLowerCase().includes(filterZoss.toLowerCase());
        }
        if (filterMarka !== "all") {
            matchMarka = item.kondisi_marka.toLowerCase() === filterMarka.toLowerCase();
        }

        return matchZoss && matchMarka;
    });

    renderMarkers(filtered);
}
