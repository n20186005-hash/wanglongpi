import type { APIRoute } from 'astro';

// 望龍埤即時天氣：由本站伺服器端（Cloudflare Worker）向氣象來源取得並快取，
// 前端只向本路由要資料，不直接接觸上游來源。
const LAT = 24.7766;
const LON = 121.6990972;
const TTL_MS = 30 * 60 * 1000;

let cache: { ts: number; payload: unknown } | null = null;

export const prerender = false;

const CACHE_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'public, max-age=1800, s-maxage=1800, stale-while-revalidate=3600'
};

export const GET: APIRoute = async () => {
  const now = Date.now();
  if (cache && now - cache.ts < TTL_MS) {
    return new Response(JSON.stringify(cache.payload), { headers: CACHE_HEADERS });
  }

  const upstream =
    `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,uv_index_max` +
    `&timezone=Asia%2FTaipei&forecast_days=7`;

  try {
    const res = await fetch(
      upstream,
      { cf: { cacheTtl: 1800, cacheEverything: true } } as RequestInit & { cf?: Record<string, unknown> }
    );
    if (!res.ok) throw new Error('upstream ' + res.status);
    const payload = await res.json();
    cache = { ts: now, payload };
    return new Response(JSON.stringify(payload), { headers: CACHE_HEADERS });
  } catch {
    if (cache) return new Response(JSON.stringify(cache.payload), { headers: CACHE_HEADERS });
    return new Response(JSON.stringify({ error: 'weather_unavailable' }), {
      status: 503,
      headers: { 'content-type': 'application/json; charset=utf-8' }
    });
  }
};
