/**
 * FortyGuard Temperature API client.
 *
 * ⚠️ READ THIS BEFORE TRUSTING IT ON STAGE ⚠️
 * ---------------------------------------------------------------------------
 * CONFIRMED (from FortyGuard's public site, fortyguard.com/products):
 *   - POST https://api.fortyguard.com/v1/heatmap
 *   - Header: `api-key: <your key>`
 *   - Body:   { polygon_aoi, date_time: { start_date, start_time, filter_type }, granularity }
 *   - Response: { data: { activity_id: "..." } }  → this call IS async, confirming
 *     the brief: you get a job id back, not the reading itself.
 *
 * NOT CONFIRMED (the full reference lives behind FortyGuard's hackathon
 * developer portal at docs-api.fortyguard.com, which needs a signed-in
 * session to render — it wasn't reachable from here):
 *   - The exact result-polling endpoint/method
 *   - The exact shape of the completed result payload
 *   - What `filter_type` and `granularity` values actually mean
 *
 * This file makes a best-effort, clearly-labelled guess at the polling
 * endpoint (`GET /v1/heatmap/:activityId`) and defensively parses a few
 * plausible response shapes for the result. If your real dashboard docs show
 * something different, update `POLL_PATH` and `parseResult()` below — the
 * rest of the app doesn't care, because everything downstream of
 * `fetchFortyGuardHeatmap()` just consumes `{ tempNow, trend }`.
 *
 * If anything here doesn't match reality, this module throws, and the app
 * automatically falls back to Open-Meteo (see hooks/useZoneData.js) — so a
 * wrong guess degrades gracefully instead of breaking the demo.
 */

const BASE_URL = 'https://api.fortyguard.com';
const SUBMIT_PATH = '/v1/heatmap';
const POLL_PATH = (activityId) => `/v1/heatmap/${activityId}`; // ⚠️ unconfirmed — verify against your docs

const POLL_INTERVAL_MS = 2500;
const MAX_POLL_ATTEMPTS = 12; // ~30s total before giving up and falling back
const MIN_READINGS_FOR_NON_SPARSE = 3;

function getIstDateTimeParts() {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(new Date()).map((p) => [p.type, p.value]));
  return {
    start_date: `${parts.year}-${parts.month}-${parts.day}`,
    start_time: `${parts.hour}:${parts.minute}`,
  };
}

async function submitHeatmapRequest(zone, apiKey) {
  const res = await fetch(`${BASE_URL}${SUBMIT_PATH}`, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      polygon_aoi: zone.polygon,
      date_time: {
        ...getIstDateTimeParts(),
        filter_type: 1, // ⚠️ unconfirmed meaning — assumed "current / live reading"
      },
      granularity: 100,
    }),
  });

  if (!res.ok) {
    throw new Error(`FortyGuard submit failed (${res.status})`);
  }
  const json = await res.json();
  const activityId = json?.data?.activity_id ?? json?.activity_id;
  if (!activityId) {
    throw new Error('FortyGuard response had no activity_id');
  }
  return activityId;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Tries a handful of plausible "is it done yet" shapes. */
function extractStatus(json) {
  return (json?.data?.status ?? json?.status ?? '').toString().toLowerCase();
}

/** Tries a handful of plausible completed-result shapes and normalizes them. */
function parseResult(json) {
  const data = json?.data ?? json;

  // Shape A: a flat array of point readings
  const readings = data?.result?.readings ?? data?.readings ?? data?.result ?? null;

  if (Array.isArray(readings) && readings.length > 0) {
    const temps = readings
      .map((r) => r.temperature ?? r.temp ?? r.value)
      .filter((t) => typeof t === 'number');
    if (temps.length === 0) return null;
    const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
    return { tempNow: avg, readingCount: temps.length };
  }

  // Shape B: a pre-aggregated scalar
  const scalar =
    data?.result?.average_temperature ?? data?.average_temperature ?? data?.temperature ?? null;
  if (typeof scalar === 'number') {
    return { tempNow: scalar, readingCount: 1 };
  }

  return null;
}

async function pollForResult(activityId, apiKey) {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await sleep(POLL_INTERVAL_MS);

    const res = await fetch(`${BASE_URL}${POLL_PATH(activityId)}`, {
      headers: { 'api-key': apiKey },
    });
    if (!res.ok) {
      throw new Error(`FortyGuard poll failed (${res.status})`);
    }
    const json = await res.json();
    const status = extractStatus(json);

    if (status && !['completed', 'done', 'success', 'ready'].includes(status)) {
      if (['failed', 'error'].includes(status)) {
        throw new Error('FortyGuard reported the activity failed');
      }
      continue; // still processing
    }

    const parsed = parseResult(json);
    if (parsed) return parsed;
    // No recognizable status field but also no recognizable result — try
    // parsing anyway once, then keep polling in case it's just still running.
  }
  throw new Error('FortyGuard poll timed out');
}

/**
 * Full submit → poll → parse flow for one zone.
 * Throws on any failure or sparse/empty data — callers should catch this and
 * fall back to Open-Meteo, per the brief's "never break live on stage" rule.
 *
 * NOTE: this only returns a current-temperature reading, not an hourly trend
 * — FortyGuard's confirmed request shape is a single point-in-time query, so
 * the 24h trend chart uses Open-Meteo even when the "current" stat comes
 * from FortyGuard. Swap in real trend logic here if your dashboard docs show
 * a historical/range mode.
 */
export async function fetchFortyGuardHeatmap(zone, apiKey) {
  if (!apiKey) {
    throw new Error('No FortyGuard API key configured');
  }
  const activityId = await submitHeatmapRequest(zone, apiKey);
  const result = await pollForResult(activityId, apiKey);

  if (!result || result.readingCount < MIN_READINGS_FOR_NON_SPARSE) {
    throw new Error('FortyGuard returned sparse data');
  }

  return {
    tempNow: result.tempNow,
    source: 'fortyguard',
  };
}
