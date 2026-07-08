export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const kode = url.searchParams.get("kode");
  
  if (!kode) {
    return new Response(JSON.stringify({ error: "Parameter 'kode' tidak disertakan" }), { status: 400 });
  }

  try {
    const { results } = await env.DB.prepare("SELECT * FROM wilayah WHERE kode = ?").bind(kode).all();
    
    if (results.length === 0) {
      return new Response(JSON.stringify({ error: "Detail wilayah tidak ditemukan" }), { status: 404 });
    }

    const data = results[0];
    if (data.tipe !== 'DESA' && data.tipe !== 'KELURAHAN') {
      delete data.kodepos;
    }

    return new Response(JSON.stringify(data));
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
