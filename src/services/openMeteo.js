const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

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
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m',
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
  const feelsLike = json?.current?.apparent_temperature;
  const humidity = json?.current?.relative_humidity_2m;

  const times = json?.hourly?.time ?? [];
  const temps = json?.hourly?.temperature_2m ?? [];

  if (tempNow === undefined || times.length === 0) {
    throw new Error('Open-Meteo returned an unexpected empty payload');
  }

  // past_days=1 + forecast_days=1 returns ~48 hourly points (yesterday +
  // today). Slice the 24 points ending at the current hour for a genuine
  // trailing 24h trend.
  const now = new Date(json.current.time);
  let nowIndex = times.findIndex((t) => new Date(t).getTime() === now.getTime());
  if (nowIndex === -1) nowIndex = Math.max(0, times.length - 25);

  const startIndex = Math.max(0, nowIndex - 23);
  const trend = times.slice(startIndex, nowIndex + 1).map((t, i) => ({
    time: t,
    temp: temps[startIndex + i],
  }));

  return {
    tempNow,
    feelsLike,
    humidity,
    trend,
    source: 'open-meteo',
  };
}
