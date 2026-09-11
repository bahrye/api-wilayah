import { getSupabase } from '../_supabase.js';

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const kabupaten = url.searchParams.get("kabupaten");
  
  if (!kabupaten || kabupaten.length !== 5) {
    return new Response(JSON.stringify({ error: "Parameter 'kabupaten' tidak valid. Harus berupa kode 5 karakter (xx.xx)" }), { status: 400 });
  }

  try {
    const supabase = getSupabase(env);
    const { data, error } = await supabase
      .from('v_kecamatan')
      .select('nama_provinsi, nama_kabupaten, kode, nama, tipe')
      .like('kode', `${kabupaten}.%`);

    if (error) throw error;
    return new Response(JSON.stringify(data));
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
