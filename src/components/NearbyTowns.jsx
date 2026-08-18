import { useState } from 'react';
import { SECONDARY_TOWNS } from '../data/zones.js';
import { fetchOpenMeteo } from '../services/openMeteo.js';
import { classifyRisk } from '../services/riskModel.js';
import { formatTemp } from '../utils/format.js';

export default function NearbyTowns() {
  const [readings, setReadings] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  async function handleClick(town) {
    if (town.id in readings || loadingId === town.id) return;
    setLoadingId(town.id);
    try {
      const data = await fetchOpenMeteo(town);
      setReadings((r) => ({ ...r, [town.id]: data.tempNow }));
    } catch {
      setReadings((r) => ({ ...r, [town.id]: null }));
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-void-line bg-void-panel p-5 shadow-panel">
      <div className="mb-1 font-display text-base font-semibold text-ink">Drill down nearby</div>
      <p className="mb-3 text-xs text-ink-faint">
        Optional lookups for surrounding towns — tap one for a quick reading (Open-Meteo, no
        credits used).
      </p>
      <div className="flex flex-wrap gap-2">
        {SECONDARY_TOWNS.map((town) => {
          const temp = readings[town.id];
          const risk = temp !== undefined && temp !== null ? classifyRisk(temp) : null;
          return (
            <button
              key={town.id}
              onClick={() => handleClick(town)}
              className="flex items-center gap-1.5 rounded-full border border-void-line bg-void px-3 py-1.5 text-xs text-ink-muted transition hover:border-signal/40 hover:text-ink"
            >
              {town.name}
              {loadingId === town.id && <span className="text-ink-faint">···</span>}
              {temp !== undefined && temp !== null && (
                <span className="font-mono" style={{ color: risk.color }}>
                  {formatTemp(temp)}C
                </span>
              )}
              {temp === null && <span className="text-ink-faint">n/a</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
