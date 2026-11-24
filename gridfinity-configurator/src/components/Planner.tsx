"use client";

import { BomSummary } from "@/components/BomSummary";
import { DrawerSetup } from "@/components/DrawerSetup";
import { GridPlanner } from "@/components/GridPlanner";
import { ModuleLibrary } from "@/components/ModuleLibrary";
import { OrderFlow } from "@/components/OrderFlow";

export function Planner() {
  return (
    <section id="planner" className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)_300px]">
        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <DrawerSetup />
          <ModuleLibrary />
        </div>
        <GridPlanner />
        <div className="xl:sticky xl:top-6 xl:self-start">
          <BomSummary />
        </div>
      </div>
      <OrderFlow />
    </section>
  );
}
