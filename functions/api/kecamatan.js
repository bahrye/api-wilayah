export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const kabupaten = url.searchParams.get("kabupaten");
  
  if (!kabupaten || kabupaten.length !== 5) {
    return new Response(JSON.stringify({ error: "Parameter 'kabupaten' tidak valid. Harus berupa kode 5 karakter (xx.xx)" }), { status: 400 });
  }

  try {
    const query = `
      SELECT 
        p.nama as nama_provinsi,
        kab.nama as nama_kabupaten,
        k.kode, k.nama, k.tipe
      FROM wilayah k
      LEFT JOIN wilayah p ON p.kode = substr(k.kode, 1, 2)
      LEFT JOIN wilayah kab ON kab.kode = substr(k.kode, 1, 5)
      WHERE length(k.kode) = 8 AND k.kode LIKE ?
    `;
    const { results } = await env.DB.prepare(query).bind(`${kabupaten}.%`).all();
    
    return new Response(JSON.stringify(results));
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
