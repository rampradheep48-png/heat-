import { buildPolygonAOI } from '../utils/geo.js';

/**
 * The five districts the dashboard tracks. Each has a headquarters point plus
 * its taluk-headquarter sub-towns, so the map and the readings board show heat
 * variation *within* a district, not just between districts.
 *
 * Chennai has no taluk sub-towns in the traditional sense (single dense urban
 * corporation), so it is split by zone/area instead — flagged via `subKind`.
 *
 * `usesFortyGuard` marks the two zones we spend FortyGuard credits on. The
 * other three read from Open-Meteo, which keeps the hackathon quota intact
 * while still covering every district live.
 */
export const DISTRICTS = [
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
    usesFortyGuard: true,
    subKind: 'Taluk HQ',
    towns: [
      { id: 'thuraiyur', name: 'Thuraiyur', lat: 11.1333, lon: 78.6 },
      { id: 'manapparai', name: 'Manapparai', lat: 10.6075, lon: 78.42 },
      { id: 'lalgudi', name: 'Lalgudi', lat: 10.8747, lon: 78.8281 },
      { id: 'musiri', name: 'Musiri', lat: 10.9515, lon: 78.4413 },
      { id: 'srirangam', name: 'Srirangam', lat: 10.8624, lon: 78.6928 },
      { id: 'manachanallur', name: 'Manachanallur', lat: 10.9167, lon: 78.75 },
      { id: 'thottiyam', name: 'Thottiyam', lat: 11.0167, lon: 78.4333 },
    ],
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
      'A smaller town in the same interior heat belt, with roughly a tenth of Trichy’s population exposed to comparable peak temperatures.',
    usesFortyGuard: true,
    subKind: 'Taluk HQ',
    towns: [
      { id: 'ambur', name: 'Ambur', lat: 12.79, lon: 78.7167 },
      { id: 'vaniyambadi', name: 'Vaniyambadi', lat: 12.6833, lon: 78.6167 },
    ],
  },
  {
    id: 'vellore',
    name: 'Vellore',
    shortName: 'Vellore',
    kind: 'City',
    lat: 12.9165,
    lon: 79.1325,
    population: 185803,
    populationYear: 2011,
    densityLabel: 'Mid-density city',
    context:
      'A northern Tamil Nadu district centre ringed by leather-tanning and weaving towns, with a large informal outdoor workforce.',
    usesFortyGuard: false,
    subKind: 'Taluk HQ',
    towns: [
      { id: 'gudiyatham', name: 'Gudiyatham', lat: 12.945, lon: 78.87 },
      { id: 'katpadi', name: 'Katpadi', lat: 12.97, lon: 79.14 },
      { id: 'anaicut', name: 'Anaicut', lat: 12.8722, lon: 79.0244 },
      { id: 'pernambut', name: 'Pernambut', lat: 12.94, lon: 78.71 },
      { id: 'kv-kuppam', name: 'K.V. Kuppam', lat: 12.9333, lon: 78.9667 },
    ],
  },
  {
    id: 'chennai',
    name: 'Chennai',
    shortName: 'Chennai',
    kind: 'Metro',
    lat: 13.0827,
    lon: 80.2707,
    population: 4646732,
    populationYear: 2011,
    densityLabel: 'Dense coastal metro',
    context:
      'Tamil Nadu’s capital and by far its largest heat-exposed population — a coastal metro where high humidity pushes apparent temperature well above the dry-bulb reading.',
    usesFortyGuard: false,
    subKind: 'City zone',
    towns: [
      { id: 't-nagar', name: 'T. Nagar', lat: 13.0418, lon: 80.2341 },
      { id: 'anna-nagar', name: 'Anna Nagar', lat: 13.085, lon: 80.2101 },
      { id: 'adyar', name: 'Adyar', lat: 13.0067, lon: 80.257 },
      { id: 'tambaram', name: 'Tambaram', lat: 12.9229, lon: 80.1275 },
      { id: 'avadi', name: 'Avadi', lat: 13.1147, lon: 80.1098 },
    ],
  },
  {
    id: 'coimbatore',
    name: 'Coimbatore',
    shortName: 'Coimbatore',
    kind: 'City',
    lat: 11.0168,
    lon: 76.9558,
    population: 1061447,
    populationYear: 2011,
    densityLabel: 'High-density city',
    context:
      'A large western industrial city in the Noyyal basin, sheltered somewhat by the Western Ghats but with dense manufacturing and textile workforces exposed to indoor heat.',
    usesFortyGuard: false,
    subKind: 'Taluk HQ',
    towns: [
      { id: 'mettupalayam', name: 'Mettupalayam', lat: 11.2996, lon: 76.9364 },
      { id: 'pollachi', name: 'Pollachi', lat: 10.6589, lon: 77.0087 },
      { id: 'sulur', name: 'Sulur', lat: 11.025, lon: 77.125 },
      { id: 'kinathukadavu', name: 'Kinathukadavu', lat: 10.8167, lon: 77.0167 },
      { id: 'annur', name: 'Annur', lat: 11.2333, lon: 77.1 },
      { id: 'perur', name: 'Perur', lat: 10.9833, lon: 76.9167 },
    ],
  },
];

/**
 * The tracked zones — one per district headquarters. This is what the stats
 * bar, comparison panel, trend chart, and alert feed iterate over.
 */
export const ZONES = DISTRICTS.map(({ towns, subKind, ...d }) => ({
  ...d,
  polygon: buildPolygonAOI(d.lat, d.lon),
}));

/**
 * Every mappable point (district HQs + sub-towns) as one flat list. This is
 * what the map and the bulk Open-Meteo fetch iterate over.
 */
export const HEAT_POINTS = DISTRICTS.flatMap((d) => [
  {
    id: d.id,
    name: d.name,
    kind: 'district',
    kindLabel: 'District HQ',
    districtId: d.id,
    districtName: d.name,
    lat: d.lat,
    lon: d.lon,
    population: d.population,
  },
  ...d.towns.map((t) => ({
    id: `${d.id}--${t.id}`,
    name: t.name,
    kind: 'town',
    kindLabel: d.subKind,
    districtId: d.id,
    districtName: d.name,
    lat: t.lat,
    lon: t.lon,
    population: null,
  })),
]);

/** Most-exposed vs least-exposed district — the headline population contrast. */
const sortedByPopulation = [...ZONES].sort((a, b) => b.population - a.population);
export const MOST_EXPOSED = sortedByPopulation[0];
export const LEAST_EXPOSED = sortedByPopulation[sortedByPopulation.length - 1];
export const POPULATION_RATIO = (MOST_EXPOSED.population / LEAST_EXPOSED.population).toFixed(1);
