import { useMemo } from 'react';
import { DISTRICTS } from '../data/zones.js';
import { formatTemp } from '../utils/format.js';

/**
 * District-by-district breakdown of every mapped point, colour-coded by the
 * same risk bands the map uses. Reads straight from the shared network fetch,
 * so no extra requests are made here.
 */
export default function NearbyTowns({ points, loading, error }) {
  const byDistrict = useMemo(() => {
    const groups = {};
    for (const p of points ?? []) {
      (groups[p.districtId] ??= []).push(p);
    }
    return groups;
  }, [points]);

  return (
    <div className="rounded-2xl border border-void-line bg-void-panel p-5 shadow-panel">
      <div className="mb-1 font-display text-base font-semibold text-ink">
        District &amp; sub-town readings
      </div>
      <p className="mb-4 text-xs text-ink-faint">
        Live temperature for every district headquarters and its taluk towns (Open-Meteo, no
        credits used). Colour matches the map&rsquo;s risk bands.
        {loading && <span className="ml-1 text-ink-faint">Refreshing…</span>}
        {error && <span className="ml-1 text-risk-extreme">{error}</span>}
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DISTRICTS.map((d) => {
          const points = byDistrict[d.id] ?? [];
          const hq = points.find((p) => p.kind === 'district');
          const towns = points.filter((p) => p.kind === 'town');

          return (
            <div key={d.id} className="rounded-xl border border-void-line bg-void p-3">
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <span className="font-display text-sm font-semibold text-ink">{d.name}</span>
                {hq && (
                  <span className="font-mono text-sm" style={{ color: hq.risk.color }}>
                    {formatTemp(hq.tempNow)}C
                  </span>
                )}
              </div>
              <ul className="space-y-1">
                {towns.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between gap-2 text-xs text-ink-muted"
                  >
                    <span className="flex items-center gap-1.5">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: t.risk.color }}
                      />
                      {t.name}
                    </span>
                    <span className="font-mono" style={{ color: t.risk.color }}>
                      {formatTemp(t.tempNow)}C
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                {towns.length} {d.subKind}
                {towns.length === 1 ? '' : 's'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
