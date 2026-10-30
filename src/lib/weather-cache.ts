// Per-isolate caching with explicit age limits. The provider supplies model data, not alerts.
export function createWeatherService(fetcher: typeof fetch = fetch, clock: () => number = Date.now) {
  const FRESH_MS=15*60*1000, MAX_STALE_MS=60*60*1000, MODEL_MAX_AGE_MS=2*60*60*1000;
  let cache: {ts:number; payload: Record<string, any>} | null = null;
  const upstream='https://api.open-meteo.com/v1/forecast?latitude=24.7766&longitude=121.6990972&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,uv_index_max&timezone=Asia%2FTaipei&forecast_days=7';
  function modelIsRecent(payload: Record<string,any>, now:number) {
    const time=payload.current?.time;
    if(typeof time!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(time))return false;
    const ts=Date.parse(time+'+08:00');return Number.isFinite(ts)&&now-ts<=MODEL_MAX_AGE_MS&&ts-now<=60*60*1000;
  }
  function validate(payload: Record<string,any>, now:number) {
    const currentKeys=['temperature_2m','apparent_temperature','relative_humidity_2m','weather_code','wind_speed_10m'];
    const dailyKeys=['weather_code','temperature_2m_max','temperature_2m_min','precipitation_probability_max','wind_speed_10m_max','uv_index_max'];
    if(!payload || payload.timezone!=='Asia/Taipei'||!modelIsRecent(payload,now))throw new Error('Invalid model time');
    if(!currentKeys.every(k=>typeof payload.current[k]==='number'&&Number.isFinite(payload.current[k])))throw new Error('Invalid current');
    const dates=payload.daily?.time;
    if(!Array.isArray(dates)||dates.length<1||dates.length>7||!dates.every((d:unknown)=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)))throw new Error('Invalid dates');
    if(!dailyKeys.every(k=>Array.isArray(payload.daily[k])&&payload.daily[k].length===dates.length&&payload.daily[k].every((n:unknown)=>typeof n==='number'&&Number.isFinite(n))))throw new Error('Invalid daily');
    return payload;
  }
  function response(entry:NonNullable<typeof cache>, stale:boolean, now:number) {
    const body={...entry.payload,guide:{source:'Open-Meteo',fetchedAt:new Date(entry.ts).toISOString(),ageSeconds:Math.max(0,Math.floor((now-entry.ts)/1000)),stale,timezone:'Asia/Taipei'}};
    return new Response(JSON.stringify(body),{headers:{'content-type':'application/json; charset=utf-8','cache-control':stale?'no-store':'public, max-age=300, s-maxage=900','X-Weather-State':stale?'stale':'fresh'}});
  }
  return async function getWeather() {
    let now=clock();
    if(cache&&now-cache.ts>=0&&now-cache.ts<FRESH_MS&&modelIsRecent(cache.payload,now))return response(cache,false,now);
    try {
      const res=await fetcher(upstream,{signal:AbortSignal.timeout(10000),cf:{cacheTtl:900,cacheEverything:true}} as RequestInit & {cf:Record<string,unknown>});
      if(!res.ok)throw new Error('Upstream failure');
      now=clock();const payload=validate(await res.json() as Record<string,any>,now);
      cache={ts:now,payload};return response(cache,false,now);
    } catch {
      now=clock();
      if(cache&&now-cache.ts>=0&&now-cache.ts<=MAX_STALE_MS&&modelIsRecent(cache.payload,now))return response(cache,true,now);
      cache=null;
      return new Response(JSON.stringify({error:'weather_unavailable'}),{status:503,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
    }
  };
}
