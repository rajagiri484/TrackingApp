import type { FleetShift } from "../../types/fleet";

const T0 = 1_712_592_000_000; // 2024-04-08T12:00:00.000Z

/** Fixed manifest for static UI only. */
export const STATIC_SHIFT: FleetShift = {
  id: "shift_demo",
  date: "2026-04-08",
  vehicleId: "vh_1042",
  vehicleLabel: "Tanker 1042",
  createdAt: T0,
  updatedAt: T0,
  deliveries: [
    {
      id: "del_001",
      destinationName: "North Depot Hub",
      destinationType: "HUB",
      products: [
        { product: "DIESEL", gallons: 2500 },
        { product: "DEF", gallons: 400 },
      ],
      status: "PENDING",
      scheduledWindow: "06:00 – 08:00",
      createdAt: T0,
      updatedAt: T0,
    },
    {
      id: "del_002",
      destinationName: "Riverside Terminal",
      destinationType: "TERMINAL",
      products: [{ product: "PETROL", gallons: 3200 }],
      status: "PENDING",
      scheduledWindow: "09:30 – 11:00",
      createdAt: T0 + 1,
      updatedAt: T0 + 1,
    },
    {
      id: "del_003",
      destinationName: "Highway 9 Job Site",
      destinationType: "JOB_SITE",
      products: [
        { product: "DIESEL", gallons: 1800 },
        { product: "BIO_DIESEL", gallons: 600 },
      ],
      status: "IN_PROGRESS",
      scheduledWindow: "12:00 – 14:30",
      createdAt: T0 + 2,
      updatedAt: T0 + 2,
    },
  ],
};
