fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRdsw-kqJf1uuvB1Ame5UwemOGitSCmhHGI9r4EpxZOgqXHHEGTbMXFxWT5XE8xzk3MppbC9oa1M0YX/pub?output=csv')
  .then(response => response.text())
  .then(data => {
    const rows = data.split("\n").slice(1);
    let kondisi = {};
    rows.forEach(row => {
      const cols = row.split(",");
      const status = cols[3]; // Kondisi Marka ZoSS
      kondisi[status] = (kondisi[status] || 0) + 1;
    });

    new Chart(document.getElementById("chartKondisi"), {
      type: 'bar',
      data: {
        labels: Object.keys(kondisi),
        datasets: [{
          label: 'Jumlah Kondisi Marka ZoSS',
          data: Object.values(kondisi),
          backgroundColor: ['#0d6efd','#dc3545','#ffc107','#198754']
        }]
      }
    });
  });
