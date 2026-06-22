/**
 * SPREADSHEET.JS
 * Modul utama pengambil data, parsing CSV, dan repositori data global.
 */

const SPREADSHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRdsw-kqJf1uuvB1Ame5UwemOGitSCmhHGI9r4EpxZOgqXHHEGTbMXFxWT5XE8xzk3MppbC9oa1M0YX/pub?gid=350880467&single=true&output=csv";

// Penyimpanan Cache Data Global
let rawDataCache = [];

/**
 * Fungsi cerdas parsing CSV aman untuk menghindari kerusakan kolom akibat koma di dalam tanda kutip (alamat)
 */
function parseCSV(text) {
    let lines = [];
    let row = [""];
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        let c = text[i];
        let next = text[i+1];

        if (c === '"') {
            if (inQuotes && next === '"') {
                row[row.length - 1] += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (c === ',' && !inQuotes) {
            row.push('');
        } else if ((c === '\r' || c === '\n') && !inQuotes) {
            if (c === '\r' && next === '\n') { i++; }
            lines.push(row);
            row = [''];
        } else {
            row[row.length - 1] += c;
        }
    }
    if (row.length > 1 || row[0] !== '') {
        lines.push(row);
    }
    return lines;
}

/**
 * Mengambil data dari Google Spreadsheet dan mengembalikan objek Array terstruktur
 */
async function fetchSpreadsheetData() {
    if (rawDataCache.length > 0) {
        return rawDataCache;
    }

    try {
        const response = await fetch(SPREADSHEET_CSV_URL);
        if (!response.ok) throw new Error("Koneksi gagal saat menghubungi basis data.");
        
        const csvText = await response.text();
        const parsedLines = parseCSV(csvText);
        
        if (parsedLines.length < 2) return [];

        const formattedData = [];
        for (let i = 1; i < parsedLines.length; i++) {
            const row = parsedLines[i];
            if (row.length < 8) continue; 

            let schoolObj = {
                nama_sekolah: row[0] ? row[0].trim() : "",
                alamat: row[1] ? row[1].trim() : "",
                kapanewon: row[2] ? row[2].trim() : "",
                koordinat: row[3] ? row[3].trim() : "",
                status_zoss: row[4] ? row[4].trim() : "Belum",
                tahun_pasang: row[5] ? row[5].trim() : "-",
                status_jalan: row[6] ? row[6].trim() : "-",
                kondisi_marka: row[7] ? row[7].trim() : "-"
            };
            
            if (schoolObj.nama_sekolah) {
                formattedData.push(schoolObj);
            }
        }

        rawDataCache = formattedData;
        return formattedData;
    } catch (error) {
        console.error("Spreadsheet Fetch Error:", error);
        alert("Gagal memuat basis data online. Periksa sambungan jaringan internet Anda.");
        return [];
    }
}

/**
 * Mereset cache dan memperbarui halaman secara paksa
 */
function refreshSpreadsheetData() {
    rawDataCache = [];
    window.location.reload();
}
