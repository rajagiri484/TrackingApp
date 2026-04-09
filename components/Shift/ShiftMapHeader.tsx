import { useCallback, useEffect, useMemo, useRef } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import MapView, {
  Circle,
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import { useShiftMapHeader } from "../../customHooks/useShiftMapHeader";
import { regionContainingPoints } from "../../utils/mapRegion";
import type { LatLng } from "../../utils/fetchDrivingRoute";

/** Always at least start→end so a line shows while OSRM loads or if it fails. */
function routeLineCoordinates(
  polyline: LatLng[],
  start: LatLng,
  end: LatLng,
): LatLng[] {
  if (polyline.length >= 2) return polyline;
  return [start, end];
}

function pointsToFrameRoute(
  polyline: LatLng[],
  start: LatLng,
  end: LatLng,
): LatLng[] {
  return routeLineCoordinates(polyline, start, end);
}

export function ShiftMapHeader() {
  const mapRef = useRef<MapView>(null);
  const {
    phase,
    region,
    coords,
    circleRadiusM,
    routePolyline,
    routeStart,
    routeEnd,
  } = useShiftMapHeader();

  const lineCoords = useMemo(
    () => routeLineCoordinates(routePolyline, routeStart, routeEnd),
    [routePolyline, routeStart, routeEnd],
  );

  /** Fresh array reference helps Google Maps pick up coordinate updates. */
  const polylinePoints = useMemo(() => [...lineCoords], [lineCoords]);

  const applyRouteZoom = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const pts = pointsToFrameRoute(routePolyline, routeStart, routeEnd);
    if (pts.length < 2) return;
    const next = regionContainingPoints(pts, 1.7);
    map.animateToRegion(next, 350);
  }, [routePolyline, routeStart, routeEnd]);

  useEffect(() => {
    const id = setTimeout(() => applyRouteZoom(), 120);
    return () => clearTimeout(id);
  }, [applyRouteZoom]);

  if (phase === "loading") {
    return (
      <View style={styles.fallbackBox}>
        <ActivityIndicator size="small" color="#2563eb" />
        <Text style={styles.loadingText}>Getting your location…</Text>
      </View>
    );
  }

  if (phase === "denied") {
    return (
      <View style={styles.fallbackBox} accessibilityRole="text">
        <Text style={styles.fallbackTitle}>Map</Text>
        <Text style={styles.fallbackBody}>
          Location access is off. Enable it in settings to see your position
          here.
        </Text>
      </View>
    );
  }

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={region}
      onMapReady={() => {
        setTimeout(applyRouteZoom, 80);
      }}
      mapPadding={{ top: 28, right: 20, bottom: 28, left: 20 }}
      showsUserLocation
      showsMyLocationButton={false}
      toolbarEnabled={false}
    >
      <Marker coordinate={routeStart} title="Route start" pinColor="green" />
      <Marker coordinate={routeEnd} title="Route end" pinColor="red" />
      {coords ? (
        <Circle
          center={coords}
          radius={circleRadiusM}
          strokeColor="rgba(37, 99, 235, 0.45)"
          fillColor="rgba(37, 99, 235, 0.08)"
          zIndex={1}
        />
      ) : null}
      {polylinePoints.length >= 2 ? (
        <Polyline
          key={`pl-${polylinePoints.length}-${polylinePoints[0].latitude}`}
          coordinates={polylinePoints}
          strokeColor="#1d4ed8"
          strokeWidth={8}
          lineCap="round"
          lineJoin="round"
          geodesic
          zIndex={3}
        />
      ) : null}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: 240,
    borderRadius: 12,
    overflow: "hidden",
  },
  fallbackBox: {
    minHeight: 240,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  fallbackTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  fallbackBody: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
  },
  loadingText: {
    fontSize: 14,
    color: "#64748b",
  },
});
