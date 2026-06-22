/**
 * STATISTIK.JS
 * Agregasi data spreadsheet dan rendering komponen grafik Chart.js.
 */

document.addEventListener("DOMContentLoaded", async () => {
    if (!document.getElementById("chartZossStatus")) return;

    const data = await fetchSpreadsheetData();
    
    if (document.getElementById("loading-spinner")) document.getElementById("loading-spinner").classList.add("d-none");
    if (document.getElementById("charts-container")) document.getElementById("charts-container").classList.remove("d-none");

    renderCharts(data);
});

function renderCharts(data) {
    // 1. Chart Status Ketersediaan ZoSS (Doughnut)
    const sudahCount = data.filter(d => d.status_zoss.toLowerCase().includes("sudah")).length;
    const belumCount = data.length - sudahCount;

    new Chart(document.getElementById("chartZossStatus"), {
        type: 'doughnut',
        data: {
            labels: ['Sudah Memiliki ZoSS', 'Belum Memiliki ZoSS'],
            datasets: [{
                data: [sudahCount, belumCount],
                backgroundColor: ['#198754', '#dc3545'],
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // 2. Chart Kondisi Kerusakan Marka (Pie)
    const mBaik = data.filter(d => d.kondisi_marka.toLowerCase() === "baik").length;
    const mPudar = data.filter(d => d.kondisi_marka.toLowerCase() === "pudar").length;
    const mRusak = data.filter(d => d.kondisi_marka.toLowerCase() === "rusak").length;
    const mTanpa = data.filter(d => d.kondisi_marka.toLowerCase() === "-" || d.kondisi_marka.trim() === "").length;

    new Chart(document.getElementById("chartKondisiMarka"), {
        type: 'pie',
        data: {
            labels: ['Baik', 'Pudar', 'Rusak', 'Tidak Ada Marka / Data'],
            datasets: [{
                data: [mBaik, mPudar, mRusak, mTanpa],
                backgroundColor: ['#198754', '#ffc107', '#dc3545', '#6c757d']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // 3. Chart Distribusi per Wilayah Kapanewon (Bar)
    const kapanewonMap = {};
    data.forEach(d => {
        const kap = d.kapanewon || "Lainnya";
        if (!kapanewonMap[kap]) {
            kapanewonMap[kap] = { sudah: 0, total: 0 };
        }
        kapanewonMap[kap].total += 1;
        if (d.status_zoss.toLowerCase().includes("sudah")) {
            kapanewonMap[kap].sudah += 1;
        }
    });

    const labelKapanewon = Object.keys(kapanewonMap);
    const dataSudah = labelKapanewon.map(k => kapanewonMap[k].sudah);
    const dataTotal = labelKapanewon.map(k => kapanewonMap[k].total);

    new Chart(document.getElementById("chartKapanewon"), {
        type: 'bar',
        data: {
            labels: labelKapanewon,
            datasets: [
                {
                    label: 'Sudah Memiliki ZoSS',
                    data: dataSudah,
                    backgroundColor: '#198754'
                },
                {
                    label: 'Total Terdata',
                    data: dataTotal,
                    backgroundColor: '#0d6efd'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}
