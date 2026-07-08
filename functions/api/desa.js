export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const kecamatan = url.searchParams.get("kecamatan");
  
  if (!kecamatan || kecamatan.length !== 8) {
    return new Response(JSON.stringify({ error: "Parameter 'kecamatan' tidak valid. Harus berupa kode 8 karakter (xx.xx.xx)" }), { status: 400 });
  }

  try {
    const query = `
      SELECT 
        p.nama as nama_provinsi,
        kab.nama as nama_kabupaten,
        kec.nama as nama_kecamatan,
        d.kode, d.nama, d.tipe, d.kodepos
      FROM wilayah d
      LEFT JOIN wilayah p ON p.kode = substr(d.kode, 1, 2)
      LEFT JOIN wilayah kab ON kab.kode = substr(d.kode, 1, 5)
      LEFT JOIN wilayah kec ON kec.kode = substr(d.kode, 1, 8)
      WHERE length(d.kode) = 13 AND d.kode LIKE ?
    `;
    const { results } = await env.DB.prepare(query).bind(`${kecamatan}.%`).all();
    
    return new Response(JSON.stringify(results));
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
