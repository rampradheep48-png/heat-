const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

const CURRENT_FIELDS = 'temperature_2m,apparent_temperature,relative_humidity_2m';

/**
 * Fetches current temperature plus a trailing ~24h hourly trend for a zone.
 * No API key required. This is the reliability backbone of the app — it's
 * what keeps the dashboard alive on stage even if FortyGuard is unavailable.
 *
 * @param {{lat: number, lon: number}} zone
 * @returns {Promise<{ tempNow: number, feelsLike: number, trend: {time: string, temp: number}[] }>}
 */
export async function fetchOpenMeteo({ lat, lon }) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: CURRENT_FIELDS,
    hourly: 'temperature_2m',
    past_days: '1',
    forecast_days: '1',
    timezone: 'auto',
  });

  const res = await fetch(`${BASE_URL}?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Open-Meteo request failed (${res.status})`);
  }
  const json = await res.json();

  const tempNow = json?.current?.temperature_2m;
  if (tempNow === undefined || !(json?.hourly?.time?.length > 0)) {
    throw new Error('Open-Meteo returned an unexpected empty payload');
  }

  return {
    tempNow,
    feelsLike: json?.current?.apparent_temperature,
    humidity: json?.current?.relative_humidity_2m,
    trend: sliceTrailing24h(json),
    source: 'open-meteo',
  };
}

/**
 * past_days=1 + forecast_days=1 returns ~48 hourly points (yesterday + today).
 * Slice the 24 points ending at the current hour for a genuine trailing 24h
 * trend.
 *
 * `current.time` is quarter-hourly (e.g. 05:45) while `hourly.time` is on the
 * hour, so this matches the newest hourly point at or before "now" rather than
 * looking for an exact timestamp match — an exact match would virtually never
 * hit, silently leaving the chart showing yesterday's window.
 */
function sliceTrailing24h(json) {
  const times = json?.hourly?.time ?? [];
  const temps = json?.hourly?.temperature_2m ?? [];
  if (times.length === 0) return [];

  const nowMs = new Date(json?.current?.time ?? times[times.length - 1]).getTime();
  let nowIndex = -1;
  for (let i = 0; i < times.length; i++) {
    if (new Date(times[i]).getTime() <= nowMs) nowIndex = i;
    else break;
  }
  if (nowIndex === -1) nowIndex = Math.max(0, times.length - 25);

  const startIndex = Math.max(0, nowIndex - 23);
  return times.slice(startIndex, nowIndex + 1).map((t, i) => ({
    time: t,
    temp: temps[startIndex + i],
  }));
}

// Open-Meteo accepts comma-separated coordinate lists and answers with one
// result object per location. Chunked so a single failing batch can't take the
// whole map down.
const BULK_CHUNK_SIZE = 20;

/**
 * Fetches readings for many points in as few requests as possible.
 *
 * @param {{id: string, lat: number, lon: number}[]} points
 * @param {{withTrend?: boolean}} [options] - `withTrend` also pulls the trailing
 *   24h hourly series for each point (heavier; used for the district HQs only).
 * @returns {Promise<Record<string, {tempNow: number|null, feelsLike: number|null, humidity: number|null, trend: object[]}>>}
 *   keyed by point id; failed points simply don't appear.
 */
export async function fetchOpenMeteoBulk(points, { withTrend = false } = {}) {
  const chunks = [];
  for (let i = 0; i < points.length; i += BULK_CHUNK_SIZE) {
    chunks.push(points.slice(i, i + BULK_CHUNK_SIZE));
  }

  const results = await Promise.all(
    chunks.map((chunk) => fetchChunk(chunk, withTrend).catch(() => []))
  );

  return Object.fromEntries(results.flat());
}

async function fetchChunk(chunk, withTrend) {
  const params = new URLSearchParams({
    latitude: chunk.map((p) => p.lat).join(','),
    longitude: chunk.map((p) => p.lon).join(','),
    current: CURRENT_FIELDS,
    timezone: 'auto',
  });
  if (withTrend) {
    params.set('hourly', 'temperature_2m');
    params.set('past_days', '1');
    params.set('forecast_days', '1');
  }

  const res = await fetch(`${BASE_URL}?${params.toString()}`);
  if (!res.ok) throw new Error(`Open-Meteo bulk request failed (${res.status})`);

  const json = await res.json();
  // A single-location request returns an object, not an array.
  const entries = Array.isArray(json) ? json : [json];

  return chunk.map((point, i) => {
    const entry = entries[i];
    return [
      point.id,
      {
        tempNow: entry?.current?.temperature_2m ?? null,
        feelsLike: entry?.current?.apparent_temperature ?? null,
        humidity: entry?.current?.relative_humidity_2m ?? null,
        trend: withTrend && entry ? sliceTrailing24h(entry) : [],
      },
    ];
  });
}
