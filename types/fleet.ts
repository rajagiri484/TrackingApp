/** Fleet domain types (UI + SQLite). Timestamps are Unix ms. */

export type ProductType = "DIESEL" | "PETROL" | "DEF" | "BIO_DIESEL";

export type DestinationType = "HUB" | "TERMINAL" | "JOB_SITE";

export type DeliveryStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED";

export type FleetProductLine = {
  product: ProductType;
  gallons: number;
};

export type FleetDelivery = {
  id: string;
  destinationName: string;
  destinationType: DestinationType;
  products: FleetProductLine[];
  status: DeliveryStatus;
  scheduledWindow: string;
  createdAt: number;
  updatedAt: number;
};

export type FleetShift = {
  id: string;
  date: string;
  vehicleId: string;
  vehicleLabel: string;
  createdAt: number;
  updatedAt: number;
  deliveries: FleetDelivery[];
};

/** Allowed fields when patching a single delivery row. */
export type FleetDeliveryUpdatePatch = Partial<
  Pick<
    FleetDelivery,
    | "status"
    | "destinationName"
    | "destinationType"
    | "scheduledWindow"
    | "products"
  >
>;
