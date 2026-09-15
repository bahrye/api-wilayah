import { getSupabase } from '../_supabase.js';

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const kabupaten = url.searchParams.get("kabupaten");
  
  const trimmed = kabupaten ? kabupaten.trim() : "";
  if (!trimmed || !/^\d{2}\.\d{2}$/.test(trimmed)) {
    return new Response(JSON.stringify({ error: "Parameter 'kabupaten' tidak valid. Harus berupa kode format xx.xx (contoh: 11.01)" }), { status: 400 });
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
