"use client";

import { useConfigurator } from "@/context/ConfiguratorContext";
import { t } from "@/lib/i18n";

export function DrawerSetup() {
  const { locale, drawer, setDrawer, activeLayer, setActiveLayer } =
    useConfigurator();

  return (
    <section className="workshop-panel p-5 md:p-6">
      <h2 className="font-display text-3xl uppercase tracking-wide text-ink">
        {t(locale, "drawerTitle")}
      </h2>
      <p className="mt-2 text-sm text-muted">{t(locale, "drawerHint")}</p>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <label>
          <span className="label">{t(locale, "drawerWidth")}</span>
          <input
            className="field font-mono"
            type="number"
            min={2}
            max={16}
            value={drawer.width}
            onChange={(e) =>
              setDrawer({ ...drawer, width: Number(e.target.value) || 2 })
            }
          />
        </label>
        <label>
          <span className="label">{t(locale, "drawerDepth")}</span>
          <input
            className="field font-mono"
            type="number"
            min={2}
            max={16}
            value={drawer.depth}
            onChange={(e) =>
              setDrawer({ ...drawer, depth: Number(e.target.value) || 2 })
            }
          />
        </label>
        <label>
          <span className="label">{t(locale, "drawerLayers")}</span>
          <input
            className="field font-mono"
            type="number"
            min={1}
            max={3}
            value={drawer.layers}
            onChange={(e) =>
              setDrawer({ ...drawer, layers: Number(e.target.value) || 1 })
            }
          />
        </label>
      </div>
      {drawer.layers > 1 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="label mb-0">{t(locale, "layer")}</span>
          {Array.from({ length: drawer.layers }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`btn-ghost px-3 py-1 ${
                activeLayer === i ? "!border-brass !bg-[rgba(201,162,39,0.15)]" : ""
              }`}
              onClick={() => setActiveLayer(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
