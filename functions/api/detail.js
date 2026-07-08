export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const kode = url.searchParams.get("kode");
  
  if (!kode) {
    return new Response(JSON.stringify({ error: "Parameter 'kode' tidak disertakan" }), { status: 400 });
  }

  try {
    const query = `
      SELECT 
        p.nama as nama_provinsi,
        kab.nama as nama_kabupaten,
        kec.nama as nama_kecamatan,
        w.kode, w.nama, w.tipe, w.kodepos
      FROM wilayah w
      LEFT JOIN wilayah p ON p.kode = substr(w.kode, 1, 2) AND length(w.kode) > 2
      LEFT JOIN wilayah kab ON kab.kode = substr(w.kode, 1, 5) AND length(w.kode) > 5
      LEFT JOIN wilayah kec ON kec.kode = substr(w.kode, 1, 8) AND length(w.kode) > 8
      WHERE w.kode = ?
    `;
    const { results } = await env.DB.prepare(query).bind(kode).all();
    
    if (results.length === 0) {
      return new Response(JSON.stringify({ error: "Detail wilayah tidak ditemukan" }), { status: 404 });
    }

    const data = results[0];
    if (data.tipe !== 'DESA' && data.tipe !== 'KELURAHAN') {
      delete data.kodepos;
    }

    Object.keys(data).forEach(key => {
      if (data[key] === null) {
        delete data[key];
      }
    });

    return new Response(JSON.stringify(data));
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
