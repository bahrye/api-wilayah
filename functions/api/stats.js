export async function onRequest({ env }) {
  try {
    const query = "SELECT length(kode) as len, count(*) as count FROM wilayah GROUP BY length(kode)";
    const { results } = await env.DB.prepare(query).all();
    
    // Mapping format:
    // length 2  => provinsi
    // length 5  => kabupaten
    // length 8  => kecamatan
    // length 13 => desa
    const mapping = {
      2: 'provinsi',
      5: 'kabupaten',
      8: 'kecamatan',
      13: 'desa'
    };
    
    const stats = {
      provinsi: 0,
      kabupaten: 0,
      kecamatan: 0,
      desa: 0
    };
    
    for (const row of results) {
      if (mapping[row.len]) {
        stats[mapping[row.len]] = row.count;
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
