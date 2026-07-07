const fs = require('fs');
const readline = require('readline');

async function processSql() {
  if (!fs.existsSync('wilayah.sql')) {
    console.error("Error: file wilayah.sql tidak ditemukan di folder ini!");
    process.exit(1);
  }

  const fileStream = fs.createReadStream('wilayah.sql');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const provinsi = [];
  const kabupaten = {}; // key: kode_prov
  const kecamatan = {}; // key: kode_kab
  const desa = {}; // key: kode_kec
  const detail = []; // all details

  console.log("Membaca file wilayah.sql...");

  // Regex untuk mencocokkan nilai ('kode', 'nama')
  const regex = /\('([^']+)',\s*'([^']+)'\)/g;

  let count = 0;
  for await (const line of rl) {
    let match;
    while ((match = regex.exec(line)) !== null) {
      const kode = match[1];
      const nama = match[2].trim();
      
      const item = { kode, nama };
      detail.push({ key: `detail:${kode}`, value: JSON.stringify(item) });
      count++;

      const parts = kode.split('.');
      if (parts.length === 1) {
        provinsi.push(item);
      } else if (parts.length === 2) {
        const prov = parts[0];
        if (!kabupaten[prov]) kabupaten[prov] = [];
        kabupaten[prov].push(item);
      } else if (parts.length === 3) {
        const kab = `${parts[0]}.${parts[1]}`;
        if (!kecamatan[kab]) kecamatan[kab] = [];
        kecamatan[kab].push(item);
      } else if (parts.length === 4) {
        const kec = `${parts[0]}.${parts[1]}.${parts[2]}`;
        if (!desa[kec]) desa[kec] = [];
        desa[kec].push(item);
      }
    }
  }

  console.log(`Berhasil mengekstrak ${count} data wilayah.`);
  console.log("Memproses JSON untuk bulk upload (limit 10000 key per file)...");

  // Format array untuk bulk upload KV
  const bulkData = [];
  bulkData.push({ key: 'list:provinsi', value: JSON.stringify(provinsi) });
  
  for (const [prov, kabs] of Object.entries(kabupaten)) {
    bulkData.push({ key: `list:kabupaten:${prov}`, value: JSON.stringify(kabs) });
  }
  for (const [kab, kecs] of Object.entries(kecamatan)) {
    bulkData.push({ key: `list:kecamatan:${kab}`, value: JSON.stringify(kecs) });
  }
  for (const [kec, desas] of Object.entries(desa)) {
    bulkData.push({ key: `list:desa:${kec}`, value: JSON.stringify(desas) });
  }

  const allBulk = [...bulkData, ...detail];
  
  // Batas dari Cloudflare KV adalah 10.000 data per bulk upload
  const chunkSize = 10000;
  let chunkCount = 0;
  
  if (!fs.existsSync('output_kv')) {
    fs.mkdirSync('output_kv');
  }

  for (let i = 0; i < allBulk.length; i += chunkSize) {
    const chunk = allBulk.slice(i, i + chunkSize);
    chunkCount++;
    const filename = `output_kv/kv_bulk_${chunkCount}.json`;
    fs.writeFileSync(filename, JSON.stringify(chunk, null, 2));
    console.log(`Tersimpan: ${filename} (${chunk.length} data)`);
  }
  
  console.log("Selesai! File bulk upload telah dibuat di folder output_kv/");
}

processSql().catch(console.error);
