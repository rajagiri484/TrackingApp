import type { SQLiteDatabase } from "expo-sqlite";
import type { FleetDeliveryUpdatePatch, FleetShift } from "../types/fleet";
import { SQLiteDbUtil } from "./sqliteDbUtil";

let initPromise: Promise<SQLiteDatabase> | null = null;

/** Single shared open + schema migration; assigned only on first use. */
async function resolveDb(): Promise<SQLiteDatabase> {
  if (!initPromise) {
    initPromise = SQLiteDbUtil.initDatabase(SQLiteDbUtil.defaultDatabaseName);
  }
  return initPromise;
}

export const FleetDatabase = {
  /**
   * Optional eager open at app startup (e.g. from `App.tsx`). If you skip this,
   * the first insert/get/update will open the DB via {@link resolveDb} inside
   * each method — still only once per app lifetime.
   */
  init(databaseName?: string): Promise<SQLiteDatabase> {
    if (!initPromise) {
      initPromise = SQLiteDbUtil.initDatabase(
        databaseName ?? SQLiteDbUtil.defaultDatabaseName,
      );
    }
    return initPromise;
  },

  isInitialized(): boolean {
    return initPromise != null;
  },

  getDb(): Promise<SQLiteDatabase> {
    return resolveDb();
  },

  insertFleetShift(shift: FleetShift): Promise<void> {
    return resolveDb().then((db) => SQLiteDbUtil.insertFleetShift(db, shift));
  },

  updateFleetShift(shift: FleetShift): Promise<void> {
    return resolveDb().then((db) => SQLiteDbUtil.updateFleetShift(db, shift));
  },

  deleteFleetShift(shiftId: string): Promise<void> {
    return resolveDb().then((db) => SQLiteDbUtil.deleteFleetShift(db, shiftId));
  },

  updateFleetDelivery(
    deliveryId: string,
    patch: FleetDeliveryUpdatePatch,
  ): Promise<void> {
    return resolveDb().then((db) =>
      SQLiteDbUtil.updateFleetDelivery(db, deliveryId, patch),
    );
  },

  getFleetShiftById(shiftId: string): Promise<FleetShift | null> {
    return resolveDb().then((db) =>
      SQLiteDbUtil.getFleetShiftById(db, shiftId),
    );
  },
};
