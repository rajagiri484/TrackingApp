export type MapPoint = { latitude: number; longitude: number };

/**
 * Region that contains all points with extra margin so markers aren’t clipped
 * at the edges of a small map view.
 */
export function regionContainingPoints(
  points: MapPoint[],
  paddingFactor = 1.65,
): {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
} {
  if (points.length === 0) {
    return {
      latitude: 12.97,
      longitude: 77.6,
      latitudeDelta: 0.09,
      longitudeDelta: 0.09,
    };
  }

  let minLat = points[0].latitude;
  let maxLat = points[0].latitude;
  let minLng = points[0].longitude;
  let maxLng = points[0].longitude;

  for (let i = 1; i < points.length; i++) {
    const p = points[i];
    minLat = Math.min(minLat, p.latitude);
    maxLat = Math.max(maxLat, p.latitude);
    minLng = Math.min(minLng, p.longitude);
    maxLng = Math.max(maxLng, p.longitude);
  }

  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;
  let latDelta = (maxLat - minLat) * paddingFactor;
  let lngDelta = (maxLng - minLng) * paddingFactor;

  const minLatDelta = 0.014;
  const minLngDelta = 0.014;
  if (latDelta < minLatDelta) latDelta = minLatDelta;
  if (lngDelta < minLngDelta) lngDelta = minLngDelta;

  return {
    latitude: centerLat,
    longitude: centerLng,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  };
}
