import { getSupabase } from '../_supabase.js';

export async function onRequest({ env }) {
  try {
    const supabase = getSupabase(env);
    const { data, error } = await supabase
      .from('v_provinsi')
      .select('kode, nama, tipe');

    if (error) throw error;
    return new Response(JSON.stringify(data));
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
