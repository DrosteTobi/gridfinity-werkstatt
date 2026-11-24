"use client";

import { useConfigurator } from "@/context/ConfiguratorContext";
import { drawerHeightU } from "@/lib/drawer";
import { t } from "@/lib/i18n";
import { leftoverMm } from "@/lib/units";

export function DrawerSetup() {
  const {
    locale,
    drawer,
    setDrawerCm,
    setLayers,
    activeLayer,
    setActiveLayer,
  } = useConfigurator();

  const heightU = drawerHeightU(drawer);
  const tooSmall = drawer.width < 1 || drawer.depth < 1;
  const leftoverW = leftoverMm(drawer.widthCm, drawer.width);
  const leftoverD = leftoverMm(drawer.depthCm, drawer.depth);

  return (
    <section className="shrink-0 border-b border-[rgba(138,148,156,0.18)] px-4 py-4">
      <h2 className="font-display text-2xl uppercase tracking-wide text-ink">
        {t(locale, "drawerTitle")}
      </h2>
      <p className="mt-1 text-xs leading-snug text-muted">{t(locale, "drawerHint")}</p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <label>
          <span className="label">{t(locale, "drawerWidth")}</span>
          <input
            className="field font-mono"
            type="number"
            min={1}
            max={150}
            step={0.1}
            value={drawer.widthCm}
            onChange={(e) =>
              setDrawerCm({
                widthCm: Number(e.target.value),
                depthCm: drawer.depthCm,
                heightCm: drawer.heightCm,
              })
            }
          />
        </label>
        <label>
          <span className="label">{t(locale, "drawerDepth")}</span>
          <input
            className="field font-mono"
            type="number"
            min={1}
            max={150}
            step={0.1}
            value={drawer.depthCm}
            onChange={(e) =>
              setDrawerCm({
                widthCm: drawer.widthCm,
                depthCm: Number(e.target.value),
                heightCm: drawer.heightCm,
              })
            }
          />
        </label>
        <label className="col-span-2">
          <span className="label">
            {t(locale, "drawerHeight")}{" "}
            <span className="normal-case tracking-normal">
              ({t(locale, "optional")})
            </span>
          </span>
          <input
            className="field font-mono"
            type="number"
            min={0}
            max={80}
            step={0.1}
            placeholder="—"
            value={drawer.heightCm ?? ""}
            onChange={(e) => {
              const raw = e.target.value;
              setDrawerCm({
                widthCm: drawer.widthCm,
                depthCm: drawer.depthCm,
                heightCm: raw === "" ? null : Number(raw),
              });
            }}
          />
        </label>
      </div>

      <div
        className={`mt-3 border px-3 py-2 font-mono text-sm ${
          tooSmall
            ? "border-[var(--danger)]/50 text-[var(--danger)]"
            : "border-brass/40 text-brass"
        }`}
        aria-live="polite"
      >
        {tooSmall ? (
          t(locale, "tooSmall")
        ) : (
          <>
            <span className="text-muted">{t(locale, "derivedUnits")}: </span>
            <span className="text-base font-medium text-ink">
              → {drawer.width}×{drawer.depth}{" "}
              {locale === "de" ? "Einheiten" : "units"}
            </span>
            {heightU > 0 && (
              <span className="mt-1 block text-xs text-muted">
                {t(locale, "derivedHeight")}: → {heightU}U ·{" "}
                {drawer.layers}{" "}
                {locale === "de" ? "Lage(n)" : "layer(s)"}
              </span>
            )}
            {(leftoverW > 0 || leftoverD > 0) && (
              <span className="mt-1 block text-[11px] text-muted">
                {t(locale, "leftover")}: {leftoverW}×{leftoverD} mm
              </span>
            )}
          </>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2">
          <span className="label mb-0">{t(locale, "drawerLayers")}</span>
          <input
            className="field w-16 font-mono py-1"
            type="number"
            min={1}
            max={3}
            value={drawer.layers}
            onChange={(e) => setLayers(Number(e.target.value) || 1)}
          />
        </label>
        {drawer.layers > 1 &&
          Array.from({ length: drawer.layers }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`btn-ghost px-2 py-1 text-xs ${
                activeLayer === i
                  ? "!border-brass !bg-[rgba(201,162,39,0.15)]"
                  : ""
              }`}
              onClick={() => setActiveLayer(i)}
            >
              {t(locale, "layer")} {i + 1}
            </button>
          ))}
      </div>
    </section>
  );
}
