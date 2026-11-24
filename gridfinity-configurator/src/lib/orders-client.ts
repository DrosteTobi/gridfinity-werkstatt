import { catalogById } from "./catalog";
import { moduleNamesBoth } from "./i18n";
import type { OrderItemSnapshot, PlacedModule } from "./types";

/** Client-safe BOM helpers (no Node/db imports). */
export function buildBom(placements: PlacedModule[]): OrderItemSnapshot[] {
  const counts = new Map<string, number>();
  for (const p of placements) {
    counts.set(p.moduleId, (counts.get(p.moduleId) ?? 0) + 1);
  }
  const lines: OrderItemSnapshot[] = [];
  for (const [moduleId, quantity] of counts) {
    const mod = catalogById[moduleId];
    if (!mod) continue;
    const names = moduleNamesBoth(moduleId);
    lines.push({
      moduleId,
      nameDe: names.de,
      nameEn: names.en,
      width: mod.width,
      depth: mod.depth,
      heightU: mod.heightU,
      quantity,
      unitPriceCents: mod.priceCents,
      lineTotalCents: mod.priceCents * quantity,
    });
  }
  lines.sort((a, b) => a.moduleId.localeCompare(b.moduleId));
  return lines;
}

export function totalFromItems(items: OrderItemSnapshot[]): number {
  return items.reduce((sum, line) => sum + line.lineTotalCents, 0);
}
