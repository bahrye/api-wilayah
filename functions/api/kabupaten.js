export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const provinsi = url.searchParams.get("provinsi");
  
  if (!provinsi || provinsi.length !== 2) {
    return new Response(JSON.stringify({ error: "Parameter 'provinsi' tidak valid. Harus berupa kode 2 karakter (xx)" }), { status: 400 });
  }

  try {
    const query = `
      SELECT 
        p.nama as nama_provinsi,
        k.kode, k.nama, k.tipe
      FROM wilayah k
      LEFT JOIN wilayah p ON p.kode = substr(k.kode, 1, 2)
      WHERE length(k.kode) = 5 AND k.kode LIKE ?
    `;
    const { results } = await env.DB.prepare(query).bind(`${provinsi}.%`).all();
    
    return new Response(JSON.stringify(results));
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
