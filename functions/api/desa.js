import { getSupabase } from '../_supabase.js';

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const kecamatan = url.searchParams.get("kecamatan");
  
  const trimmed = kecamatan ? kecamatan.trim() : "";
  if (!trimmed || !/^\d{2}\.\d{2}\.\d{2}$/.test(trimmed)) {
    return new Response(JSON.stringify({ error: "Parameter 'kecamatan' tidak valid. Harus berupa kode format xx.xx.xx (contoh: 11.01.01)" }), { status: 400 });
  }

  try {
    const supabase = getSupabase(env);
    const { data, error } = await supabase
      .from('v_desa')
      .select('nama_provinsi, nama_kabupaten, nama_kecamatan, kode, nama, tipe, kodepos')
      .like('kode', `${kecamatan}.%`);

    if (error) throw error;
    return new Response(JSON.stringify(data));
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
