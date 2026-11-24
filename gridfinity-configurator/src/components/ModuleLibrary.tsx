"use client";

import { useMemo, useState } from "react";
import { DrawerSetup } from "@/components/DrawerSetup";
import { ModuleIsoPreview } from "@/components/ModuleIsoPreview";
import { useConfigurator } from "@/context/ConfiguratorContext";
import { CATALOG, formatEur } from "@/lib/catalog";
import { categoryLabel, moduleName, t } from "@/lib/i18n";
import type { ModuleCategory } from "@/lib/types";

const CATEGORIES: ModuleCategory[] = ["bin", "baseplate", "divider"];

export function ModuleLibrary() {
  const { locale, selectedModuleId, setSelectedModuleId } = useConfigurator();
  const [filter, setFilter] = useState<ModuleCategory | "all">("bin");

  const modules = useMemo(
    () =>
      CATALOG.filter((m) => (filter === "all" ? true : m.category === filter)),
    [filter],
  );

  return (
    <aside className="workshop-panel flex h-full min-h-0 flex-col overflow-hidden">
      <DrawerSetup />
      <div className="flex min-h-0 flex-1 flex-col px-4 py-4">
        <div className="flex items-end justify-between gap-2">
          <h2 className="font-display text-2xl uppercase tracking-wide text-ink">
            {t(locale, "libraryTitle")}
          </h2>
          <p className="text-[10px] text-muted">{t(locale, "samplePrices")}</p>
        </div>
        <div
          className="mt-3 flex rounded-lg border border-[rgba(138,148,156,0.28)] bg-[rgba(10,12,14,0.35)] p-1"
          role="tablist"
          aria-label={t(locale, "libraryTitle")}
        >
          {CATEGORIES.map((cat) => {
            const active = filter === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                className={`flex-1 rounded-md px-2 py-1.5 text-center text-xs font-medium transition ${
                  active
                    ? "bg-[rgba(201,162,39,0.22)] text-brass shadow-sm ring-1 ring-brass/50"
                    : "text-muted hover:text-ink"
                }`}
                onClick={() => setFilter(cat)}
              >
                {categoryLabel(locale, cat)}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted">{t(locale, "placeHint")}</p>
        <ul className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          {modules.map((m) => {
            const active = selectedModuleId === m.id;
            return (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setSelectedModuleId(m.id)}
                  className={`flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition ${
                    active
                      ? "border-brass bg-[rgba(201,162,39,0.14)] shadow-[0_0_0_1px_rgba(201,162,39,0.35)]"
                      : "border-[rgba(138,148,156,0.22)] bg-[rgba(10,12,14,0.2)] hover:border-brass/55"
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${
                      active
                        ? "border-brass/40 bg-[rgba(201,162,39,0.08)]"
                        : "border-black/30 bg-[rgba(0,0,0,0.25)]"
                    }`}
                  >
                    <ModuleIsoPreview
                      width={m.width}
                      depth={m.depth}
                      heightU={m.heightU}
                      color={m.color}
                      category={m.category}
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="block text-sm font-medium leading-snug text-ink">
                        {moduleName(m.id, locale)}
                      </span>
                      {active && (
                        <span className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#14160f] bg-brass">
                          {t(locale, "selected")}
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block font-mono text-[11px] text-muted">
                      {m.width}×{m.depth}
                      {m.heightU > 0 ? ` · ${m.heightU}U` : ""} ·{" "}
                      {formatEur(m.priceCents, locale)}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
