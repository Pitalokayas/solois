document.addEventListener("DOMContentLoaded", async () => {
  try {
    const data = await fetchSpreadsheetData();
    renderStatistics(data);
  } catch (error) {
    console.error(error);
    const loading = document.getElementById("statsLoading");
    if (loading) {
      loading.innerHTML = `<div class="alert alert-danger mb-0">Gagal memuat statistik dari spreadsheet.</div>`;
    }
  }
});

function renderStatistics(data) {
  const totalSekolah = data.length;
  const jumlahYa = data.filter((item) => normalizeZoSS(item.statusZoSS) === "Ya").length;
  const jumlahTidak = data.filter((item) => normalizeZoSS(item.statusZoSS) === "Tidak").length;
  const jumlahKapanewon = new Set(data.map((item) => item.kapanewon).filter(Boolean)).size;

  document.getElementById("statTotalSekolah").textContent = totalSekolah;
  document.getElementById("statZoSSYa").textContent = jumlahYa;
  document.getElementById("statZoSSTidak").textContent = jumlahTidak;
  document.getElementById("statKapanewon").textContent = jumlahKapanewon;

  const jenjangData = groupCount(data, "jenjangSekolah");
  const zossData = groupCount(
    data.map((item) => ({
      status: normalizeZoSS(item.statusZoSS)
    })),
    "status"
  );
  const kapanewonData = groupCount(data, "kapanewon");

  renderPieChart("jenjangChart", Object.keys(jenjangData), Object.values(jenjangData), [
    "#0d6efd",
    "#20c997",
    "#ffc107",
    "#dc3545",
    "#6f42c1",
    "#fd7e14"
  ]);

  renderDoughnutChart("zossChart", Object.keys(zossData), Object.values(zossData), [
    "#198754",
    "#dc3545",
    "#6c757d"
  ]);

  const sortedKapanewon = Object.entries(kapanewonData).sort((a, b) => b[1] - a[1]);
  renderBarChart(
    "kapanewonChart",
    sortedKapanewon.map((item) => item[0]),
    sortedKapanewon.map((item) => item[1])
  );

  const loading = document.getElementById("statsLoading");
  if (loading) loading.style.display = "none";
}

function renderPieChart(canvasId, labels, data, colors) {
  new Chart(document.getElementById(canvasId), {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

function renderDoughnutChart(canvasId, labels, data, colors) {
  new Chart(document.getElementById(canvasId), {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

function renderBarChart(canvasId, labels, data) {
  new Chart(document.getElementById(canvasId), {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Jumlah Sekolah",
          data,
          backgroundColor: "#0d6efd"
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  });
}

function normalizeZoSS(value) {
  const text = (value || "").toString().trim().toLowerCase();
  if (text === "ya") return "Ya";
  if (text === "tidak") return "Tidak";
  return value || "Tidak diketahui";
}
