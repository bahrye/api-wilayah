let cachedData = null;
let lastFetched = 0;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

export async function onRequest({ env }) {
  const now = Date.now();
  
  // If memory cache is valid, return cached data instantly
  if (cachedData && (now - lastFetched < CACHE_DURATION)) {
    return new Response(JSON.stringify(cachedData), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=86400", // Edge/Browser Cache 24 hours
        "X-Cache": "HIT-Isolate"
      }
    });
  }

  try {
    // Highly optimized query: groups w first, then left joins p
    // This reduces rows_read from 3.66 Million to just ~276k per query
    const query = `
      SELECT 
        p.kode as provinsi_kode,
        p.nama as provinsi_nama,
        COALESCE(r.kabupaten, 0) as kabupaten,
        COALESCE(r.kota, 0) as kota,
        COALESCE(r.kecamatan, 0) as kecamatan,
        COALESCE(r.kelurahan, 0) as kelurahan,
        COALESCE(r.desa, 0) as desa
      FROM wilayah p
      LEFT JOIN (
        SELECT 
          substr(kode, 1, 2) as prov_kode,
          SUM(CASE WHEN length(kode) = 5 AND CAST(substr(kode, 4, 2) AS INTEGER) < 70 THEN 1 ELSE 0 END) as kabupaten,
          SUM(CASE WHEN length(kode) = 5 AND CAST(substr(kode, 4, 2) AS INTEGER) >= 70 THEN 1 ELSE 0 END) as kota,
          SUM(CASE WHEN length(kode) = 8 THEN 1 ELSE 0 END) as kecamatan,
          SUM(CASE WHEN length(kode) = 13 AND CAST(substr(kode, 10, 1) AS INTEGER) = 1 THEN 1 ELSE 0 END) as kelurahan,
          SUM(CASE WHEN length(kode) = 13 AND CAST(substr(kode, 10, 1) AS INTEGER) <> 1 THEN 1 ELSE 0 END) as desa
        FROM wilayah
        WHERE length(kode) > 2
        GROUP BY substr(kode, 1, 2)
      ) r ON p.kode = r.prov_kode
      WHERE length(p.kode) = 2
      ORDER BY p.kode
    `;
    
    const { results } = await env.DB.prepare(query).all();
    
    // Save to memory cache
    cachedData = results;
    lastFetched = now;

    return new Response(JSON.stringify(results), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=86400", // Edge/Browser Cache 24 hours
        "X-Cache": "MISS"
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
