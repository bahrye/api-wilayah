export async function onRequest(context) {
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      }
    });
  }
  
  try {
    const response = await context.next();
    
    // Cloudflare response dari KV mungkin immutable (read-only)
    // Jadi kita membuat Response baru agar bisa menyematkan header
    const newResponse = new Response(response.body, response);
    newResponse.headers.set("Access-Control-Allow-Origin", "*");
    newResponse.headers.set("Content-Type", "application/json");
    
    // Mengaktifkan Caching Cloudflare: Browser cache 1 hari, Edge Server cache 7 hari
    // Mengingat data wilayah statis, ini akan membuat respons API menjadi < 50ms!
    if (context.request.method === "GET") {
      newResponse.headers.set("Cache-Control", "public, max-age=86400, s-maxage=604800");
    }
    
    return newResponse;
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      }
    });
  }
}
