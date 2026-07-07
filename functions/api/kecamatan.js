export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const kabupaten = url.searchParams.get("kabupaten");
  
  if (!kabupaten) {
    return new Response(JSON.stringify({ error: "Parameter 'kabupaten' tidak disertakan" }), { status: 400 });
  }

  try {
    // Kecamatan memiliki panjang kode 8 digit (xx.xx.xx) dan berawalan kode kabupaten
    const query = "SELECT * FROM wilayah WHERE length(kode) = 8 AND kode LIKE ?";
    const { results } = await env.DB.prepare(query).bind(`${kabupaten}.%`).all();
    
    return new Response(JSON.stringify(results));
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
