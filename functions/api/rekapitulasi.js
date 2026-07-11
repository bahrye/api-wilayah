export async function onRequest({ env }) {
  try {
    const query = `
      SELECT 
        p.kode as provinsi_kode,
        p.nama as provinsi_nama,
        SUM(CASE WHEN length(w.kode) = 5 AND CAST(substr(w.kode, 4, 2) AS INTEGER) < 70 THEN 1 ELSE 0 END) as kabupaten,
        SUM(CASE WHEN length(w.kode) = 5 AND CAST(substr(w.kode, 4, 2) AS INTEGER) >= 70 THEN 1 ELSE 0 END) as kota,
        SUM(CASE WHEN length(w.kode) = 8 THEN 1 ELSE 0 END) as kecamatan,
        SUM(CASE WHEN length(w.kode) = 13 AND CAST(substr(w.kode, 10, 1) AS INTEGER) = 1 THEN 1 ELSE 0 END) as kelurahan,
        SUM(CASE WHEN length(w.kode) = 13 AND CAST(substr(w.kode, 10, 1) AS INTEGER) <> 1 THEN 1 ELSE 0 END) as desa
      FROM wilayah p
      LEFT JOIN wilayah w ON substr(w.kode, 1, 2) = p.kode AND length(w.kode) > 2
      WHERE length(p.kode) = 2
      GROUP BY p.kode, p.nama
      ORDER BY p.kode
    `;
    const { results } = await env.DB.prepare(query).all();
    return new Response(JSON.stringify(results), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
