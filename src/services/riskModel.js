/**
 * Simplified absolute-temperature heat risk bands for the demo.
 *
 * These are NOT the official IMD heatwave criteria (which are defined by
 * *departure from the local normal*, not absolute thresholds). For a
 * hackathon dashboard comparing two places in the same climate belt on the
 * same day, absolute bands are a reasonable, judge-legible simplification —
 * call this out if presenting to a technical audience.
 */
export const RISK_BANDS = [
  { id: 'safe', label: 'Normal', min: -Infinity, max: 34.999, color: '#2FD9A8' },
  { id: 'elevated', label: 'Elevated', min: 35, max: 39.999, color: '#F4C744' },
  { id: 'high', label: 'High', min: 40, max: 44.999, color: '#FF9F1C' },
  { id: 'extreme', label: 'Extreme', min: 45, max: Infinity, color: '#FF4B3E' },
];

export function classifyRisk(tempC) {
  if (tempC === null || tempC === undefined || Number.isNaN(tempC)) {
    return { id: 'unknown', label: 'No data', color: '#5C6B62' };
  }
  return (
    RISK_BANDS.find((b) => tempC >= b.min && tempC <= b.max) ??
    RISK_BANDS[RISK_BANDS.length - 1]
  );
}

export function riskColor(tempC) {
  return classifyRisk(tempC).color;
}
