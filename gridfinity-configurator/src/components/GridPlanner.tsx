"use client";

import { useCallback, useRef, useState } from "react";
import { useConfigurator } from "@/context/ConfiguratorContext";
import { catalogById } from "@/lib/catalog";
import { canPlace, fillRatio } from "@/lib/geometry";
import { moduleName, t } from "@/lib/i18n";

const CELL = 52;

export function GridPlanner() {
  const {
    locale,
    drawer,
    placements,
    selectedModuleId,
    activeLayer,
    selectedInstanceId,
    setSelectedInstanceId,
    placeAt,
    moveInstance,
    removeInstance,
    clearLayer,
    placementError,
  } = useConfigurator();

  const [dragId, setDragId] = useState<string | null>(null);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const layerPlacements = placements.filter((p) => p.layer === activeLayer);
  const fill = Math.round(fillRatio(drawer, placements, activeLayer) * 100);

  const cellFromPointer = useCallback(
    (clientX: number, clientY: number, width: number, depth: number) => {
      const board = boardRef.current;
      if (!board) return null;
      const rect = board.getBoundingClientRect();
      const x = Math.floor((clientX - rect.left) / CELL);
      const y = Math.floor((clientY - rect.top) / CELL);
      const maxX = drawer.width - width;
      const maxY = drawer.depth - depth;
      return {
        x: Math.max(0, Math.min(maxX, x)),
        y: Math.max(0, Math.min(maxY, y)),
      };
    },
    [drawer.width, drawer.depth],
  );

  const previewMod = selectedModuleId ? catalogById[selectedModuleId] : null;
  const previewOk =
    hover &&
    previewMod &&
    !dragId &&
    canPlace(
      drawer,
      placements,
      selectedModuleId!,
      hover.x,
      hover.y,
      activeLayer,
    );

  return (
    <section className="workshop-panel p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-3xl uppercase tracking-wide text-ink">
          {t(locale, "gridTitle")}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-muted">
            {t(locale, "fill")}: {fill}% · {drawer.width * 42}×{drawer.depth * 42}{" "}
            mm
          </span>
          <button
            type="button"
            className="btn-ghost text-sm"
            onClick={() => clearLayer(activeLayer)}
          >
            {t(locale, "clearLayer")}
          </button>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted">{t(locale, "rotateHint")}</p>
      {placementError && (
        <p className="mt-2 font-mono text-sm text-[var(--danger)]" role="status">
          {t(locale, "overlap")}
        </p>
      )}

      <div className="mt-5 overflow-auto">
        <div
          ref={boardRef}
          className="relative touch-none select-none"
          style={{
            width: drawer.width * CELL,
            height: drawer.depth * CELL,
            background:
              "linear-gradient(145deg, #1a1f24, #15191d), repeating-linear-gradient(0deg, transparent, transparent 43px, var(--grid-line) 43px, var(--grid-line) 44px), repeating-linear-gradient(90deg, transparent, transparent 43px, var(--grid-line) 43px, var(--grid-line) 44px)",
            boxShadow: "inset 0 0 0 1px rgba(201,162,39,0.25)",
          }}
          onPointerMove={(e) => {
            if (dragId) {
              const inst = placements.find((p) => p.instanceId === dragId);
              const mod = inst ? catalogById[inst.moduleId] : null;
              if (!mod) return;
              const cell = cellFromPointer(e.clientX, e.clientY, mod.width, mod.depth);
              if (cell) setHover(cell);
              return;
            }
            if (!previewMod) {
              setHover(null);
              return;
            }
            const cell = cellFromPointer(
              e.clientX,
              e.clientY,
              previewMod.width,
              previewMod.depth,
            );
            setHover(cell);
          }}
          onPointerLeave={() => {
            if (!dragId) setHover(null);
          }}
          onPointerUp={(e) => {
            if (dragId) {
              const inst = placements.find((p) => p.instanceId === dragId);
              const mod = inst ? catalogById[inst.moduleId] : null;
              if (inst && mod) {
                const cell = cellFromPointer(
                  e.clientX,
                  e.clientY,
                  mod.width,
                  mod.depth,
                );
                if (cell) moveInstance(dragId, cell.x, cell.y);
              }
              setDragId(null);
              setHover(null);
              return;
            }
            if (!previewMod) return;
            const cell =
              hover ??
              cellFromPointer(
                e.clientX,
                e.clientY,
                previewMod.width,
                previewMod.depth,
              );
            if (!cell) return;
            placeAt(cell.x, cell.y);
          }}
        >
          {Array.from({ length: drawer.width * drawer.depth }).map((_, i) => {
            const x = i % drawer.width;
            const y = Math.floor(i / drawer.width);
            return (
              <div
                key={`${x}-${y}`}
                className="absolute border border-[rgba(138,148,156,0.08)]"
                style={{
                  left: x * CELL,
                  top: y * CELL,
                  width: CELL,
                  height: CELL,
                }}
              />
            );
          })}

          {hover && previewMod && !dragId && (
            <div
              className={`pointer-events-none absolute ${previewOk ? "grid-cell-pulse" : ""}`}
              style={{
                left: hover.x * CELL + 2,
                top: hover.y * CELL + 2,
                width: previewMod.width * CELL - 4,
                height: previewMod.depth * CELL - 4,
                background: previewOk
                  ? `${previewMod.color}99`
                  : "rgba(196,92,74,0.35)",
                outline: previewOk
                  ? "1px solid rgba(201,162,39,0.7)"
                  : "1px solid rgba(196,92,74,0.8)",
              }}
            />
          )}

          {layerPlacements.map((p) => {
            const mod = catalogById[p.moduleId];
            if (!mod) return null;
            const selected = selectedInstanceId === p.instanceId;
            const dragging = dragId === p.instanceId;
            const showAt =
              dragging && hover
                ? hover
                : { x: p.x, y: p.y };
            return (
              <button
                key={p.instanceId}
                type="button"
                className="absolute cursor-grab touch-none border border-black/40 text-left active:cursor-grabbing"
                style={{
                  left: showAt.x * CELL + 2,
                  top: showAt.y * CELL + 2,
                  width: mod.width * CELL - 4,
                  height: mod.depth * CELL - 4,
                  background: mod.color,
                  outline: selected
                    ? "2px solid var(--brass-hot)"
                    : "1px solid rgba(255,255,255,0.12)",
                  zIndex: dragging ? 5 : 2,
                  boxShadow: selected
                    ? "0 8px 20px rgba(0,0,0,0.35)"
                    : "inset 0 1px 0 rgba(255,255,255,0.1)",
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  (e.target as HTMLElement).setPointerCapture(e.pointerId);
                  setSelectedInstanceId(p.instanceId);
                  setDragId(p.instanceId);
                  setHover({ x: p.x, y: p.y });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Delete" || e.key === "Backspace") {
                    removeInstance(p.instanceId);
                  }
                }}
                aria-label={moduleName(p.moduleId, locale)}
              >
                <span className="block p-1 font-mono text-[10px] leading-tight text-white/90 drop-shadow">
                  {mod.width}×{mod.depth}
                  {mod.heightU > 0 ? ` ${mod.heightU}U` : ""}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedInstanceId && (
        <div className="mt-4">
          <button
            type="button"
            className="btn-ghost text-sm"
            onClick={() => removeInstance(selectedInstanceId)}
          >
            {t(locale, "remove")}
          </button>
        </div>
      )}
    </section>
  );
}
