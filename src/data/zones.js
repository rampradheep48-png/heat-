import { buildPolygonAOI } from '../utils/geo.js';

/**
 * The two core comparison zones. Same hot interior Tamil Nadu climate belt,
 * same April/May 2026 heatwave events — population is the deliberate variable.
 */
export const ZONES = [
  {
    id: 'trichy',
    name: 'Tiruchirappalli',
    shortName: 'Trichy',
    kind: 'City',
    lat: 10.8155,
    lon: 78.6965,
    population: 847387,
    populationYear: 2011,
    densityLabel: 'High-density city',
    context:
      'A major interior Tamil Nadu city with dense wards, informal settlements, and a large outdoor-labour workforce.',
    polygon: buildPolygonAOI(10.8155, 78.6965),
  },
  {
    id: 'tirupattur',
    name: 'Tirupattur',
    shortName: 'Tirupattur',
    kind: 'Town',
    lat: 12.4927,
    lon: 78.5681,
    population: 83612,
    populationYear: 2011,
    densityLabel: 'Low-density town',
    context:
      'A smaller town in the same interior heat belt, with roughly a tenth of Trichy\u2019s population exposed to comparable peak temperatures.',
    polygon: buildPolygonAOI(12.4927, 78.5681),
  },
];

/**
 * Optional secondary / drill-down towns near each core zone. Not part of the
 * primary comparison — used only for the lightweight "explore nearby" lookup.
 * Fetched via Open-Meteo only, to avoid burning FortyGuard credits on towns
 * that aren't part of the core demo.
 */
export const SECONDARY_TOWNS = [
  { id: 'thuraiyur', name: 'Thuraiyur', nearZoneId: 'trichy', lat: 11.15, lon: 78.6 },
  { id: 'manapparai', name: 'Manapparai', nearZoneId: 'trichy', lat: 10.5975, lon: 78.4177 },
  { id: 'lalgudi', name: 'Lalgudi', nearZoneId: 'trichy', lat: 10.8747, lon: 78.8281 },
  { id: 'musiri', name: 'Musiri', nearZoneId: 'trichy', lat: 10.9515, lon: 78.4413 },
  { id: 'srirangam', name: 'Srirangam', nearZoneId: 'trichy', lat: 10.8624, lon: 78.6928 },
  { id: 'ambur', name: 'Ambur', nearZoneId: 'tirupattur', lat: 12.7833, lon: 78.7167 },
  { id: 'vaniyambadi', name: 'Vaniyambadi', nearZoneId: 'tirupattur', lat: 12.6833, lon: 78.6167 },
];

export const POPULATION_RATIO = (
  ZONES.find((z) => z.id === 'trichy').population /
  ZONES.find((z) => z.id === 'tirupattur').population
).toFixed(1);
