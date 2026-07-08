export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const provinsi = url.searchParams.get("provinsi");
  
  if (!provinsi || provinsi.length !== 2) {
    return new Response(JSON.stringify({ error: "Parameter 'provinsi' tidak valid. Harus berupa kode 2 karakter (xx)" }), { status: 400 });
  }

  try {
    // Kabupaten memiliki panjang kode 5 digit (xx.xx) dan berawalan kode provinsi
    const query = "SELECT kode, nama, tipe FROM wilayah WHERE length(kode) = 5 AND kode LIKE ?";
    const { results } = await env.DB.prepare(query).bind(`${provinsi}.%`).all();
    
    return new Response(JSON.stringify(results));
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
