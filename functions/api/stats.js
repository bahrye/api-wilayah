export async function onRequest({ env }) {
  try {
    const query = "SELECT length(kode) as len, tipe, count(*) as count FROM wilayah GROUP BY length(kode), tipe";
    const { results } = await env.DB.prepare(query).all();
    
    const stats = {
      provinsi: 0,
      kab_kota: 0,
      kab_kota_split: {
        KABUPATEN: 0,
        KOTA: 0
      },
      kecamatan: 0,
      desa_kel: 0,
      desa_kel_split: {
        DESA: 0,
        KELURAHAN: 0,
        'DESA ADAT': 0
      }
    };
    
    for (const row of results) {
      if (row.len === 2) {
        stats.provinsi += row.count;
      } else if (row.len === 5) {
        stats.kab_kota += row.count;
        if (row.tipe) stats.kab_kota_split[row.tipe] = row.count;
      } else if (row.len === 8) {
        stats.kecamatan += row.count;
      } else if (row.len === 13) {
        stats.desa_kel += row.count;
        if (row.tipe) stats.desa_kel_split[row.tipe] = row.count;
      }
    }
    
    return new Response(JSON.stringify(stats), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
