"use client";

import { BomSummary } from "@/components/BomSummary";
import { GridPlanner } from "@/components/GridPlanner";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { ModuleLibrary } from "@/components/ModuleLibrary";
import { OrderFlow } from "@/components/OrderFlow";
import { useConfigurator } from "@/context/ConfiguratorContext";
import { t } from "@/lib/i18n";

export function Planner() {
  const { locale } = useConfigurator();

  return (
    <section
      id="planner"
      className="flex h-[100svh] min-h-[100svh] flex-col overflow-hidden"
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[rgba(138,148,156,0.2)] px-3 py-2.5 md:px-4">
        <div className="flex min-w-0 items-baseline gap-3">
          <a href="#top" className="brand-mark font-display text-2xl uppercase tracking-wide">
            {t(locale, "brand")}
          </a>
          <span className="hidden font-mono text-xs text-muted sm:inline">
            {t(locale, "tagline")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a href="/admin/orders" className="btn-ghost px-3 py-1.5 text-xs">
            {t(locale, "ctaAdmin")}
          </a>
          <LanguageSwitch />
        </div>
      </header>

      <div className="grid min-h-0 flex-1 gap-3 p-3 md:grid-cols-[minmax(240px,280px)_minmax(0,1fr)_minmax(240px,280px)] md:gap-3 md:p-3">
        <div className="min-h-0 max-h-[40vh] md:max-h-none">
          <ModuleLibrary />
        </div>
        <div className="min-h-[45vh] md:min-h-0">
          <GridPlanner />
        </div>
        <div className="min-h-0 max-h-[35vh] md:max-h-none">
          <BomSummary />
        </div>
      </div>

      <OrderFlow />
    </section>
  );
}
