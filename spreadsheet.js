const SPREADSHEET_CSV_URL =
  "[docs.google.com](https://docs.google.com/spreadsheets/d/e/2PACX-1vRdsw-kqJf1uuvB1Ame5UwemOGitSCmhHGI9r4EpxZOgqXHHEGTbMXFxWT5XE8xzk3MppbC9oa1M0YX/pub?output=csv)";

async function fetchSpreadsheetData() {
  const response = await fetch(SPREADSHEET_CSV_URL);
  if (!response.ok) {
    throw new Error("Gagal mengambil data spreadsheet.");
  }

  const csvText = await response.text();
  return parseCSV(csvText);
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(current.trim());
      current = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (current.length > 0 || row.length > 0) {
        row.push(current.trim());
        rows.push(row);
        row = [];
        current = "";
      }

      if (char === "\r" && nextChar === "\n") {
        i++;
      }
    } else {
      current += char;
    }
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current.trim());
    rows.push(row);
  }

  if (rows.length === 0) return [];

  const headers = rows[0].map((header) => normalizeHeader(header));
  const dataRows = rows.slice(1);

  return dataRows
    .filter((cols) => cols.some((col) => col && col.trim() !== ""))
    .map((cols) => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = cols[index] ? cols[index].trim() : "";
      });
      return mapRow(obj);
    });
}

function normalizeHeader(header) {
  return header
    .toLowerCase()
    .trim()
    .replace(/\?/g, "")
    .replace(/\./g, "")
    .replace(/\s+/g, "_");
}

function mapRow(row) {
  return {
    namaSekolah:
      row.nama_sekolah || row.nama || "",
    jenjangSekolah:
      row.jenjang_sekolah || row.jenjang || "",
    alamatSekolah:
      row.alamat_sekolah || row.alamat || "",
    kapanewon:
      row.kapanewon || "",
    titikKoordinat:
      row.titik_koordinat_sekolah || row.titik_koordinat || "",
    statusZoSS:
      row.apakah_lokasi_sudah_memiliki_zoss || row.status_zoss || "",
    tahunPemasangan:
      row.tahun_pemasangan || row.tahun_pemasangan_zoss || ""
  };
}

function parseCoordinate(coordString) {
  if (!coordString) return null;

  const parts = coordString.split(",");
  if (parts.length !== 2) return null;

  const lat = parseFloat(parts[0].trim());
  const lng = parseFloat(parts[1].trim());

  if (isNaN(lat) || isNaN(lng)) return null;

  return { lat, lng };
}

function groupCount(data, key) {
  return data.reduce((acc, item) => {
    const value = (item[key] || "Tidak diketahui").trim() || "Tidak diketahui";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}
