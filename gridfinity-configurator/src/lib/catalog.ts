import type { CatalogModule } from "./types";

/** Standard Gridfinity modules with placeholder EUR prices (cents). */
export const CATALOG: CatalogModule[] = [
  // Bins — warm workshop palette (steel, brass, copper, olive, slate)
  { id: "bin-1x1-3u", category: "bin", width: 1, depth: 1, heightU: 3, priceCents: 290, color: "#6b7c86" },
  { id: "bin-1x2-3u", category: "bin", width: 1, depth: 2, heightU: 3, priceCents: 390, color: "#7a8b74" },
  { id: "bin-1x3-3u", category: "bin", width: 1, depth: 3, heightU: 3, priceCents: 490, color: "#8a7355" },
  { id: "bin-1x4-3u", category: "bin", width: 1, depth: 4, heightU: 3, priceCents: 590, color: "#9a6b4f" },
  { id: "bin-2x2-3u", category: "bin", width: 2, depth: 2, heightU: 3, priceCents: 690, color: "#5c6e7a" },
  { id: "bin-2x2-6u", category: "bin", width: 2, depth: 2, heightU: 6, priceCents: 990, color: "#4a5d68" },
  { id: "bin-2x3-3u", category: "bin", width: 2, depth: 3, heightU: 3, priceCents: 890, color: "#6e7f5c" },
  { id: "bin-2x4-3u", category: "bin", width: 2, depth: 4, heightU: 3, priceCents: 1090, color: "#7d6a4e" },
  { id: "bin-3x3-3u", category: "bin", width: 3, depth: 3, heightU: 3, priceCents: 1290, color: "#556670" },
  { id: "bin-3x4-3u", category: "bin", width: 3, depth: 4, heightU: 3, priceCents: 1590, color: "#6a5a48" },
  { id: "bin-4x4-3u", category: "bin", width: 4, depth: 4, heightU: 3, priceCents: 1990, color: "#4e5c64" },
  // Baseplates
  { id: "base-2x2", category: "baseplate", width: 2, depth: 2, heightU: 0, priceCents: 450, color: "#3d4449" },
  { id: "base-3x3", category: "baseplate", width: 3, depth: 3, heightU: 0, priceCents: 750, color: "#3d4449" },
  { id: "base-4x4", category: "baseplate", width: 4, depth: 4, heightU: 0, priceCents: 1100, color: "#3d4449" },
  { id: "base-5x5", category: "baseplate", width: 5, depth: 5, heightU: 0, priceCents: 1550, color: "#3d4449" },
  { id: "base-6x4", category: "baseplate", width: 6, depth: 4, heightU: 0, priceCents: 1650, color: "#3d4449" },
  // Dividers
  { id: "div-1x2", category: "divider", width: 1, depth: 2, heightU: 0, priceCents: 190, color: "#a89060" },
  { id: "div-2x2", category: "divider", width: 2, depth: 2, heightU: 0, priceCents: 250, color: "#a89060" },
];

export const catalogById = Object.fromEntries(
  CATALOG.map((m) => [m.id, m]),
) as Record<string, CatalogModule>;

export function formatEur(cents: number, locale: string): string {
  return new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
