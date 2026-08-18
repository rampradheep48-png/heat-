import { POPULATION_RATIO } from '../data/zones.js';
import { formatPopulation, formatTemp } from '../utils/format.js';

function PopulationBar({ zone, tempNow, risk, maxPopulation }) {
  const widthPct = Math.max(4, (zone.population / maxPopulation) * 100);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div>
          <div className="font-display text-lg font-semibold text-ink">{zone.name}</div>
          <div className="text-xs text-ink-faint">{zone.densityLabel}</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-2xl font-semibold text-ink">
            {formatPopulation(zone.population)}
          </div>
          <div className="text-xs text-ink-faint">2011 census · {zone.kind.toLowerCase()} proper</div>
        </div>
      </div>

      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-void">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${widthPct}%`,
            background: `linear-gradient(90deg, ${risk.color}99, ${risk.color})`,
          }}
        />
      </div>

      <div className="mt-2 flex items-center gap-2 text-xs text-ink-muted">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: risk.color }}
        />
        Reading now: <span className="font-mono text-ink">{formatTemp(tempNow)}C</span>
        <span className="text-ink-faint">· {risk.label}</span>
      </div>
    </div>
  );
}

export default function ComparisonPanel({ zoneStates }) {
  const maxPopulation = Math.max(...zoneStates.map((z) => z.zone.population));

  return (
    <div className="relative overflow-hidden rounded-2xl border border-void-line bg-void-panel p-6 shadow-panel sm:p-8">
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-[0.12] blur-3xl"
        style={{ background: 'radial-gradient(circle, #FF4B3E, transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full opacity-[0.10] blur-3xl"
        style={{ background: 'radial-gradient(circle, #2FD9A8, transparent 70%)' }}
      />

      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
          Same climate belt · Same April&ndash;May 2026 heatwave event
        </div>
        <div className="flex items-center gap-2 rounded-full border border-risk-extreme/30 bg-risk-extreme/10 px-3 py-1 font-display text-sm font-semibold text-risk-extreme">
          ~{POPULATION_RATIO}× the exposed population
        </div>
      </div>

      <h2 className="relative mt-3 max-w-2xl font-display text-xl font-semibold text-ink sm:text-2xl">
        Both places hit 40°C+ this heatwave. Population — not temperature — is what turns that
        into a mass-casualty risk.
      </h2>

      <div className="relative mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10">
        {zoneStates.map(({ zone, tempNow, risk }) => (
          <PopulationBar
            key={zone.id}
            zone={zone}
            tempNow={tempNow}
            risk={risk}
            maxPopulation={maxPopulation}
          />
        ))}
      </div>
    </div>
  );
}
