import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';
import { RISK_BANDS } from '../services/riskModel.js';
import { DISTRICTS } from '../data/zones.js';
import { formatPopulation, formatTemp } from '../utils/format.js';

const TN_CENTER = [12.0, 78.6];
const DEFAULT_ZOOM = 7;
const DISTRICT_ZOOM = 10;

/** Imperative map controls, mounted inside MapContainer so `useMap` resolves. */
function MapController({ target }) {
  const map = useMap();
  // `nonce` makes repeat clicks on the same district re-trigger the fly-to.
  const nonce = target?.nonce ?? null;

  useEffect(() => {
    if (!target) return;
    map.flyTo([target.lat, target.lon], target.zoom, { duration: 0.8 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce]);

  return null;
}

export default function MapView({ zoneStates, network }) {
  const [target, setTarget] = useState(null);
  const [nonce, setNonce] = useState(0);

  // The two core zones are read via FortyGuard (with an Open-Meteo fallback),
  // so prefer their richer reading over the bulk map fetch for those points.
  const coreByPointId = useMemo(() => {
    const map = {};
    for (const s of zoneStates) {
      if (s.tempNow !== null && s.tempNow !== undefined) {
        map[s.zone.id] = { tempNow: s.tempNow, risk: s.risk, source: s.source };
      }
    }
    return map;
  }, [zoneStates]);

  const points = useMemo(
    () =>
      (network?.points ?? []).map((p) => {
        const core = coreByPointId[p.id];
        return core
          ? { ...p, tempNow: core.tempNow, risk: core.risk, source: core.source }
          : { ...p, source: 'open-meteo' };
      }),
    [network, coreByPointId]
  );

  function focus(lat, lon, zoom) {
    setNonce((n) => n + 1);
    setTarget({ lat, lon, zoom, nonce: nonce + 1 });
  }

  return (
    <div className="relative h-full min-h-[520px] overflow-hidden rounded-2xl border border-void-line shadow-panel">
      <MapContainer
        center={TN_CENTER}
        zoom={DEFAULT_ZOOM}
        minZoom={5}
        maxZoom={18}
        scrollWheelZoom
        doubleClickZoom
        className="h-full w-full"
        style={{ minHeight: 520, background: '#0c1310' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapController target={target} />

        {points.map((p) => {
          const isDistrict = p.kind === 'district';
          return (
            <CircleMarker
              key={p.id}
              center={[p.lat, p.lon]}
              radius={isDistrict ? 14 : 8}
              pathOptions={{
                color: p.risk.color,
                fillColor: p.risk.color,
                fillOpacity: isDistrict ? 0.55 : 0.4,
                weight: isDistrict ? 2.5 : 1.5,
                dashArray: isDistrict ? null : '3 3',
              }}
            >
              <Tooltip direction="top" offset={[0, -6]}>
                <span className="font-body text-xs">
                  {p.name} · {p.tempNow === null ? 'no data' : `${formatTemp(p.tempNow)}C`}
                </span>
              </Tooltip>
              <Popup>
                <div className="font-body">
                  <div className="font-display font-semibold text-ink">{p.name}</div>
                  <div className="text-xs text-ink-muted">
                    {p.kindLabel}
                    {!isDistrict && ` · ${p.districtName} district`}
                  </div>
                  <div className="mt-1 text-sm text-ink">
                    {p.tempNow === null ? 'No live reading' : `${formatTemp(p.tempNow)}C`}
                    {' · '}
                    <span style={{ color: p.risk.color }}>{p.risk.label}</span>
                  </div>
                  {p.feelsLike !== null && p.feelsLike !== undefined && (
                    <div className="text-xs text-ink-muted">
                      Feels like {formatTemp(p.feelsLike)}C
                    </div>
                  )}
                  {p.population && (
                    <div className="text-xs text-ink-muted">
                      {formatPopulation(p.population)} population
                    </div>
                  )}
                  <div className="mt-1 text-[10px] uppercase tracking-wide text-ink-faint">
                    via {p.source ?? 'open-meteo'}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* District quick-jump — zoom straight to any district, or pan/scroll freely. */}
      <div className="absolute right-3 top-3 z-[1000] flex flex-col items-end gap-1">
        <div className="flex flex-wrap justify-end gap-1">
          {DISTRICTS.map((d) => (
            <button
              key={d.id}
              onClick={() => focus(d.lat, d.lon, DISTRICT_ZOOM)}
              className="rounded-md border border-void-line bg-void/85 px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-ink-muted backdrop-blur transition hover:border-signal/50 hover:text-ink"
            >
              {d.shortName}
            </button>
          ))}
        </div>
        <button
          onClick={() => focus(TN_CENTER[0], TN_CENTER[1], DEFAULT_ZOOM)}
          className="rounded-md border border-void-line bg-void/85 px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-ink-faint backdrop-blur transition hover:border-signal/50 hover:text-ink"
        >
          Reset view
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] flex flex-col gap-1 rounded-lg border border-void-line bg-void/85 px-3 py-2 font-mono text-[10px] uppercase tracking-wide text-ink-muted backdrop-blur">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {RISK_BANDS.map((b) => (
            <span key={b.id} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: b.color }} />
              {b.label}
            </span>
          ))}
        </div>
        <div className="flex gap-3 text-ink-faint">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border-2 border-ink-faint" />
            District
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full border border-dashed border-ink-faint" />
            Sub-town
          </span>
        </div>
      </div>

      {network?.loading && (
        <div className="pointer-events-none absolute bottom-14 right-3 z-[1000] rounded-md border border-void-line bg-void/85 px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-ink-faint backdrop-blur">
          Loading readings…
        </div>
      )}
    </div>
  );
}
