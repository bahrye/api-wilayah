import { getSupabase } from '../_supabase.js';

let cachedData = null;
let lastFetched = 0;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

export async function onRequest({ env }) {
  const now = Date.now();
  
  if (cachedData && (now - lastFetched < CACHE_DURATION)) {
    return new Response(JSON.stringify(cachedData), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=86400",
        "X-Cache": "HIT-Isolate"
      }
    });
  }

  try {
    const supabase = getSupabase(env);
    const { data, error } = await supabase
      .from('v_rekapitulasi')
      .select('*');

    if (error) throw error;

    cachedData = data;
    lastFetched = now;

    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=86400",
        "X-Cache": "MISS"
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
