import { catalogById } from "./catalog";
import type { DrawerSize, PlacedModule } from "./types";

export function rectsOverlap(
  ax: number,
  ay: number,
  aw: number,
  ad: number,
  bx: number,
  by: number,
  bw: number,
  bd: number,
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bd && ay + ad > by;
}

export function canPlace(
  drawer: DrawerSize,
  placements: PlacedModule[],
  moduleId: string,
  x: number,
  y: number,
  layer: number,
  ignoreInstanceId?: string,
): boolean {
  const mod = catalogById[moduleId];
  if (!mod) return false;
  if (x < 0 || y < 0) return false;
  if (x + mod.width > drawer.width || y + mod.depth > drawer.depth) return false;
  if (layer < 0 || layer >= drawer.layers) return false;

  for (const p of placements) {
    if (p.layer !== layer) continue;
    if (ignoreInstanceId && p.instanceId === ignoreInstanceId) continue;
    const other = catalogById[p.moduleId];
    if (!other) continue;
    if (
      rectsOverlap(
        x,
        y,
        mod.width,
        mod.depth,
        p.x,
        p.y,
        other.width,
        other.depth,
      )
    ) {
      return false;
    }
  }
  return true;
}

export function occupiedCells(
  placements: PlacedModule[],
  layer: number,
): Set<string> {
  const cells = new Set<string>();
  for (const p of placements) {
    if (p.layer !== layer) continue;
    const mod = catalogById[p.moduleId];
    if (!mod) continue;
    for (let dx = 0; dx < mod.width; dx++) {
      for (let dy = 0; dy < mod.depth; dy++) {
        cells.add(`${p.x + dx},${p.y + dy}`);
      }
    }
  }
  return cells;
}

export function fillRatio(
  drawer: DrawerSize,
  placements: PlacedModule[],
  layer: number,
): number {
  const total = drawer.width * drawer.depth;
  if (total === 0) return 0;
  return occupiedCells(placements, layer).size / total;
}
