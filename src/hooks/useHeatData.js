import { useState, useEffect, useCallback, useRef } from 'react';
import { ZONES, HEAT_POINTS } from '../data/zones.js';
import { fetchFortyGuardHeatmap } from '../services/fortyguard.js';
import { fetchOpenMeteoBulk } from '../services/openMeteo.js';
import { generateHeatAlert } from '../services/gemini.js';
import { classifyRisk } from '../services/riskModel.js';

const FORTYGUARD_KEY = import.meta.env.VITE_FORTYGUARD_API_KEY;
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes — safe for both free tiers

const SUB_TOWNS = HEAT_POINTS.filter((p) => p.kind === 'town');

const emptyZoneState = (zone) => ({
  zone,
  tempNow: null,
  feelsLike: null,
  trend: [],
  source: null,
  risk: classifyRisk(null),
  alert: null,
  alertLoading: false,
  lastUpdated: null,
});

/**
 * Orchestrates the whole dashboard's data lifecycle for all five districts:
 *
 *   1. One batched Open-Meteo call for the five district HQs *with* their
 *      trailing 24h trend, and one for the 25 sub-towns (current temp only).
 *   2. FortyGuard on top, but only for the zones flagged `usesFortyGuard` —
 *      it's the primary source there, with the Open-Meteo reading as fallback.
 *   3. Risk classification for every point.
 *   4. A Gemini alert paragraph per district.
 *
 * Auto-refreshes on an interval and exposes a manual `refresh()`.
 */
export function useHeatData() {
  const [zoneStates, setZoneStates] = useState(() => ZONES.map(emptyZoneState));
  const [points, setPoints] = useState(() =>
    HEAT_POINTS.map((p) => ({ ...p, tempNow: null, feelsLike: null, risk: classifyRisk(null) }))
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Guards against a slow in-flight refresh overwriting a newer one.
  const runIdRef = useRef(0);

  const load = useCallback(async () => {
    const runId = ++runIdRef.current;
    setLoading(true);
    setError(null);

    const [hqReadings, townReadings, ...fgResults] = await Promise.all([
      fetchOpenMeteoBulk(ZONES, { withTrend: true }).catch(() => ({})),
      fetchOpenMeteoBulk(SUB_TOWNS).catch(() => ({})),
      ...ZONES.map((z) =>
        z.usesFortyGuard
          ? fetchFortyGuardHeatmap(z, FORTYGUARD_KEY).catch(() => null)
          : Promise.resolve(null)
      ),
    ]);

    if (runId !== runIdRef.current) return; // superseded by a newer refresh

    const now = new Date();
    const nextZones = ZONES.map((zone, i) => {
      const om = hqReadings[zone.id];
      const fg = fgResults[i];
      const tempNow = fg?.tempNow ?? om?.tempNow ?? null;
      const source = fg ? 'fortyguard' : om?.tempNow != null ? 'open-meteo' : null;

      return {
        zone,
        tempNow,
        feelsLike: om?.feelsLike ?? null,
        trend: om?.trend ?? [],
        source,
        risk: classifyRisk(tempNow),
        alert: null,
        alertLoading: tempNow !== null,
        lastUpdated: tempNow !== null ? now : null,
      };
    });

    const allReadings = { ...hqReadings, ...townReadings };
    const nextPoints = HEAT_POINTS.map((p) => {
      // District HQs prefer the zone reading, which may come from FortyGuard.
      const zoneState = nextZones.find((z) => z.zone.id === p.id);
      const tempNow = zoneState ? zoneState.tempNow : (allReadings[p.id]?.tempNow ?? null);
      return {
        ...p,
        tempNow,
        feelsLike: allReadings[p.id]?.feelsLike ?? null,
        source: zoneState?.source ?? 'open-meteo',
        risk: classifyRisk(tempNow),
      };
    });

    setZoneStates(nextZones);
    setPoints(nextPoints);
    setLoading(false);
    if (nextPoints.every((p) => p.tempNow === null)) {
      setError('Live data is unavailable right now.');
    }

    // Alerts are generated per district after the readings land, so the
    // numbers render immediately rather than waiting on the LLM.
    await Promise.all(
      nextZones.map(async (z) => {
        if (z.tempNow === null) return;
        const alert = await generateHeatAlert(
          z.zone,
          { tempNow: z.tempNow, riskLabel: z.risk.label, source: z.source },
          GEMINI_KEY
        );
        if (runId !== runIdRef.current) return;
        setZoneStates((prev) =>
          prev.map((p) => (p.zone.id === z.zone.id ? { ...p, alert, alertLoading: false } : p))
        );
      })
    );
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [load]);

  const lastUpdated = zoneStates
    .map((z) => z.lastUpdated)
    .filter(Boolean)
    .sort((a, b) => b - a)[0];

  return { zoneStates, points, loading, error, lastUpdated, refresh: load };
}
