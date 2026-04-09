import * as Location from "expo-location";
import { useEffect, useMemo, useState } from "react";
import {
  BANGALORE_ROUTE_A,
  BANGALORE_ROUTE_B,
  fetchOsrmDrivingRoute,
  type LatLng,
} from "../utils/fetchDrivingRoute";

const FALLBACK_COORDS = { latitude: 2.9794048, longitude: 77.627392 };
const REGION_DELTA = 0.06;

const USE_STATIC_MAP_CENTER =
  process.env.EXPO_PUBLIC_SHIFT_MAP_STATIC_CENTER === "true";

export type ShiftMapHeaderPhase = "loading" | "ready" | "denied";

type Coords = LatLng;

export type ShiftMapRegion = Coords & {
  latitudeDelta: number;
  longitudeDelta: number;
};

export type UseShiftMapHeaderResult = {
  phase: ShiftMapHeaderPhase;
  region: ShiftMapRegion;
  coords: Coords | null;
  circleRadiusM: number;
  /** Driving-style polyline between two fixed Bangalore points (OSRM). */
  routePolyline: LatLng[];
  routeStart: LatLng;
  routeEnd: LatLng;
};

function clampAccuracyMeters(accuracy: number | null): number {
  if (accuracy == null) return 120;
  return Math.min(Math.max(accuracy, 40), 400);
}

export function useShiftMapHeader(): UseShiftMapHeaderResult {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [accuracyM, setAccuracyM] = useState<number | null>(null);
  const [phase, setPhase] = useState<ShiftMapHeaderPhase>("loading");
  const [routePolyline, setRoutePolyline] = useState<LatLng[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const line = await fetchOsrmDrivingRoute(
        BANGALORE_ROUTE_A,
        BANGALORE_ROUTE_B,
      );
      if (!cancelled) setRoutePolyline(line);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (USE_STATIC_MAP_CENTER) {
      setCoords(FALLBACK_COORDS);
      setAccuracyM(null);
      setPhase("ready");
      return;
    }

    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;
      if (status !== "granted") {
        setPhase("denied");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      if (cancelled) return;
      setCoords({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      setAccuracyM(
        typeof pos.coords.accuracy === "number" && pos.coords.accuracy > 0
          ? pos.coords.accuracy
          : null,
      );
      setPhase("ready");
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const region = useMemo((): ShiftMapRegion => {
    const center = coords ?? FALLBACK_COORDS;
    return {
      ...center,
      latitudeDelta: REGION_DELTA,
      longitudeDelta: REGION_DELTA,
    };
  }, [coords]);

  const circleRadiusM = useMemo(
    () => clampAccuracyMeters(accuracyM),
    [accuracyM],
  );

  return {
    phase,
    region,
    coords,
    circleRadiusM,
    routePolyline,
    routeStart: BANGALORE_ROUTE_A,
    routeEnd: BANGALORE_ROUTE_B,
  };
}
