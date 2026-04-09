import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";
import type {
  FleetDelivery,
  FleetDeliveryUpdatePatch,
  FleetShift,
} from "../types/fleet";

const DEFAULT_DB_NAME = "fleet.db";

type ShiftRow = {
  id: string;
  date: string;
  vehicle_id: string;
  vehicle_label: string;
  created_at: number;
  updated_at: number;
};

type DeliveryRow = {
  id: string;
  shift_id: string;
  destination_name: string;
  destination_type: string;
  products_json: string;
  status: string;
  scheduled_window: string;
  created_at: number;
  updated_at: number;
};

function nowMs(): number {
  return Date.now();
}

function deliveryToRow(d: FleetDelivery, shiftId: string): DeliveryRow {
  return {
    id: d.id,
    shift_id: shiftId,
    destination_name: d.destinationName,
    destination_type: d.destinationType,
    products_json: JSON.stringify(d.products),
    status: d.status,
    scheduled_window: d.scheduledWindow,
    created_at: d.createdAt,
    updated_at: d.updatedAt,
  };
}

async function ensureSchema(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS fleet_shift (
      id TEXT PRIMARY KEY NOT NULL,
      date TEXT NOT NULL,
      vehicle_id TEXT NOT NULL,
      vehicle_label TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS fleet_delivery (
      id TEXT PRIMARY KEY NOT NULL,
      shift_id TEXT NOT NULL,
      destination_name TEXT NOT NULL,
      destination_type TEXT NOT NULL,
      products_json TEXT NOT NULL,
      status TEXT NOT NULL,
      scheduled_window TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (shift_id) REFERENCES fleet_shift(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_fleet_delivery_shift ON fleet_delivery(shift_id);
  `);
}

function normalizeShiftForInsert(shift: FleetShift): FleetShift {
  const t = nowMs();
  return {
    ...shift,
    createdAt: shift.createdAt ?? t,
    updatedAt: shift.updatedAt ?? t,
    deliveries: shift.deliveries.map((d, i) => {
      const td = t + i;
      return {
        ...d,
        createdAt: d.createdAt ?? td,
        updatedAt: d.updatedAt ?? td,
      };
    }),
  };
}

/**
 * SQLite helpers for {@link FleetShift} (shift row + nested deliveries).
 * Uses `fleet_shift` / `fleet_delivery` tables; enable foreign keys via migration.
 */
export const SQLiteDbUtil = {
  /** Default file name used by {@link initDatabase}. */
  defaultDatabaseName: DEFAULT_DB_NAME,

  /**
   * Open the DB file and create tables if needed.
   */
  async initDatabase(
    databaseName: string = DEFAULT_DB_NAME,
  ): Promise<SQLiteDatabase> {
    const db = await openDatabaseAsync(databaseName);
    await db.execAsync("PRAGMA foreign_keys = ON;");
    await ensureSchema(db);
    return db;
  },

  /**
   * Insert a shift and all its deliveries. Throws if the shift id already exists.
   */
  async insertFleetShift(db: SQLiteDatabase, shift: FleetShift): Promise<void> {
    const existing = await db.getFirstAsync<{ c: number }>(
      "SELECT 1 AS c FROM fleet_shift WHERE id = ?",
      [shift.id],
    );
    if (existing) {
      throw new Error(`FleetShift already exists: ${shift.id}`);
    }

    const s = normalizeShiftForInsert(shift);

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT INTO fleet_shift (id, date, vehicle_id, vehicle_label, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [s.id, s.date, s.vehicleId, s.vehicleLabel, s.createdAt, s.updatedAt],
      );
      for (const d of s.deliveries) {
        const r = deliveryToRow(d, s.id);
        await db.runAsync(
          `INSERT INTO fleet_delivery (
            id, shift_id, destination_name, destination_type, products_json,
            status, scheduled_window, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            r.id,
            r.shift_id,
            r.destination_name,
            r.destination_type,
            r.products_json,
            r.status,
            r.scheduled_window,
            r.created_at,
            r.updated_at,
          ],
        );
      }
    });
  },

  /**
   * Update shift metadata and replace all deliveries for that shift with `shift.deliveries`.
   */
  async updateFleetShift(db: SQLiteDatabase, shift: FleetShift): Promise<void> {
    const t = nowMs();
    const s: FleetShift = { ...shift, updatedAt: t };

    await db.withTransactionAsync(async () => {
      const res = await db.runAsync(
        `UPDATE fleet_shift SET
          date = ?, vehicle_id = ?, vehicle_label = ?, updated_at = ?
         WHERE id = ?`,
        [s.date, s.vehicleId, s.vehicleLabel, s.updatedAt, s.id],
      );
      if (res.changes === 0) {
        throw new Error(`FleetShift not found: ${s.id}`);
      }

      await db.runAsync("DELETE FROM fleet_delivery WHERE shift_id = ?", [
        s.id,
      ]);

      for (const d of s.deliveries) {
        const r = deliveryToRow(d, s.id);
        await db.runAsync(
          `INSERT INTO fleet_delivery (
            id, shift_id, destination_name, destination_type, products_json,
            status, scheduled_window, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            r.id,
            r.shift_id,
            r.destination_name,
            r.destination_type,
            r.products_json,
            r.status,
            r.scheduled_window,
            r.created_at,
            r.updated_at,
          ],
        );
      }
    });
  },

  /**
   * Delete a shift and its deliveries (FK cascade).
   */
  async deleteFleetShift(db: SQLiteDatabase, shiftId: string): Promise<void> {
    const res = await db.runAsync("DELETE FROM fleet_shift WHERE id = ?", [
      shiftId,
    ]);
    if (res.changes === 0) {
      throw new Error(`FleetShift not found: ${shiftId}`);
    }
  },

  /**
   * Patch one delivery by id (e.g. status). Always sets `updatedAt` to now.
   */
  async updateFleetDelivery(
    db: SQLiteDatabase,
    deliveryId: string,
    patch: FleetDeliveryUpdatePatch,
  ): Promise<void> {
    const row = await db.getFirstAsync<DeliveryRow>(
      "SELECT * FROM fleet_delivery WHERE id = ?",
      [deliveryId],
    );
    if (!row) {
      throw new Error(`FleetDelivery not found: ${deliveryId}`);
    }

    let products: FleetDelivery["products"];
    try {
      products = JSON.parse(row.products_json) as FleetDelivery["products"];
    } catch {
      products = [];
    }

    const merged: FleetDelivery = {
      id: row.id,
      destinationName: patch.destinationName ?? row.destination_name,
      destinationType:
        (patch.destinationType as FleetDelivery["destinationType"]) ??
        (row.destination_type as FleetDelivery["destinationType"]),
      products: patch.products ?? products,
      status:
        (patch.status as FleetDelivery["status"]) ??
        (row.status as FleetDelivery["status"]),
      scheduledWindow: patch.scheduledWindow ?? row.scheduled_window,
      createdAt: row.created_at,
      updatedAt: nowMs(),
    };

    const r = deliveryToRow(merged, row.shift_id);
    await db.runAsync(
      `UPDATE fleet_delivery SET
        destination_name = ?, destination_type = ?, products_json = ?,
        status = ?, scheduled_window = ?, updated_at = ?
       WHERE id = ?`,
      [
        r.destination_name,
        r.destination_type,
        r.products_json,
        r.status,
        r.scheduled_window,
        r.updated_at,
        deliveryId,
      ],
    );
  },

  /** Load a shift and deliveries (optional helper for verifying persistence). */
  async getFleetShiftById(
    db: SQLiteDatabase,
    shiftId: string,
  ): Promise<FleetShift | null> {
    const shift = await db.getFirstAsync<ShiftRow>(
      "SELECT * FROM fleet_shift WHERE id = ?",
      [shiftId],
    );
    if (!shift) return null;

    const dRows = await db.getAllAsync<DeliveryRow>(
      "SELECT * FROM fleet_delivery WHERE shift_id = ? ORDER BY created_at ASC",
      [shiftId],
    );

    const deliveries: FleetDelivery[] = dRows.map((row) => ({
      id: row.id,
      destinationName: row.destination_name,
      destinationType: row.destination_type as FleetDelivery["destinationType"],
      products: JSON.parse(row.products_json) as FleetDelivery["products"],
      status: row.status as FleetDelivery["status"],
      scheduledWindow: row.scheduled_window,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return {
      id: shift.id,
      date: shift.date,
      vehicleId: shift.vehicle_id,
      vehicleLabel: shift.vehicle_label,
      createdAt: shift.created_at,
      updatedAt: shift.updated_at,
      deliveries,
    };
  },
};
