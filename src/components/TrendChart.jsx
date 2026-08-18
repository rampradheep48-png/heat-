import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { mergeTrends } from '../utils/mergeTrends.js';
import { formatHour } from '../utils/format.js';

const LINE_COLORS = ['#7CF5C4', '#F4C744'];

export default function TrendChart({ zoneStates }) {
  const data = mergeTrends(zoneStates);
  const hasData = data.length > 0;

  return (
    <div className="flex h-full min-h-[420px] flex-col rounded-2xl border border-void-line bg-void-panel p-5 shadow-panel">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            Trend
          </div>
          <h3 className="font-display text-base font-semibold text-ink">24-hour temperature</h3>
        </div>
      </div>

      <div className="mt-2 flex-1">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 12, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="#233028" strokeDasharray="3 6" vertical={false} />
              <XAxis
                dataKey="time"
                tickFormatter={formatHour}
                stroke="#5C6B62"
                tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }}
                interval="preserveStartEnd"
                minTickGap={28}
              />
              <YAxis
                stroke="#5C6B62"
                tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }}
                unit="°"
                width={40}
              />
              <Tooltip
                labelFormatter={formatHour}
                formatter={(value) => [`${Number(value).toFixed(1)}°C`]}
                contentStyle={{
                  background: '#111A15',
                  border: '1px solid #233028',
                  borderRadius: 10,
                  fontFamily: 'Inter',
                  fontSize: 12,
                }}
                labelStyle={{ color: '#93A29A', fontFamily: 'IBM Plex Mono', fontSize: 11 }}
              />
              <Legend
                formatter={(value) => (
                  <span className="font-body text-xs text-ink-muted">
                    {zoneStates.find((z) => z.zone.id === value)?.zone.shortName ?? value}
                  </span>
                )}
              />
              {zoneStates.map((z, i) => (
                <Line
                  key={z.zone.id}
                  type="monotone"
                  dataKey={z.zone.id}
                  stroke={LINE_COLORS[i % LINE_COLORS.length]}
                  strokeWidth={2}
                  strokeDasharray={i === 1 ? '5 4' : undefined}
                  dot={false}
                  connectNulls
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-faint">
            Waiting on trend data…
          </div>
        )}
      </div>
    </div>
  );
}
