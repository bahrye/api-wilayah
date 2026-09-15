import { getSupabase } from '../_supabase.js';

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const kode = url.searchParams.get("kode");
  
  const trimmedKode = kode ? kode.trim() : "";
  if (!trimmedKode || !/^\d{2}(\.\d{2}){0,2}(\.\d{4})?$/.test(trimmedKode)) {
    return new Response(JSON.stringify({ error: "Parameter 'kode' tidak valid. Format harus xx, xx.xx, xx.xx.xx, atau xx.xx.xx.xxxx (contoh: 11.01.01.2001)" }), { status: 400 });
  }

  try {
    const supabase = getSupabase(env);
    const { data, error } = await supabase
      .from('v_detail')
      .select('*')
      .eq('kode', kode)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return new Response(JSON.stringify({ error: "Detail wilayah tidak ditemukan" }), { status: 404 });
    }

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
