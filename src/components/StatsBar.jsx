import RiskBadge from './RiskBadge.jsx';
import { formatTemp } from '../utils/format.js';

function StatCard({ label, children }) {
  return (
    <div className="rounded-xl border border-void-line bg-void-panel p-4 shadow-panel sm:p-5">
      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-ink-faint">
        {label}
      </div>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

function ZoneRow({ zone, children }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-ink-muted">{zone.shortName}</span>
      {children}
    </div>
  );
}

export default function StatsBar({ zoneStates }) {
  const flaggedZones = zoneStates.filter((z) => ['high', 'extreme'].includes(z.risk.id));

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard label="Current Temperature">
        {zoneStates.map(({ zone, tempNow, loading }) => (
          <ZoneRow key={zone.id} zone={zone}>
            <span className="font-mono text-xl font-semibold text-ink">
              {loading && tempNow === null ? '···' : formatTemp(tempNow)}
              <span className="text-sm text-ink-faint">C</span>
            </span>
          </ZoneRow>
        ))}
      </StatCard>

      <StatCard label="Risk Level">
        {zoneStates.map(({ zone, risk }) => (
          <ZoneRow key={zone.id} zone={zone}>
            <RiskBadge risk={risk} size="sm" />
          </ZoneRow>
        ))}
      </StatCard>

      <StatCard label="Zones Flagged">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-3xl font-semibold text-risk-high">
            {flaggedZones.length}
          </span>
          <span className="text-sm text-ink-faint">of {zoneStates.length} at High or Extreme</span>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {flaggedZones.length === 0 && (
            <span className="text-xs text-ink-faint">No zones currently flagged.</span>
          )}
          {flaggedZones.map(({ zone, risk }) => (
            <span
              key={zone.id}
              className="rounded-md px-2 py-0.5 text-[11px] font-medium"
              style={{ color: risk.color, backgroundColor: `${risk.color}14` }}
            >
              {zone.shortName}
            </span>
          ))}
        </div>
      </StatCard>
    </div>
  );
}
