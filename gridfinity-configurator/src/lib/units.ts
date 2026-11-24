/** Standard Gridfinity XY pitch. */
export const UNIT_MM = 42;

/** Standard Gridfinity height unit (bin wall / stack pitch). */
export const HEIGHT_U_MM = 7;

/** Typical bin height used when deriving stacking layers from drawer height. */
export const LAYER_HEIGHT_U = 3;

export const MAX_GRID_UNITS = 30;

/**
 * Largest integer Gridfinity XY units that fit inside an inner dimension in cm.
 * Uses millimetres so 4.2 cm → exactly 1 U. Floors; never rounds up.
 */
export function cmToGridUnits(cm: number): number {
  if (!Number.isFinite(cm) || cm <= 0) return 0;
  return Math.floor((cm * 10) / UNIT_MM);
}

/** Largest integer height-U that fits inside drawer inner height in cm. */
export function cmToHeightU(cm: number): number {
  if (!Number.isFinite(cm) || cm <= 0) return 0;
  return Math.floor((cm * 10) / HEIGHT_U_MM);
}

/**
 * Stacking layers that fit for typical 3U bins given height in cm.
 * Returns 1 when height is unset/too small; capped at 3 for the planner.
 */
export function cmToLayers(heightCm: number | null | undefined): number {
  if (heightCm == null || !Number.isFinite(heightCm) || heightCm <= 0) {
    return 1;
  }
  const heightU = cmToHeightU(heightCm);
  return Math.min(3, Math.max(1, Math.floor(heightU / LAYER_HEIGHT_U)));
}

export function clampGridUnits(units: number): number {
  if (units <= 0) return 0;
  return Math.min(MAX_GRID_UNITS, units);
}

export function unitsToMm(units: number): number {
  return units * UNIT_MM;
}

export function leftoverMm(cm: number, units: number): number {
  return Math.max(0, Math.round(cm * 10) - units * UNIT_MM);
}
