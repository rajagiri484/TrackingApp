export type LatLng = { latitude: number; longitude: number };

/** Cubbon Park vicinity */
export const BANGALORE_ROUTE_A: LatLng = {
  latitude: 12.9763,
  longitude: 77.5929,
};

/** Koramangala 5th Block vicinity */
export const BANGALORE_ROUTE_B: LatLng = {
  latitude: 12.9352,
  longitude: 77.6197,
};

type OsrmGeoJson = {
  routes?: Array<{
    geometry?: { coordinates?: [number, number][] };
  }>;
};

export async function fetchOsrmDrivingRoute(
  from: LatLng,
  to: LatLng,
): Promise<LatLng[]> {
  const straight: LatLng[] = [from, to];
  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${from.longitude},${from.latitude};${to.longitude},${to.latitude}` +
      `?overview=full&geometries=geojson`;
    const res = await fetch(url, {
      headers: { "User-Agent": "TrackingApp/1.0 (fleet-shift)" },
    });
    if (!res.ok) return straight;
    const data = (await res.json()) as OsrmGeoJson;
    const coords = data.routes?.[0]?.geometry?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) return straight;
    return coords.map(([lng, lat]) => ({ latitude: lat, longitude: lng }));
  } catch {
    return straight;
  }
}
