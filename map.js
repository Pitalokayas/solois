var map = L.map('map').setView([-7.75, 110.38], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRdsw-kqJf1uuvB1Ame5UwemOGitSCmhHGI9r4EpxZOgqXHHEGTbMXFxWT5XE8xzk3MppbC9oa1M0YX/pub?output=csv')
  .then(response => response.text())
  .then(data => {
    const rows = data.split("\n").slice(1);
    rows.forEach(row => {
      const cols = row.split(",");
      const lat = parseFloat(cols[0]);
      const lng = parseFloat(cols[1]);
      if (!isNaN(lat) && !isNaN(lng)) {
        L.marker([lat, lng]).addTo(map)
          .bindPopup(`ZoSS Panjang: ${cols[0]} m<br>Status Jalan: ${cols[2]}`);
      }
    });
  });
