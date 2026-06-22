/**
 * APP.JS
 * Logika pengendali dashboard utama dan tabel interaktif DataTables.
 */

document.addEventListener("DOMContentLoaded", async () => {
    // Ambil data global dari modul spreadsheet
    const data = await fetchSpreadsheetData();
    
    // Hitung ringkasan angka jika komponen statistiknya tersedia di halaman
    calculateGlobalStats(data);

    // Lakukan render DataTables jika sedang membuka halaman inventarisasi
    if (document.getElementById("zossTable")) {
        renderInventarisasiTable(data);
    }
});

function calculateGlobalStats(data) {
    const totalSekolah = data.length;
    const sudahZoss = data.filter(d => d.status_zoss && d.status_zoss.toLowerCase().includes("sudah")).length;
    const belumZoss = totalSekolah - sudahZoss;
    const markaBaik = data.filter(d => d.kondisi_marka && d.kondisi_marka.toLowerCase() === "baik").length;

    if (document.getElementById("stat-total")) document.getElementById("stat-total").innerText = totalSekolah;
    if (document.getElementById("stat-zoss-ada")) document.getElementById("stat-zoss-ada").innerText = sudahZoss;
    if (document.getElementById("stat-zoss-tidak")) document.getElementById("stat-zoss-tidak").innerText = belumZoss;
    if (document.getElementById("stat-marka-baik")) document.getElementById("stat-marka-baik").innerText = markaBaik;
}

function renderInventarisasiTable(data) {
    const spinner = document.getElementById("loading-spinner");
    const tableContainer = document.getElementById("table-container");
    const tbody = document.querySelector("#zossTable tbody");

    tbody.innerHTML = "";

    data.forEach(item => {
        // Pembuatan badge warna estetis untuk status ZoSS
        let badgeZoss = item.status_zoss.toLowerCase().includes("sudah") 
            ? '<span class="badge bg-success"><i class="fa-solid fa-check-circle me-1"></i>Sudah</span>'
            : '<span class="badge bg-danger"><i class="fa-solid fa-times-circle me-1"></i>Belum</span>';

        // Pembuatan badge warna estetis untuk kondisi fisik marka
        let badgeMarka = '<span class="badge bg-secondary">-</span>';
        if (item.kondisi_marka.toLowerCase() === "baik") {
            badgeMarka = '<span class="badge bg-success"><i class="fa-solid fa-square-check me-1"></i>Baik</span>';
        } else if (item.kondisi_marka.toLowerCase() === "pudar") {
            badgeMarka = '<span class="badge bg-warning text-dark"><i class="fa-solid fa-triangle-exclamation me-1"></i>Pudar</span>';
        } else if (item.kondisi_marka.toLowerCase() === "rusak") {
            badgeMarka = '<span class="badge bg-danger"><i class="fa-solid fa-circle-exclamation me-1"></i>Rusak</span>';
        }

        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="fw-bold">${item.nama_sekolah}</td>
            <td>${item.alamat}</td>
            <td>${item.kapanewon}</td>
            <td>${badgeZoss}</td>
            <td>${item.tahun_pasang}</td>
            <td>${item.status_jalan}</td>
            <td>${badgeMarka}</td>
        `;
        tbody.appendChild(row);
    });

    if (spinner) spinner.classList.add("d-none");
    if (tableContainer) tableContainer.classList.remove("d-none");

    // Inisialisasi DataTables JQuery dengan Bahasa Indonesia resmi
    $('#zossTable').DataTable({
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.13.5/i18n/id.json'
        },
        pageLength: 10,
        responsive: true
    });
}
