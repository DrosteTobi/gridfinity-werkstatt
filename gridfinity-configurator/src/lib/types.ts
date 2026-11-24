export type Locale = "de" | "en";

export type ModuleCategory = "bin" | "baseplate" | "divider";

export interface CatalogModule {
  id: string;
  category: ModuleCategory;
  width: number;
  depth: number;
  /** Gridfinity height units (U); baseplates/dividers use 0 */
  heightU: number;
  priceCents: number;
  color: string;
}

export interface PlacedModule {
  instanceId: string;
  moduleId: string;
  x: number;
  y: number;
  layer: number;
}

/** Planner drawer: user enters cm; width/depth/layers are derived units. */
export interface DrawerSize {
  /** Inner width in centimeters (user input). */
  widthCm: number;
  /** Inner depth in centimeters (user input). */
  depthCm: number;
  /** Inner height in centimeters (optional). */
  heightCm: number | null;
  /** Derived Gridfinity units (floor of cm ÷ 4.2). */
  width: number;
  depth: number;
  layers: number;
}

export interface BomLine {
  moduleId: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface OrderItemSnapshot {
  moduleId: string;
  nameDe: string;
  nameEn: string;
  width: number;
  depth: number;
  heightU: number;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface CustomerContact {
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}

export interface OrderRecord {
  id: string;
  createdAt: string;
  locale: Locale;
  customer: CustomerContact;
  drawer: DrawerSize;
  items: OrderItemSnapshot[];
  placements: PlacedModule[];
  totalCents: number;
  currency: "EUR";
  status: "new" | "reviewed" | "fulfilled";
}
