"use client";

import type { ModuleCategory } from "@/lib/types";

type Props = {
  width: number;
  depth: number;
  heightU: number;
  color: string;
  category: ModuleCategory;
  className?: string;
};

/** Compact isometric thumbnail so shoppers see the module shape at a glance. */
export function ModuleIsoPreview({
  width,
  depth,
  heightU,
  color,
  category,
  className = "",
}: Props) {
  const maxFoot = Math.max(width, depth, 1);
  const unit = 11 / maxFoot;
  const w = width * unit;
  const d = depth * unit;
  const h =
    category === "baseplate"
      ? Math.max(2.2, unit * 0.45)
      : category === "divider"
        ? Math.max(4, unit * 1.1)
        : Math.max(5, Math.min(heightU || 3, 6) * unit * 0.85);

  const ox = 22;
  const oy = 28;
  // Isometric: x right-down, y left-down
  const toIso = (x: number, y: number, z: number) => ({
    x: ox + (x - y) * 0.866,
    y: oy + (x + y) * 0.5 - z,
  });

  const top = [
    toIso(0, 0, h),
    toIso(w, 0, h),
    toIso(w, d, h),
    toIso(0, d, h),
  ];
  const right = [
    toIso(w, 0, h),
    toIso(w, 0, 0),
    toIso(w, d, 0),
    toIso(w, d, h),
  ];
  const left = [
    toIso(0, d, h),
    toIso(w, d, h),
    toIso(w, d, 0),
    toIso(0, d, 0),
  ];

  const poly = (pts: { x: number; y: number }[]) =>
    pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  const shade = (amount: number) => {
    const hex = color.replace("#", "");
    if (hex.length !== 6) return color;
    const n = parseInt(hex, 16);
    const r = Math.min(255, Math.max(0, ((n >> 16) & 255) + amount));
    const g = Math.min(255, Math.max(0, ((n >> 8) & 255) + amount));
    const b = Math.min(255, Math.max(0, (n & 255) + amount));
    return `rgb(${r},${g},${b})`;
  };

  return (
    <svg
      viewBox="0 0 44 40"
      width={44}
      height={40}
      className={`shrink-0 ${className}`}
      aria-hidden
    >
      <polygon points={poly(left)} fill={shade(-28)} stroke="rgba(0,0,0,0.25)" strokeWidth="0.4" />
      <polygon points={poly(right)} fill={shade(-12)} stroke="rgba(0,0,0,0.2)" strokeWidth="0.4" />
      <polygon
        points={poly(top)}
        fill={shade(18)}
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="0.5"
      />
      {category === "bin" && (
        <polygon
          points={poly([
            toIso(w * 0.18, d * 0.18, h + 0.01),
            toIso(w * 0.82, d * 0.18, h + 0.01),
            toIso(w * 0.82, d * 0.82, h + 0.01),
            toIso(w * 0.18, d * 0.82, h + 0.01),
          ])}
          fill="rgba(0,0,0,0.22)"
        />
      )}
    </svg>
  );
}
