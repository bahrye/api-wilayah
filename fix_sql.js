const fs = require('fs');
const readline = require('readline');

async function fixSql() {
  const fileStream = fs.createReadStream('wilayah.sql');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const out = fs.createWriteStream('wilayah_fixed.sql');
  
  // Buat ulang tabel
  out.write(`DROP TABLE IF EXISTS wilayah;
CREATE TABLE IF NOT EXISTS wilayah (
    kode varchar(13) NOT NULL,
    nama varchar(100) NOT NULL,
    PRIMARY KEY (kode)
);
CREATE INDEX wilayah_name_idx ON wilayah (nama);
`);

  // Ekstrak values
  const regex = /\('([^']+)',\s*'([^']+)'\)/g;
  let values = [];
  let total = 0;

  for await (const line of rl) {
    let match;
    while ((match = regex.exec(line)) !== null) {
      // Escape tanda petik tunggal jika ada di nama wilayah
      const nama = match[2].trim().replace(/'/g, "''");
      values.push(`('${match[1]}', '${nama}')`);
      total++;
    }
    
    // Batch setiap 1000 data agar tidak SQLITE_TOOBIG
    if (values.length >= 1000) {
      out.write(`INSERT INTO wilayah (kode, nama) VALUES \n${values.join(',\n')};\n`);
      values = [];
    }
  }
  
  if (values.length > 0) {
    out.write(`INSERT INTO wilayah (kode, nama) VALUES \n${values.join(',\n')};\n`);
  }
  
  out.end();
  console.log(`Sukses! ${total} data wilayah berhasil diformat ulang menjadi wilayah_fixed.sql dengan batching per 1000 baris.`);
}

fixSql().catch(console.error);
