export default function Footer() {
  return (
    <footer className="border-t border-void-line bg-void-soft">
      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
        <div className="grid grid-cols-1 gap-4 text-xs text-ink-faint sm:grid-cols-3">
          <div>
            <div className="mb-1 font-mono uppercase tracking-widest text-ink-muted">
              Temperature
            </div>
            FortyGuard Temperature API (primary), Open-Meteo (automatic fallback + 24h trend).
          </div>
          <div>
            <div className="mb-1 font-mono uppercase tracking-widest text-ink-muted">
              AI agent
            </div>
            Google Gemini generates the plain-English risk summary per zone on every refresh.
          </div>
          <div>
            <div className="mb-1 font-mono uppercase tracking-widest text-ink-muted">
              Methodology
            </div>
            Risk bands are simplified absolute-temperature thresholds, not official IMD
            heatwave criteria. Population figures are 2011 census, city/town proper.
          </div>
        </div>
      </div>
    </footer>
  );
}
