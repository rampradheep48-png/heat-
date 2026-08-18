import { useState, useEffect, useCallback } from 'react';
import { fetchFortyGuardHeatmap } from '../services/fortyguard.js';
import { fetchOpenMeteo } from '../services/openMeteo.js';
import { generateHeatAlert } from '../services/gemini.js';
import { classifyRisk } from '../services/riskModel.js';

const FORTYGUARD_KEY = import.meta.env.VITE_FORTYGUARD_API_KEY;
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes — safe for both free tiers

/**
 * Orchestrates one zone's full data lifecycle:
 * FortyGuard (primary) → Open-Meteo (fallback, and always used for the 24h
 * trend line) → risk classification → Gemini alert copy.
 * Auto-refreshes on an interval and exposes a manual `refresh()`.
 */
export function useZoneData(zone) {
  const [state, setState] = useState({
    loading: true,
    error: null,
    tempNow: null,
    feelsLike: null,
    trend: [],
    source: null,
    risk: classifyRisk(null),
    alert: null,
    alertLoading: false,
    lastUpdated: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));

    const [fortyGuardResult, openMeteoResult] = await Promise.all([
      fetchFortyGuardHeatmap(zone, FORTYGUARD_KEY).catch(() => null),
      fetchOpenMeteo(zone).catch(() => null),
    ]);

    const tempNow = fortyGuardResult?.tempNow ?? openMeteoResult?.tempNow ?? null;
    const source = fortyGuardResult ? 'fortyguard' : openMeteoResult ? 'open-meteo' : null;

    if (tempNow === null) {
      setState((s) => ({
        ...s,
        loading: false,
        error: 'Live data unavailable for this zone right now.',
      }));
      return;
    }

    const risk = classifyRisk(tempNow);

    setState((s) => ({
      ...s,
      loading: false,
      error: null,
      tempNow,
      feelsLike: openMeteoResult?.feelsLike ?? null,
      trend: openMeteoResult?.trend ?? [],
      source,
      risk,
      lastUpdated: new Date(),
      alertLoading: true,
    }));

    const alertText = await generateHeatAlert(
      zone,
      { tempNow, riskLabel: risk.label, source },
      GEMINI_KEY
    );

    setState((s) => ({ ...s, alert: alertText, alertLoading: false }));
  }, [zone]);

  useEffect(() => {
    load();
    const id = setInterval(load, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [load]);

  return { ...state, refresh: load };
}
