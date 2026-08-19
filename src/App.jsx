import { useMemo } from 'react';
import { ZONES } from './data/zones.js';
import { useZoneData } from './hooks/useZoneData.js';
import { useHeatNetwork } from './hooks/useHeatNetwork.js';
import Header from './components/Header.jsx';
import StatsBar from './components/StatsBar.jsx';
import ComparisonPanel from './components/ComparisonPanel.jsx';
import MapView from './components/MapView.jsx';
import TrendChart from './components/TrendChart.jsx';
import AlertFeed from './components/AlertFeed.jsx';
import NearbyTowns from './components/NearbyTowns.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  // Fixed at two zones (ZONES has exactly Trichy + Tirupattur) so calling the
  // hook a static number of times keeps this within the rules of hooks.
  const trichy = useZoneData(ZONES[0]);
  const tirupattur = useZoneData(ZONES[1]);

  // Every district HQ + sub-town, for the map layer (bulk Open-Meteo, no credits).
  const network = useHeatNetwork();

  const zoneStates = useMemo(
    () => [
      { zone: ZONES[0], ...trichy },
      { zone: ZONES[1], ...tirupattur },
    ],
    [trichy, tirupattur]
  );

  const refreshing = trichy.loading || tirupattur.loading;
  const lastUpdated = [trichy.lastUpdated, tirupattur.lastUpdated]
    .filter(Boolean)
    .sort((a, b) => b - a)[0];

  function refreshAll() {
    trichy.refresh();
    tirupattur.refresh();
    network.refresh();
  }

  return (
    <div className="min-h-screen">
      <Header lastUpdated={lastUpdated} onRefreshAll={refreshAll} refreshing={refreshing} />

      <main className="mx-auto max-w-7xl space-y-6 px-5 py-8 sm:px-8">
        <StatsBar zoneStates={zoneStates} />

        <ComparisonPanel zoneStates={zoneStates} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <MapView zoneStates={zoneStates} network={network} />
          </div>
          <div className="lg:col-span-2">
            <TrendChart zoneStates={zoneStates} />
          </div>
        </div>

        <AlertFeed zoneStates={zoneStates} />

        <NearbyTowns network={network} />
      </main>

      <Footer />
    </div>
  );
}
