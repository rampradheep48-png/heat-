import { useState, useEffect, useCallback } from 'react';
import { HEAT_POINTS } from '../data/zones.js';
import { fetchOpenMeteoBulk } from '../services/openMeteo.js';
import { classifyRisk } from '../services/riskModel.js';

const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // matches useZoneData

/**
 * Loads the current temperature for every district HQ and sub-town in one
 * batched Open-Meteo call, and classifies each into a risk band so the map can
 * colour them. Open-Meteo only — no FortyGuard credits are spent here.
 */
export function useHeatNetwork() {
  const [points, setPoints] = useState(() =>
    HEAT_POINTS.map((p) => ({ ...p, tempNow: null, feelsLike: null, risk: classifyRisk(null) }))
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const readings = await fetchOpenMeteoBulk(HEAT_POINTS);
      const next = HEAT_POINTS.map((p) => {
        const r = readings[p.id];
        return {
          ...p,
          tempNow: r?.tempNow ?? null,
          feelsLike: r?.feelsLike ?? null,
          risk: classifyRisk(r?.tempNow ?? null),
        };
      });
      setPoints(next);
      setError(
        next.every((p) => p.tempNow === null) ? 'Live readings unavailable right now.' : null
      );
    } catch (e) {
      setError(e.message ?? 'Failed to load the district heat network.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [load]);

  return { points, loading, error, refresh: load };
}
