import { useHeatData } from './hooks/useHeatData.js';
import Header from './components/Header.jsx';
import StatsBar from './components/StatsBar.jsx';
import ComparisonPanel from './components/ComparisonPanel.jsx';
import MapView from './components/MapView.jsx';
import TrendChart from './components/TrendChart.jsx';
import AlertFeed from './components/AlertFeed.jsx';
import NearbyTowns from './components/NearbyTowns.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  // One hook drives every district HQ and sub-town, so the whole dashboard
  // stays on a single synchronized refresh cycle.
  const { zoneStates, points, loading, error, lastUpdated, refresh } = useHeatData();

  return (
    <div className="min-h-screen">
      <Header lastUpdated={lastUpdated} onRefreshAll={refresh} refreshing={loading} />

      <main className="mx-auto max-w-7xl space-y-6 px-5 py-8 sm:px-8">
        <StatsBar zoneStates={zoneStates} />

        <ComparisonPanel zoneStates={zoneStates} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <MapView points={points} loading={loading} />
          </div>
          <div className="lg:col-span-2">
            <TrendChart zoneStates={zoneStates} />
          </div>
        </div>

        <AlertFeed zoneStates={zoneStates} />

        <NearbyTowns points={points} loading={loading} error={error} />
      </main>

      <Footer />
    </div>
  );
}
