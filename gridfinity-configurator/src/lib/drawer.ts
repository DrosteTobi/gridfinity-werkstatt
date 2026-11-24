import type { DrawerSize } from "./types";
import {
  clampGridUnits,
  cmToGridUnits,
  cmToHeightU,
  cmToLayers,
} from "./units";

/** Default: ~36×28×7 cm → 8×6 units, 1 layer (3U fits). */
export const DEFAULT_DRAWER_CM = {
  widthCm: 36,
  depthCm: 28,
  heightCm: 7 as number | null,
};

export function deriveDrawer(
  widthCm: number,
  depthCm: number,
  heightCm: number | null,
): DrawerSize {
  const w = Number.isFinite(widthCm) ? widthCm : 0;
  const d = Number.isFinite(depthCm) ? depthCm : 0;
  const h =
    heightCm != null && Number.isFinite(heightCm) && heightCm > 0
      ? heightCm
      : null;

  return {
    widthCm: Math.round(w * 10) / 10,
    depthCm: Math.round(d * 10) / 10,
    heightCm: h == null ? null : Math.round(h * 10) / 10,
    width: clampGridUnits(cmToGridUnits(w)),
    depth: clampGridUnits(cmToGridUnits(d)),
    layers: cmToLayers(h),
  };
}

export function defaultDrawer(): DrawerSize {
  return deriveDrawer(
    DEFAULT_DRAWER_CM.widthCm,
    DEFAULT_DRAWER_CM.depthCm,
    DEFAULT_DRAWER_CM.heightCm,
  );
}

export function drawerHeightU(drawer: DrawerSize): number {
  if (drawer.heightCm == null) return 0;
  return cmToHeightU(drawer.heightCm);
}
