const fs = require('fs');
const readline = require('readline');

// URL dari repositori cahyadsn/wilayah
const URLS = {
  provinsi: 'https://raw.githubusercontent.com/cahyadsn/wilayah/master/db/provinsi.csv',
  kabupaten: 'https://raw.githubusercontent.com/cahyadsn/wilayah/master/db/kabupaten.csv',
  kecamatan: 'https://raw.githubusercontent.com/cahyadsn/wilayah/master/db/kecamatan.csv',
  desa: 'https://raw.githubusercontent.com/cahyadsn/wilayah/master/db/desa.csv'
  // Jika ingin kodepos, bisa dicari source CSV yang tepat dari repository wilayah_kodepos
};

const outputSqlFile = 'sync_updates.sql';

async function fetchCSV(url) {
  console.log(`Mengambil data dari ${url}...`);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Gagal fetch ${url}`);
  const text = await response.text();
  return text.split('\n').filter(line => line.trim() !== '');
}

async function generateSyncSql() {
  const writeStream = fs.createWriteStream(outputSqlFile);
  
  // Tulis header
  writeStream.write("-- File ini di-generate otomatis untuk sinkronisasi D1\n\n");
  
  try {
    for (const [tipe, url] of Object.entries(URLS)) {
      const lines = await fetchCSV(url);
      
      console.log(`Memproses ${lines.length} data ${tipe}...`);
      writeStream.write(`-- SINKRONISASI ${tipe.toUpperCase()}\n`);
      
      let count = 0;
      for (const line of lines) {
        // Asumsi format CSV: kode,nama
        // Contoh baris: 11,ACEH atau 11.01.01,BAKONGAN
        const parts = line.split(',');
        if (parts.length < 2) continue;
        
        const kode = parts[0];
        // Gabungkan kembali sisa bagian jika nama mengandung koma
        const nama = parts.slice(1).join(',').replace(/'/g, "''"); // escape single quotes untuk SQL

        // Logika UPSERT (Khusus SQLite / Cloudflare D1)
        // Kita asumsikan tabel Anda bernama 'wilayah' dengan kolom 'kode', 'nama', 'tipe'
        const sql = `INSERT INTO wilayah (kode, nama, tipe) VALUES ('${kode}', '${nama}', '${tipe}') ` +
                    `ON CONFLICT(kode) DO UPDATE SET nama = excluded.nama;\n`;
        
        writeStream.write(sql);
        count++;
      }
      
      writeStream.write('\n');
      console.log(`Berhasil memproses ${count} data ${tipe}.\n`);
    }

    writeStream.end();
    console.log(`✅ Selesai! File SQL telah dibuat: ${outputSqlFile}`);
    console.log(`\nCara menjalankan ke database D1 (lokal):`);
    console.log(`npx wrangler d1 execute wilayah-db --local --file=${outputSqlFile}`);
    console.log(`\nCara menjalankan ke database D1 (production):`);
    console.log(`npx wrangler d1 execute wilayah-db --remote --file=${outputSqlFile}`);

  } catch (err) {
    console.error("Terjadi Kesalahan:", err);
  }
}

generateSyncSql();
