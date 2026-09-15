const fs = require('fs');
const readline = require('readline');
const path = require('path');

async function buildAllStaticData() {
  console.log('=== MEMULAI GENERATE DATA STATIS LENGKAP WILAYAH & KODEPOS ===');
  console.time('Total Waktu');

  const baseDir = path.join(__dirname, 'public', 'data');
  const kabDir = path.join(baseDir, 'kabupaten');
  const kecDir = path.join(baseDir, 'kecamatan');
  const desaDir = path.join(baseDir, 'desa');
  const kodeposDir = path.join(baseDir, 'kodepos');

  [baseDir, kabDir, kecDir, desaDir, kodeposDir].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  const sqlFile = path.join(__dirname, 'seed_wilayah.sql');
  if (!fs.existsSync(sqlFile)) {
    throw new Error(`File ${sqlFile} tidak ditemukan!`);
  }

  const rl = readline.createInterface({
    input: fs.createReadStream(sqlFile),
    crlfDelay: Infinity
  });

  const regex = /\('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*(NULL|'[^']+')\)/;

  const provinsiList = [];
  const allKabupaten = [];
  const kabByProv = new Map();   // provKode -> [] (38 files)
  const kecByProv = new Map();   // provKode -> [] (38 files)
  const desaByKab = new Map();   // kabKode -> []  (514 files, compact & ultra-fast)
  const kodeposMap = new Map();  // prefix3 -> { 'kodepos': [ { desa, kec, kab, prov } ] } (471 files)

  // Indexing nama wilayah untuk melengkapi nama di data kodepos
  const namaMap = new Map(); // kode -> nama

  console.log('1. Membaca & memetakan data dari seed_wilayah.sql...');
  for await (const line of rl) {
    const m = line.match(regex);
    if (!m) continue;
    const kode = m[1];
    const nama = m[2];
    const tipe = m[3];
    const kodepos = m[4] === 'NULL' ? null : m[4].replace(/'/g, '');

    namaMap.set(kode, nama);

    if (kode.length === 2) {
      provinsiList.push({ kode, nama, tipe });
    } else if (kode.length === 5) {
      const provKode = kode.slice(0, 2);
      const item = { kode, nama, tipe, provinsi_kode: provKode };
      allKabupaten.push(item);
      if (!kabByProv.has(provKode)) kabByProv.set(provKode, []);
      kabByProv.get(provKode).push(item);
    } else if (kode.length === 8) {
      const provKode = kode.slice(0, 2);
      const kabKode = kode.slice(0, 5);
      const item = { kode, nama, tipe, kabupaten_kode: kabKode };
      if (!kecByProv.has(provKode)) kecByProv.set(provKode, []);
      kecByProv.get(provKode).push(item);
    } else if (kode.length === 13) {
      const provKode = kode.slice(0, 2);
      const kabKode = kode.slice(0, 5);
      const item = {
        kode,
        nama,
        tipe,
        kecamatan_kode: kode.slice(0, 8),
        kodepos
      };
      if (!desaByKab.has(kabKode)) desaByKab.set(kabKode, []);
      desaByKab.get(kabKode).push(item);

      if (kodepos && /^\d{5}$/.test(kodepos)) {
        const prefix3 = kodepos.slice(0, 3);
        if (!kodeposMap.has(prefix3)) kodeposMap.set(prefix3, {});
        const group = kodeposMap.get(prefix3);
        if (!group[kodepos]) group[kodepos] = [];
        group[kodepos].push({
          kode,
          nama,
          tipe,
          kec: kode.slice(0, 8),
          kab: kabKode,
          prov: provKode
        });
      }
    }
  }

  // Lengkapi data kodepos dengan nama hierarki
  console.log('2. Melengkapi nama relasi untuk data kodepos...');
  for (const [prefix3, group] of kodeposMap.entries()) {
    for (const [pos, items] of Object.entries(group)) {
      items.forEach(it => {
        it.nama_kecamatan = namaMap.get(it.kec) || '';
        it.nama_kabupaten = namaMap.get(it.kab) || '';
        it.nama_provinsi = namaMap.get(it.prov) || '';
        delete it.kec;
        delete it.kab;
        delete it.prov;
      });
    }
  }

  console.log('3. Menulis berkas JSON statis...');
  // 1. Provinsi
  fs.writeFileSync(path.join(baseDir, 'provinsi.json'), JSON.stringify(provinsiList));

  // 2. Kabupaten (Semua & Per Provinsi)
  fs.writeFileSync(path.join(baseDir, 'kabupaten.json'), JSON.stringify(allKabupaten));
  for (const [prov, items] of kabByProv.entries()) {
    fs.writeFileSync(path.join(kabDir, prov + '.json'), JSON.stringify(items));
  }

  // 3. Kecamatan (Per Provinsi)
  for (const [prov, items] of kecByProv.entries()) {
    fs.writeFileSync(path.join(kecDir, prov + '.json'), JSON.stringify(items));
  }

  // 4. Desa (Per Kabupaten - Ringan & Cepat, maks ~88KB)
  for (const [kab, items] of desaByKab.entries()) {
    fs.writeFileSync(path.join(desaDir, kab + '.json'), JSON.stringify(items));
  }

  // 5. Kodepos (Per 3 Digit Awalan - Ringan & Cepat, maks ~25KB)
  for (const [prefix3, group] of kodeposMap.entries()) {
    fs.writeFileSync(path.join(kodeposDir, prefix3 + '.json'), JSON.stringify(group));
  }

  console.timeEnd('Total Waktu');
  console.log('Berhasil membuat seluruh data statis:');
  console.log('- 1 file provinsi.json (38 provinsi)');
  console.log('- 1 file kabupaten.json (514 kabupaten/kota)');
  console.log('- ' + kabByProv.size + ' file kabupaten/*.json (per provinsi)');
  console.log('- ' + kecByProv.size + ' file kecamatan/*.json (per provinsi)');
  console.log('- ' + desaByKab.size + ' file desa/*.json (per kabupaten)');
  console.log('- ' + kodeposMap.size + ' file kodepos/*.json (per 3 digit awalan kodepos)');
  console.log('Total file statis: ' + (2 + kabByProv.size + kecByProv.size + desaByKab.size + kodeposMap.size));
}

buildAllStaticData().catch(err => {
  console.error('Terjadi kesalahan:', err);
  process.exit(1);
});
