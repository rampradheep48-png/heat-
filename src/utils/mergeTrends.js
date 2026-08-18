/** Merges two zones' 24h trend arrays into one Recharts-friendly dataset. */
export function mergeTrends(zoneStates) {
  const [a, b] = zoneStates;
  if (!a || !b) return [];

  const length = Math.max(a.trend.length, b.trend.length);
  const merged = [];
  for (let i = 0; i < length; i++) {
    const pointA = a.trend[i];
    const pointB = b.trend[i];
    merged.push({
      time: pointA?.time ?? pointB?.time,
      [a.zone.id]: pointA?.temp ?? null,
      [b.zone.id]: pointB?.temp ?? null,
    });
  }
  return merged;
}
