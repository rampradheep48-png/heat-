import { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { RISK_BANDS } from '../services/riskModel.js';
import { formatPopulation, formatTemp } from '../utils/format.js';

export default function MapView({ zoneStates }) {
  const center = useMemo(() => {
    const lats = zoneStates.map((z) => z.zone.lat);
    const lons = zoneStates.map((z) => z.zone.lon);
    return [
      (Math.min(...lats) + Math.max(...lats)) / 2,
      (Math.min(...lons) + Math.max(...lons)) / 2,
    ];
  }, [zoneStates]);

  return (
    <div className="relative h-full min-h-[420px] overflow-hidden rounded-2xl border border-void-line shadow-panel">
      <MapContainer
        center={center}
        zoom={8}
        scrollWheelZoom={false}
        className="h-full w-full"
        style={{ minHeight: 420, background: '#0c1310' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {zoneStates.map(({ zone, tempNow, risk }) => (
          <CircleMarker
            key={zone.id}
            center={[zone.lat, zone.lon]}
            radius={16}
            pathOptions={{
              color: risk.color,
              fillColor: risk.color,
              fillOpacity: 0.5,
              weight: 2,
            }}
          >
            <Popup>
              <div className="font-body">
                <div className="font-display font-semibold text-ink">{zone.name}</div>
                <div className="text-xs text-ink-muted">{zone.densityLabel}</div>
                <div className="mt-1 text-sm text-ink">
                  {formatTemp(tempNow)}C &middot; {risk.label}
                </div>
                <div className="text-xs text-ink-muted">
                  {formatPopulation(zone.population)} population
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] flex flex-wrap gap-x-3 gap-y-1 rounded-lg border border-void-line bg-void/85 px-3 py-2 font-mono text-[10px] uppercase tracking-wide text-ink-muted backdrop-blur">
        {RISK_BANDS.filter((b) => b.id !== 'safe').map((b) => (
          <span key={b.id} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: b.color }} />
            {b.label}
          </span>
        ))}
      </div>
    </div>
  );
}
