/**
 * Builds a small square GeoJSON Polygon (~4-5 km²) centered on a lat/lon pair,
 * in the [lon, lat] winding order the FortyGuard API expects for `polygon_aoi`.
 *
 * @param {number} lat
 * @param {number} lon
 * @param {number} halfSideDeg - half the box's side length, in degrees (~0.0105 ≈ 1.15 km)
 */
export function buildPolygonAOI(lat, lon, halfSideDeg = 0.0105) {
  const north = lat + halfSideDeg;
  const south = lat - halfSideDeg;
  const east = lon + halfSideDeg;
  const west = lon - halfSideDeg;

  return {
    type: 'Polygon',
    coordinates: [
      [
        [west, north],
        [east, north],
        [east, south],
        [west, south],
        [west, north], // close the ring
      ],
    ],
  };
}
