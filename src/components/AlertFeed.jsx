import { Sparkles, Satellite, CloudSun } from 'lucide-react';
import RiskBadge from './RiskBadge.jsx';
import { formatClock } from '../utils/format.js';

function SourceTag({ source }) {
  if (!source) return null;
  const isFortyGuard = source === 'fortyguard';
  const Icon = isFortyGuard ? Satellite : CloudSun;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-void-line bg-void px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ink-faint">
      <Icon size={11} />
      {isFortyGuard ? 'FortyGuard' : 'Open-Meteo fallback'}
    </span>
  );
}

function AlertCard({ zone, risk, alert, alertLoading, source, lastUpdated }) {
  return (
    <div className="rounded-2xl border border-void-line bg-void-panel p-5 shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${risk.color}1A`, color: risk.color }}
          >
            <Sparkles size={16} />
          </span>
          <div>
            <div className="font-display text-sm font-semibold text-ink">{zone.name}</div>
            <div className="text-[11px] text-ink-faint">AI agent alert</div>
          </div>
        </div>
        <RiskBadge risk={risk} size="sm" />
      </div>

      <p className="mt-4 min-h-[4.5em] text-sm leading-relaxed text-ink-muted">
        {alertLoading && !alert ? (
          <span className="inline-flex items-center gap-2 text-ink-faint">
            <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-signal" />
            Generating risk summary…
          </span>
        ) : (
          alert ?? 'No alert generated yet.'
        )}
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-void-line pt-3">
        <SourceTag source={source} />
        <span className="font-mono text-[10px] text-ink-faint">
          {lastUpdated ? `Refreshed ${formatClock(lastUpdated)} IST` : 'Awaiting first sync'}
        </span>
      </div>
    </div>
  );
}

export default function AlertFeed({ zoneStates }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <h3 className="font-display text-base font-semibold text-ink">Agent alert feed</h3>
        <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
          Gemini-generated
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {zoneStates.map((z) => (
          <AlertCard key={z.zone.id} {...z} />
        ))}
      </div>
    </div>
  );
}
