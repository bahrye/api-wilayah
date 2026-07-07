export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const kecamatan = url.searchParams.get("kecamatan");
  
  if (!kecamatan) {
    return new Response(JSON.stringify({ error: "Parameter 'kecamatan' tidak disertakan" }), { status: 400 });
  }

  try {
    // Desa/Kelurahan memiliki panjang kode 13 digit (xx.xx.xx.xxxx) dan berawalan kode kecamatan
    const query = "SELECT * FROM wilayah WHERE length(kode) = 13 AND kode LIKE ?";
    const { results } = await env.DB.prepare(query).bind(`${kecamatan}.%`).all();
    
    return new Response(JSON.stringify(results));
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
