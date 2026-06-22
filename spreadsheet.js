/**
 * SPREADSHEET.JS (VERSI DEBUGGING)
 * Modul utama pengambil data, parsing CSV, dan repositori data global.
 */

// Pastikan kutip menggunakan kutip lurus standar komputer
const SPREADSHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1vRdsw-kqJf1uuvB1Ame5UwemOGitSCmhHGI9r4EpxZOgqXHHEGTbMXFxWT5XE8xzk3MppbC9oa1M0YX/gviz/tq?tqx=out:csv&gid=350880467";

// Penyimpanan Cache Data Global
let rawDataCache = [];

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

async function fetchSpreadsheetData() {
    if (rawDataCache.length > 0) {
        return rawDataCache;
    }

    console.log("Mulai mencoba mengambil data dari URL:", SPREADSHEET_CSV_URL);

    try {
        const response = await fetch(SPREADSHEET_CSV_URL);
        console.log("Respon HTTP dari Google Sheets diperoleh. Status:", response.status);
        
        if (!response.ok) throw new Error("Koneksi gagal ke server Google Sheets.");
        
        const csvText = await response.text();
        console.log("Data mentah CSV berhasil diunduh. Panjang karakter:", csvText.length);
        
        const parsedLines = parseCSV(csvText);
        console.log("Jumlah baris yang berhasil di-parse:", parsedLines.length);
        
        if (parsedLines.length < 2) {
            console.warn("Peringatan: Baris data spreadsheet kurang dari 2 baris.");
            return [];
        }

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

        console.log("Proses format data selesai. Total data objek siap render:", formattedData.length);
        rawDataCache = formattedData;
        return formattedData;
    } catch (error) {
        console.error("Terjadi error fatal pada fungsi fetchSpreadsheetData():", error);
        return [];
    }
}

function refreshSpreadsheetData() {
    rawDataCache = [];
    window.location.reload();
}
