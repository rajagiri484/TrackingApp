import NetInfo from "@react-native-community/netinfo";
import { useCallback, useEffect, useState } from "react";
import type { FleetDelivery, FleetShift } from "../../types/fleet";
import { STATIC_SHIFT } from "../../pages/Shift/shiftStaticData";
import { useFleetShiftDb } from "../useFleetShiftDb";

const LANDING_SHIFT_ID = STATIC_SHIFT.id;

/**
 * When the "API" returns the same mock manifest on every fetch, we must not
 * overwrite SQLite with that payload blindly — local delivery rows may have
 * newer {@link FleetDelivery.updatedAt} after Complete/Fail. Prefer the newer row per id.
 */
function mergeShiftKeepingNewerDeliveries(
  cached: FleetShift | null,
  remote: FleetShift,
): FleetShift {
  if (!cached?.deliveries?.length || cached.id !== remote.id) {
    return remote;
  }
  const localById = new Map(cached.deliveries.map((d) => [d.id, d]));
  return {
    ...remote,
    createdAt: cached.createdAt,
    updatedAt: Math.max(remote.updatedAt, cached.updatedAt),
    deliveries: remote.deliveries.map((rd) => {
      const ld = localById.get(rd.id);
      if (!ld) return rd;
      return ld.updatedAt > rd.updatedAt ? ld : rd;
    }),
  };
}

async function isInternetAvailable(): Promise<boolean> {
  const state = await NetInfo.fetch();
  if (state.isConnected !== true) return false;
  if (state.isInternetReachable === false) return false;
  return true;
}

const useLanding = () => {
  const { loadShiftById, persistShift, updateDeliveryStatus } =
    useFleetShiftDb();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FleetShift | null>(null);

  const getData = useCallback(async () => {
    return await new Promise<FleetShift>((resolve) =>
      setTimeout(resolve, 2000),
    ).then(() => STATIC_SHIFT);
  }, []);

  const refreshFromDb = useCallback(async () => {
    const cached = await loadShiftById(LANDING_SHIFT_ID);
    if (cached) setData(cached);
  }, [loadShiftById]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const online = await isInternetAvailable();
      const cached = await loadShiftById(LANDING_SHIFT_ID);
      const hasCache =
        cached != null && cached.deliveries && cached.deliveries.length > 0;

      if (!online && hasCache) {
        setData(cached);
        setIsLoading(false);
        return;
      }

      if (!online && !hasCache) {
        setError("No internet connection and no saved shift on this device.");
        setData(null);
        setIsLoading(false);
        return;
      }

      if (online && hasCache) {
        setData(cached);
      }

      const response = await getData();
      //   const toPersist = mergeShiftKeepingNewerDeliveries(
      //     hasCache ? cached : null,
      //     response,
      //   );
      //   await persistShift(toPersist);
      setData(response);
    } catch {
      const cached = await loadShiftById(LANDING_SHIFT_ID);
      if (cached?.deliveries?.length) {
        setData(cached);
        setError(null);
      } else {
        setError("Something went wrong");
        setData(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [getData, loadShiftById, persistShift]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const onComplete = useCallback(
    async (delivery: FleetDelivery) => {
      try {
        await updateDeliveryStatus(delivery.id, "COMPLETED");
        await refreshFromDb();
      } catch (e) {
        console.warn("onComplete DB update failed", e);
      }
    },
    [refreshFromDb, updateDeliveryStatus],
  );

  const onFail = useCallback(
    async (delivery: FleetDelivery) => {
      try {
        await updateDeliveryStatus(delivery.id, "FAILED");
        await refreshFromDb();
      } catch (e) {
        console.warn("onFail DB update failed", e);
      }
    },
    [refreshFromDb, updateDeliveryStatus],
  );

  return {
    data,
    isLoading,
    error,
    onComplete,
    onFail,
    refetch: fetchData,
  };
};

export default useLanding;
