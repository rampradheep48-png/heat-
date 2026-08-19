/**
 * Merges every zone's 24h trend array into one Recharts-friendly dataset, with
 * one series column per zone id. Trends are aligned by timestamp so zones in
 * different Open-Meteo grid cells (or with a shorter series) still line up.
 */
export function mergeTrends(zoneStates) {
  const withData = zoneStates.filter((z) => z.trend?.length > 0);
  if (withData.length === 0) return [];

  const byTime = new Map();
  for (const { zone, trend } of withData) {
    for (const point of trend) {
      if (!byTime.has(point.time)) byTime.set(point.time, { time: point.time });
      byTime.get(point.time)[zone.id] = point.temp ?? null;
    }
  }

  const rows = [...byTime.values()].sort((a, b) => new Date(a.time) - new Date(b.time));

  // Backfill missing series with null so Recharts' connectNulls handles gaps.
  for (const row of rows) {
    for (const { zone } of withData) {
      if (!(zone.id in row)) row[zone.id] = null;
    }
  }

  return rows;
}
