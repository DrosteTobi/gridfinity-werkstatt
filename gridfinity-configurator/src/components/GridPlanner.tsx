"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useConfigurator } from "@/context/ConfiguratorContext";
import { catalogById } from "@/lib/catalog";
import { canPlace, fillRatio } from "@/lib/geometry";
import { moduleName, t } from "@/lib/i18n";

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
  const [cell, setCell] = useState(48);
  const boardRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const layerPlacements = placements.filter((p) => p.layer === activeLayer);
  const fill =
    drawer.width > 0 && drawer.depth > 0
      ? Math.round(fillRatio(drawer, placements, activeLayer) * 100)
      : 0;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const update = () => {
      const pad = 16;
      const availW = Math.max(80, stage.clientWidth - pad);
      const availH = Math.max(80, stage.clientHeight - pad);
      if (drawer.width < 1 || drawer.depth < 1) {
        setCell(48);
        return;
      }
      const next = Math.floor(
        Math.min(availW / drawer.width, availH / drawer.depth),
      );
      setCell(Math.max(18, Math.min(96, next)));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [drawer.width, drawer.depth]);

  const cellFromPointer = useCallback(
    (clientX: number, clientY: number, width: number, depth: number) => {
      const board = boardRef.current;
      if (!board || drawer.width < 1 || drawer.depth < 1) return null;
      const rect = board.getBoundingClientRect();
      const x = Math.floor((clientX - rect.left) / cell);
      const y = Math.floor((clientY - rect.top) / cell);
      const maxX = drawer.width - width;
      const maxY = drawer.depth - depth;
      return {
        x: Math.max(0, Math.min(maxX, x)),
        y: Math.max(0, Math.min(maxY, y)),
      };
    },
    [drawer.width, drawer.depth, cell],
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
    <section className="workshop-panel flex h-full min-h-0 flex-col overflow-hidden p-3 md:p-4">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-2xl uppercase tracking-wide text-ink md:text-3xl">
          {t(locale, "gridTitle")}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-muted">
            {t(locale, "fill")}: {fill}% · {drawer.width}×{drawer.depth} U ·{" "}
            {drawer.widthCm}×{drawer.depthCm} cm
          </span>
          <button
            type="button"
            className="btn-ghost text-sm"
            onClick={() => clearLayer(activeLayer)}
          >
            {t(locale, "clearLayer")}
          </button>
          {selectedInstanceId && (
            <button
              type="button"
              className="btn-ghost text-sm"
              onClick={() => removeInstance(selectedInstanceId)}
            >
              {t(locale, "remove")}
            </button>
          )}
        </div>
      </div>
      {placementError && (
        <p className="mt-1 shrink-0 font-mono text-sm text-[var(--danger)]" role="status">
          {t(locale, "overlap")}
        </p>
      )}

      <div
        ref={stageRef}
        className="mt-3 flex min-h-0 flex-1 items-center justify-center overflow-hidden"
      >
        {drawer.width < 1 || drawer.depth < 1 ? (
          <p className="text-sm text-muted">{t(locale, "tooSmall")}</p>
        ) : (
          <div
            ref={boardRef}
            className="relative touch-none select-none"
            style={{
              width: drawer.width * cell,
              height: drawer.depth * cell,
              background: `
                linear-gradient(145deg, #1a1f24, #15191d),
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent ${cell - 1}px,
                  var(--grid-line) ${cell - 1}px,
                  var(--grid-line) ${cell}px
                ),
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent ${cell - 1}px,
                  var(--grid-line) ${cell - 1}px,
                  var(--grid-line) ${cell}px
                )
              `,
              boxShadow: "inset 0 0 0 1px rgba(201,162,39,0.25)",
            }}
            onPointerMove={(e) => {
              if (dragId) {
                const inst = placements.find((p) => p.instanceId === dragId);
                const mod = inst ? catalogById[inst.moduleId] : null;
                if (!mod) return;
                const next = cellFromPointer(
                  e.clientX,
                  e.clientY,
                  mod.width,
                  mod.depth,
                );
                if (next) setHover(next);
                return;
              }
              if (!previewMod) {
                setHover(null);
                return;
              }
              setHover(
                cellFromPointer(
                  e.clientX,
                  e.clientY,
                  previewMod.width,
                  previewMod.depth,
                ),
              );
            }}
            onPointerLeave={() => {
              if (!dragId) setHover(null);
            }}
            onPointerUp={(e) => {
              if (dragId) {
                const inst = placements.find((p) => p.instanceId === dragId);
                const mod = inst ? catalogById[inst.moduleId] : null;
                if (inst && mod) {
                  const next = cellFromPointer(
                    e.clientX,
                    e.clientY,
                    mod.width,
                    mod.depth,
                  );
                  if (next) moveInstance(dragId, next.x, next.y);
                }
                setDragId(null);
                setHover(null);
                return;
              }
              if (!previewMod) return;
              const next =
                hover ??
                cellFromPointer(
                  e.clientX,
                  e.clientY,
                  previewMod.width,
                  previewMod.depth,
                );
              if (!next) return;
              placeAt(next.x, next.y);
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
                    left: x * cell,
                    top: y * cell,
                    width: cell,
                    height: cell,
                  }}
                />
              );
            })}

            {hover && previewMod && !dragId && (
              <div
                className={`pointer-events-none absolute ${previewOk ? "grid-cell-pulse" : ""}`}
                style={{
                  left: hover.x * cell + 2,
                  top: hover.y * cell + 2,
                  width: previewMod.width * cell - 4,
                  height: previewMod.depth * cell - 4,
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
              const showAt = dragging && hover ? hover : { x: p.x, y: p.y };
              return (
                <button
                  key={p.instanceId}
                  type="button"
                  className="absolute cursor-grab touch-none border border-black/40 text-left active:cursor-grabbing"
                  style={{
                    left: showAt.x * cell + 2,
                    top: showAt.y * cell + 2,
                    width: mod.width * cell - 4,
                    height: mod.depth * cell - 4,
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
        )}
      </div>
    </section>
  );
}
