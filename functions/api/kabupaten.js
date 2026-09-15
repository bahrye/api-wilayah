import { getSupabase } from '../_supabase.js';

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const provinsi = url.searchParams.get("provinsi");
  
  const trimmed = provinsi ? provinsi.trim() : "";
  if (!trimmed || !/^\d{2}$/.test(trimmed)) {
    return new Response(JSON.stringify({ error: "Parameter 'provinsi' tidak valid. Harus berupa kode 2 digit angka (contoh: 11)" }), { status: 400 });
  }

  try {
    const supabase = getSupabase(env);
    const { data, error } = await supabase
      .from('v_kabupaten')
      .select('nama_provinsi, kode, nama, tipe')
      .like('kode', `${provinsi}.%`);

    if (error) throw error;
    return new Response(JSON.stringify(data));
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
