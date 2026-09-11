import { getSupabase } from '../_supabase.js';

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
    const supabase = getSupabase(env);
    const { data, error } = await supabase
      .from('v_detail')
      .select('*')
      .eq('kodepos', kodepos);

    if (error) throw error;

    if (!data || data.length === 0) {
      return new Response(JSON.stringify({ error: "Data wilayah dengan kode pos tersebut tidak ditemukan" }), { 
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    const cleanedResults = data.map(row => {
      const item = { ...row };
      Object.keys(item).forEach(key => {
        if (item[key] === null) {
          delete item[key];
        }
      });
      return item;
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
