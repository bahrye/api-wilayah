export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const provinsi = url.searchParams.get("provinsi");
  
  if (!provinsi) {
    return new Response(JSON.stringify({ error: "Parameter 'provinsi' tidak disertakan" }), { status: 400 });
  }

  try {
    // Kabupaten memiliki panjang kode 5 digit (xx.xx) dan berawalan kode provinsi
    const query = "SELECT * FROM wilayah WHERE length(kode) = 5 AND kode LIKE ?";
    const { results } = await env.DB.prepare(query).bind(`${provinsi}.%`).all();
    
    return new Response(JSON.stringify(results));
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
