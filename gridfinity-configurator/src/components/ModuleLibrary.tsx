"use client";

import { useMemo, useState } from "react";
import { DrawerSetup } from "@/components/DrawerSetup";
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
        <div className="mt-3 flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`btn-ghost px-2.5 py-1 text-xs ${
                filter === cat ? "!border-brass !bg-[rgba(201,162,39,0.15)]" : ""
              }`}
              onClick={() => setFilter(cat)}
            >
              {categoryLabel(locale, cat)}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">{t(locale, "placeHint")}</p>
        <ul className="mt-3 min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
          {modules.map((m) => {
            const active = selectedModuleId === m.id;
            return (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setSelectedModuleId(m.id)}
                  className={`flex w-full items-start gap-2.5 border px-2.5 py-2 text-left transition ${
                    active
                      ? "border-brass bg-[rgba(201,162,39,0.12)]"
                      : "border-[rgba(138,148,156,0.25)] hover:border-brass/60"
                  }`}
                >
                  <span
                    className="mt-0.5 inline-block h-8 w-8 shrink-0 border border-black/30"
                    style={{
                      background: m.color,
                      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
                    }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="block text-sm font-medium leading-snug text-ink">
                        {moduleName(m.id, locale)}
                      </span>
                      {active && (
                        <span className="shrink-0 font-mono text-[9px] uppercase tracking-wider text-brass">
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
