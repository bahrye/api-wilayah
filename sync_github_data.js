const fs = require('fs');
const readline = require('readline');

// URL dari repositori cahyadsn/wilayah file SQL utama
const URL_SQL = 'https://raw.githubusercontent.com/cahyadsn/wilayah/master/db/wilayah.sql';
// URL dari repositori cahyadsn/wilayah_kodepos file SQL utama
const URL_KODEPOS_SQL = 'https://raw.githubusercontent.com/cahyadsn/wilayah_kodepos/main/db/wilayah_kodepos.sql';

const outputSqlFile = 'sync_updates.sql';

async function fetchSQL(url) {
  console.log(`Mengambil data dari ${url}...`);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Gagal fetch ${url}`);
  const text = await response.text();
  return text.split('\n');
}

function getTipe(kode) {
  if (kode.length === 2) return 'provinsi';
  if (kode.length === 5) return 'kabupaten';
  if (kode.length === 8) return 'kecamatan';
  if (kode.length === 13) return 'desa';
  return 'unknown';
}

async function generateSyncSql() {
  const writeStream = fs.createWriteStream(outputSqlFile);
  writeStream.write("-- File ini di-generate otomatis untuk sinkronisasi D1 dari wilayah.sql dan wilayah_kodepos.sql\n\n");
  
  try {
    // 1. SINKRONISASI WILAYAH
    writeStream.write("-- 1. SINKRONISASI DATA WILAYAH\n");
    const linesWilayah = await fetchSQL(URL_SQL);
    console.log(`Memproses ${linesWilayah.length} baris SQL Wilayah...`);
    
    let countWilayah = 0;
    const regexWilayah = /\('([^']+)',\s*'([^']+)'\)/;

    for (const line of linesWilayah) {
      const match = line.match(regexWilayah);
      if (match) {
        const kode = match[1];
        const nama = match[2].replace(/'/g, "''"); 
        const tipe = getTipe(kode);
        
        const sql = `INSERT INTO wilayah (kode, nama, tipe) VALUES ('${kode}', '${nama}', '${tipe}') ` +
                    `ON CONFLICT(kode) DO UPDATE SET nama = excluded.nama;\n`;
        
        writeStream.write(sql);
        countWilayah++;
      }
    }
    console.log(`Berhasil memproses ${countWilayah} data wilayah.\n`);

    // 2. SINKRONISASI KODEPOS
    writeStream.write("\n-- 2. SINKRONISASI DATA KODEPOS\n");
    const linesKodepos = await fetchSQL(URL_KODEPOS_SQL);
    console.log(`Memproses ${linesKodepos.length} baris SQL Kodepos...`);
    
    let countKodepos = 0;
    // Format SQL Kodepos: ('11.01.01.2001', '23773')
    const regexKodepos = /\('([^']+)',\s*'([^']+)'\)/;

    for (const line of linesKodepos) {
      const match = line.match(regexKodepos);
      if (match) {
        const kode = match[1];
        const kodepos = match[2];
        
        // Logika UPDATE untuk menambahkan kodepos ke wilayah yang sudah ada
        const sql = `UPDATE wilayah SET kodepos = '${kodepos}' WHERE kode = '${kode}';\n`;
        
        writeStream.write(sql);
        countKodepos++;
      }
    }
    console.log(`Berhasil memproses ${countKodepos} data kodepos.\n`);

    writeStream.end();
    console.log(`✅ Selesai! File SQL sinkronisasi telah dibuat: ${outputSqlFile}`);
    console.log(`\nCara menjalankan ke database D1 (lokal):`);
    console.log(`npx wrangler d1 execute wilayah-db --local --file=${outputSqlFile}`);
    console.log(`\nCara menjalankan ke database D1 (production):`);
    console.log(`npx wrangler d1 execute wilayah-db --remote --file=${outputSqlFile}`);

  } catch (err) {
    console.error("Terjadi Kesalahan:", err);
  }
}

generateSyncSql();

