import { getSupabase } from '../_supabase.js';

export async function onRequest({ env }) {
  try {
    const supabase = getSupabase(env);
    const { data, error } = await supabase
      .from('v_stats')
      .select('len, tipe, count');

    if (error) throw error;

    const stats = {
      provinsi: 0,
      kab_kota: 0,
      kab_kota_split: {
        KABUPATEN: 0,
        KOTA: 0
      },
      kecamatan: 0,
      desa_kel: 0,
      desa_kel_split: {
        DESA: 0,
        KELURAHAN: 0
      }
    };

    for (const row of data || []) {
      const len = Number(row.len);
      const count = Number(row.count);
      const tipe = (row.tipe || '').toUpperCase();

      if (len === 2) {
        stats.provinsi += count;
      } else if (len === 5) {
        stats.kab_kota += count;
        if (tipe && stats.kab_kota_split[tipe] !== undefined) {
          stats.kab_kota_split[tipe] += count;
        }
      } else if (len === 8) {
        stats.kecamatan += count;
      } else if (len === 13) {
        stats.desa_kel += count;
        if (tipe && stats.desa_kel_split[tipe] !== undefined) {
          stats.desa_kel_split[tipe] += count;
        }
      }
    }

    return new Response(JSON.stringify(stats), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400"
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
