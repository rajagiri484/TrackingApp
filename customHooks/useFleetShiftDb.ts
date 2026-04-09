import { useCallback } from "react";
import type { DeliveryStatus, FleetShift } from "../types/fleet";
import { FleetDatabase } from "../storage/fleetDatabase";

/**
 * React hook wrapping {@link FleetDatabase} for shift + delivery persistence.
 * No need to call {@link FleetDatabase.init} here: every FleetDatabase method
 * already resolves the shared DB via an internal one-time open.
 */
export function useFleetShiftDb() {
  const loadShiftById = useCallback((shiftId: string) => {
    return FleetDatabase.getFleetShiftById(shiftId);
  }, []);

  const persistShift = useCallback(async (shift: FleetShift) => {
    const existing = await FleetDatabase.getFleetShiftById(shift.id);
    if (existing) {
      await FleetDatabase.updateFleetShift(shift);
    } else {
      await FleetDatabase.insertFleetShift(shift);
    }
  }, []);

  const updateDeliveryStatus = useCallback(
    (deliveryId: string, status: DeliveryStatus) => {
      return FleetDatabase.updateFleetDelivery(deliveryId, { status });
    },
    [],
  );

  const deleteShift = useCallback((shiftId: string) => {
    return FleetDatabase.deleteFleetShift(shiftId);
  }, []);

  return {
    loadShiftById,
    persistShift,
    updateDeliveryStatus,
    deleteShift,
  };
}
