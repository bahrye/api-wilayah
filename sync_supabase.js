require('dotenv').config();
const fs = require('fs');
const readline = require('readline');
const { createClient } = require('@supabase/supabase-js');

// URL Repositori data wilayah & kodepos
const URL_WILAYAH = 'https://raw.githubusercontent.com/cahyadsn/wilayah/master/db/wilayah.sql';
const URL_KODEPOS = 'https://raw.githubusercontent.com/cahyadsn/wilayah_kodepos/main/db/wilayah_kodepos.sql';

function getTipe(kode) {
  if (kode.length === 2) return 'PROVINSI';
  if (kode.length === 5) {
    const num = parseInt(kode.slice(3, 5), 10);
    return num >= 70 ? 'KOTA' : 'KABUPATEN';
  }
  if (kode.length === 8) return 'KECAMATAN';
  if (kode.length === 13) {
    const digit = kode.charAt(9);
    return digit === '1' ? 'KELURAHAN' : 'DESA';
  }
  return 'UNKNOWN';
}

async function fetchLines(url) {
  console.log(`Mengunduh data dari ${url}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Gagal fetch ${url}: ${res.statusText}`);
  const text = await res.text();
  return text.split('\n');
}

async function main() {
  const args = process.argv.slice(2);
  const isDirect = args.includes('--direct');
  const isSqlOnly = args.includes('--sql');

  console.log("=== SINKRONISASI DATA WILAYAH KE SUPABASE ===");

  // 1. Download data wilayah
  const wilayahLines = await fetchLines(URL_WILAYAH);
  console.log(`Berhasil mengunduh ${wilayahLines.length} baris data wilayah.`);

  // 2. Download data kodepos
  const kodeposLines = await fetchLines(URL_KODEPOS);
  console.log(`Berhasil mengunduh ${kodeposLines.length} baris data kodepos.`);

  // In-memory map untuk kodepos
  const kodeposMap = new Map();
  const regexKodepos = /\('([^']+)',\s*'([^']+)'\)/;
  for (const line of kodeposLines) {
    const match = line.match(regexKodepos);
    if (match) {
      kodeposMap.set(match[1], match[2]);
    }
  }
  console.log(`Terpetakan ${kodeposMap.size} data kodepos.`);

  // Parsing & penggabungan data wilayah
  const records = [];
  const regexWilayah = /\('([^']+)',\s*'([^']+)'\)/;
  for (const line of wilayahLines) {
    const match = line.match(regexWilayah);
    if (match) {
      const kode = match[1];
      const nama = match[2].trim();
      const tipe = getTipe(kode);
      const kodepos = kodeposMap.get(kode) || null;
      records.push({ kode, nama, tipe, kodepos });
    }
  }
  console.log(`Total ${records.length} data wilayah siap disinkronisasi.`);

  // Generate seed_wilayah.sql jika mode --sql atau default
  console.log("Membuat file SQL 'seed_wilayah.sql'...");
  const sqlStream = fs.createWriteStream('seed_wilayah.sql');
  sqlStream.write("-- SEED DATA WILAYAH INDONESIA UNTUK SUPABASE\n");
  sqlStream.write("-- Target Schema: wilayah\n\n");
  sqlStream.write("SET search_path TO wilayah, public;\n\n");

  const BATCH_SQL_SIZE = 1000;
  for (let i = 0; i < records.length; i += BATCH_SQL_SIZE) {
    const chunk = records.slice(i, i + BATCH_SQL_SIZE);
    const values = chunk.map(r => {
      const safeNama = r.nama.replace(/'/g, "''");
      const safeKodepos = r.kodepos ? `'${r.kodepos}'` : 'NULL';
      return `('${r.kode}', '${safeNama}', '${r.tipe}', ${safeKodepos})`;
    }).join(',\n  ');

    sqlStream.write(
      `INSERT INTO wilayah.wilayah (kode, nama, tipe, kodepos) VALUES\n  ${values}\n` +
      `ON CONFLICT (kode) DO UPDATE SET nama = EXCLUDED.nama, tipe = EXCLUDED.tipe, kodepos = EXCLUDED.kodepos;\n\n`
    );
  }
  sqlStream.end();
  console.log("✅ File 'seed_wilayah.sql' berhasil dibuat!");

  // Jika opsi --direct dijalankan
  if (isDirect) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Error: SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY harus terisi di file .env untuk opsi --direct");
      return;
    }

    console.log("\nMemulai upload langsung ke Supabase (schema 'wilayah')...");
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      db: { schema: 'wilayah' },
      auth: { persistSession: false }
    });

    const BATCH_SIZE = 1000;
    let successCount = 0;
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const chunk = records.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from('wilayah').upsert(chunk, { onConflict: 'kode' });
      if (error) {
        console.error(`Gagal batch ${i} - ${i + chunk.length}:`, error.message);
        console.log("Tips: Pastikan 'supabase/schema.sql' sudah dijalankan di Supabase SQL Editor dan 'wilayah' telah ditambahkan ke Exposed Schemas!");
        return;
      }
      successCount += chunk.length;
      process.stdout.write(`\rProgress: ${successCount} / ${records.length} (${Math.round((successCount/records.length)*100)}%)`);
    }
    console.log("\n✅ Semua data wilayah berhasil diupload ke Supabase!");
  }
}

main().catch(err => {
  console.error("Terjadi error:", err);
});
