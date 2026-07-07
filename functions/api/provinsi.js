export async function onRequest({ env }) {
  try {
    // Di format Kemendagri, provinsi memiliki panjang kode 2 digit
    const { results } = await env.DB.prepare("SELECT * FROM wilayah WHERE length(kode) = 2").all();
    return new Response(JSON.stringify(results));
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
