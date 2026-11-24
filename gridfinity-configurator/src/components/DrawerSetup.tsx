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
        className={`mt-3 rounded-lg border px-3 py-2 font-mono text-sm ${
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

      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="label mb-0">{t(locale, "drawerLayers")}</span>
          <div
            className="inline-flex rounded-lg border border-[rgba(138,148,156,0.28)] bg-[rgba(10,12,14,0.35)] p-0.5"
            role="group"
            aria-label={t(locale, "drawerLayers")}
          >
            {[1, 2, 3].map((n) => {
              const active = drawer.layers === n;
              return (
                <button
                  key={n}
                  type="button"
                  className={`min-w-9 rounded-md px-2.5 py-1 font-mono text-xs transition ${
                    active
                      ? "bg-[rgba(201,162,39,0.22)] text-brass ring-1 ring-brass/50"
                      : "text-muted hover:text-ink"
                  }`}
                  onClick={() => setLayers(n)}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>
        {drawer.layers > 1 && (
          <div
            className="flex rounded-lg border border-[rgba(138,148,156,0.28)] bg-[rgba(10,12,14,0.35)] p-1"
            role="tablist"
            aria-label={t(locale, "layer")}
          >
            {Array.from({ length: drawer.layers }, (_, i) => {
              const active = activeLayer === i;
              return (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`flex-1 rounded-md px-2 py-1.5 text-center text-xs font-medium transition ${
                    active
                      ? "bg-[rgba(201,162,39,0.22)] text-brass shadow-sm ring-1 ring-brass/50"
                      : "text-muted hover:text-ink"
                  }`}
                  onClick={() => setActiveLayer(i)}
                >
                  {t(locale, "layer")} {i + 1}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
