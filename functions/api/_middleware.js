// Daftar bot scraper dan crawler AI agresif yang dilarang merayapi API
const BLOCKED_BOT_REGEX = /bytespider|gptbot|chatgpt-user|claudebot|petalbot|semrushbot|ahrefsbot|dotbot|mj12bot|ccbot|amazonbot|dataforseobot|seekport/i;

// Rate Limiter Sederhana di Memori Worker (Anti-Spam / Anti-Scraper)
// Membatasi maksimal 60 request / menit per IP (cukup aman untuk user normal & form checkout, memotong habis script scraper loop)
const ipRateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 menit
const MAX_REQUESTS_PER_MINUTE = 60; // 60 request / menit per IP

export async function onRequest(context) {
  const { request } = context;

  // 1. Tangani CORS Preflight (OPTIONS)
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, If-None-Match, Cache-Control",
        "Access-Control-Max-Age": "86400",
      }
    });
  }

  // 2. Blokir Bot AI Scraper Agresif (Menghemat puluhan ribu request/hari)
  const userAgent = request.headers.get("User-Agent") || "";
  if (BLOCKED_BOT_REGEX.test(userAgent)) {
    return new Response(
      JSON.stringify({
        error: "Forbidden: Akses crawler/bot otomatis ke endpoint API dinonaktifkan.",
        source: "robots.txt"
      }),
      {
        status: 403,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=86400"
        }
      }
    );
  }

  // 3. Anti-Abuse Rate Limiting per IP (Maks 60 req/menit untuk memutus script scraper)
  const clientIp = request.headers.get("cf-connecting-ip") || "unknown";
  if (clientIp !== "unknown") {
    const now = Date.now();
    const rateData = ipRateLimitMap.get(clientIp);

    if (!rateData || now > rateData.resetTime) {
      ipRateLimitMap.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    } else {
      rateData.count++;
      if (rateData.count > MAX_REQUESTS_PER_MINUTE) {
        const retryAfter = Math.max(1, Math.ceil((rateData.resetTime - now) / 1000));
        return new Response(
          JSON.stringify({
            error: "Too Many Requests: Batas laju permintaan terlampaui (maksimal 60 request/menit). Harap beri jeda atau cache data secara lokal.",
            retryAfterSeconds: retryAfter
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Retry-After": retryAfter.toString()
            }
          }
        );
      }
    }

    // Bersihkan memori secara berkala
    if (ipRateLimitMap.size > 2000) {
      for (const [ip, data] of ipRateLimitMap.entries()) {
        if (now > data.resetTime) ipRateLimitMap.delete(ip);
      }
    }
  }

  // 4. Hanya proses caching pada metode GET
  if (request.method !== "GET") {
    return await context.next();
  }

  const cache = caches.default;
  const cacheKey = new Request(request.url, { method: "GET" });
  const clientEtag = request.headers.get("If-None-Match");

  // 4. Periksa apakah respon sudah tersimpan di Edge Cache Cloudflare
  try {
    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
      const etag = cachedResponse.headers.get("ETag");

      // Validasi HTTP 304 Not Modified
      if (clientEtag && etag && clientEtag === etag) {
        return new Response(null, {
          status: 304,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": cachedResponse.headers.get("Cache-Control") || "public, max-age=86400, s-maxage=604800",
            "ETag": etag,
            "X-Cache": "HIT-Edge-304"
          }
        });
      }

      // Kembalikan langsung dari Edge Cache (0 query Supabase, latensi < 5ms)
      const hitResponse = new Response(cachedResponse.body, cachedResponse);
      hitResponse.headers.set("Access-Control-Allow-Origin", "*");
      hitResponse.headers.set("X-Cache", "HIT-Edge");
      return hitResponse;
    }
  } catch (cacheErr) {
    // Abaikan kegagalan cache dan lanjutkan ke origin
  }

  // 5. Jika tidak ada di Edge Cache, eksekusi handler API (Supabase)
  try {
    const response = await context.next();

    // Jika respon bukan status 200 (misal 400 atau 404), kembalikan langsung dengan CORS
    if (response.status !== 200) {
      const errResponse = new Response(response.body, response);
      errResponse.headers.set("Access-Control-Allow-Origin", "*");
      errResponse.headers.set("Content-Type", "application/json");
      return errResponse;
    }

    const responseBody = await response.text();

    // 6. Hitung ETag berbasis hash SHA-256 dari body respon
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(responseBody)
    );
    const hashHex = Array.from(new Uint8Array(hashBuffer))
      .slice(0, 8)
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
    const etag = `W/"${hashHex}"`;

    // 7. Jika klien mengirim If-None-Match yang cocok dengan ETag baru
    if (clientEtag && clientEtag === etag) {
      return new Response(null, {
        status: 304,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
          "ETag": etag,
          "X-Cache": "MISS-304"
        }
      });
    }

    // 8. Buat Respon untuk Klien & Simpan ke Edge Cache
    const headers = new Headers(response.headers);
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Content-Type", "application/json");
    headers.set("Cache-Control", "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400");
    headers.set("ETag", etag);
    headers.set("X-Cache", "MISS");

    const clientResponse = new Response(responseBody, {
      status: 200,
      headers: headers
    });

    // Simpan ke Edge Cache secara asynchronous tanpa menunda respon klien
    try {
      const cacheResponse = clientResponse.clone();
      context.waitUntil(cache.put(cacheKey, cacheResponse));
    } catch (putErr) {
      // Abaikan jika put cache gagal
    }

    return clientResponse;
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

