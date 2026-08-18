import { formatClock } from '../utils/format.js';

export default function Header({ lastUpdated, onRefreshAll, refreshing }) {
  return (
    <header className="relative overflow-hidden border-b border-void-line bg-void-soft">
      <div className="absolute inset-x-0 top-0 h-px bg-thermal-scan animate-scan opacity-70" />
      <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-signal">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-pulseDot rounded-full bg-signal" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
              </span>
              Live · FortyGuard Hackathon&rsquo;26 · Dashboards
            </div>
            <h1 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
              Heat Risk Command Center
            </h1>
            <p className="mt-1 max-w-xl text-sm text-ink-muted">
              Tiruchirappalli vs. Tirupattur — same interior Tamil Nadu heatwave, ten times the
              exposed population.
            </p>
          </div>

          <div className="flex items-center gap-4 font-mono text-xs text-ink-muted">
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest text-ink-faint">
                Last sync (IST)
              </div>
              <div className="text-ink">{formatClock(lastUpdated)}</div>
            </div>
            <button
              onClick={onRefreshAll}
              disabled={refreshing}
              className="rounded-md border border-void-line bg-void-panel px-3 py-2 font-body text-xs font-medium text-ink transition hover:border-signal/40 hover:text-signal disabled:cursor-not-allowed disabled:opacity-50"
            >
              {refreshing ? 'Syncing…' : 'Refresh now'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
