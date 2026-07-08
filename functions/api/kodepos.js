export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const kodepos = url.searchParams.get("kodepos");
  
  if (!kodepos) {
    return new Response(JSON.stringify({ error: "Parameter 'kodepos' tidak disertakan" }), { 
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
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
      WHERE w.kodepos = ?
    `;
    const { results } = await env.DB.prepare(query).bind(kodepos).all();
    
    if (results.length === 0) {
      return new Response(JSON.stringify({ error: "Data wilayah dengan kode pos tersebut tidak ditemukan" }), { 
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    const cleanedResults = results.map(data => {
      Object.keys(data).forEach(key => {
        if (data[key] === null) {
          delete data[key];
        }
      });
      return data;
    });

    return new Response(JSON.stringify(cleanedResults), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
