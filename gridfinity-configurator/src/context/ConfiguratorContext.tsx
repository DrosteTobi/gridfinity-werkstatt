"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { catalogById } from "@/lib/catalog";
import { canPlace } from "@/lib/geometry";
import { buildBom, totalFromItems } from "@/lib/orders-client";
import type {
  DrawerSize,
  Locale,
  OrderItemSnapshot,
  PlacedModule,
} from "@/lib/types";

type Step = "plan" | "review" | "contact" | "done";

interface ConfiguratorState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  drawer: DrawerSize;
  setDrawer: (drawer: DrawerSize) => void;
  placements: PlacedModule[];
  selectedModuleId: string | null;
  setSelectedModuleId: (id: string | null) => void;
  activeLayer: number;
  setActiveLayer: (layer: number) => void;
  selectedInstanceId: string | null;
  setSelectedInstanceId: (id: string | null) => void;
  placeAt: (x: number, y: number) => boolean;
  moveInstance: (instanceId: string, x: number, y: number) => boolean;
  removeInstance: (instanceId: string) => void;
  clearLayer: (layer: number) => void;
  resetPlan: () => void;
  bom: OrderItemSnapshot[];
  totalCents: number;
  step: Step;
  setStep: (step: Step) => void;
  lastOrderId: string | null;
  setLastOrderId: (id: string | null) => void;
  placementError: boolean;
  clearPlacementError: () => void;
}

const ConfiguratorContext = createContext<ConfiguratorState | null>(null);

const DEFAULT_DRAWER: DrawerSize = { width: 7, depth: 5, layers: 1 };

function newInstanceId(): string {
  return `p-${Math.random().toString(36).slice(2, 10)}`;
}

export function ConfiguratorProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("de");
  const [drawer, setDrawerState] = useState<DrawerSize>(DEFAULT_DRAWER);
  const [placements, setPlacements] = useState<PlacedModule[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(
    "bin-2x2-3u",
  );
  const [activeLayer, setActiveLayer] = useState(0);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(
    null,
  );
  const [step, setStep] = useState<Step>("plan");
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [placementError, setPlacementError] = useState(false);

  const setDrawer = useCallback((next: DrawerSize) => {
    const clamped: DrawerSize = {
      width: Math.min(16, Math.max(2, Math.round(next.width))),
      depth: Math.min(16, Math.max(2, Math.round(next.depth))),
      layers: Math.min(3, Math.max(1, Math.round(next.layers))),
    };
    setDrawerState(clamped);
    setPlacements((prev) =>
      prev.filter((p) => {
        const mod = catalogById[p.moduleId];
        if (!mod) return false;
        if (p.layer >= clamped.layers) return false;
        return (
          p.x + mod.width <= clamped.width && p.y + mod.depth <= clamped.depth
        );
      }),
    );
    setActiveLayer((layer) => Math.min(layer, clamped.layers - 1));
  }, []);

  const placeAt = useCallback(
    (x: number, y: number) => {
      if (!selectedModuleId) return false;
      if (
        !canPlace(drawer, placements, selectedModuleId, x, y, activeLayer)
      ) {
        setPlacementError(true);
        return false;
      }
      setPlacementError(false);
      const instance: PlacedModule = {
        instanceId: newInstanceId(),
        moduleId: selectedModuleId,
        x,
        y,
        layer: activeLayer,
      };
      setPlacements((prev) => [...prev, instance]);
      setSelectedInstanceId(instance.instanceId);
      return true;
    },
    [selectedModuleId, drawer, placements, activeLayer],
  );

  const moveInstance = useCallback(
    (instanceId: string, x: number, y: number) => {
      const current = placements.find((p) => p.instanceId === instanceId);
      if (!current) return false;
      if (
        !canPlace(
          drawer,
          placements,
          current.moduleId,
          x,
          y,
          current.layer,
          instanceId,
        )
      ) {
        setPlacementError(true);
        return false;
      }
      setPlacementError(false);
      setPlacements((prev) =>
        prev.map((p) =>
          p.instanceId === instanceId ? { ...p, x, y } : p,
        ),
      );
      return true;
    },
    [drawer, placements],
  );

  const removeInstance = useCallback((instanceId: string) => {
    setPlacements((prev) => prev.filter((p) => p.instanceId !== instanceId));
    setSelectedInstanceId((id) => (id === instanceId ? null : id));
  }, []);

  const clearLayer = useCallback((layer: number) => {
    setPlacements((prev) => prev.filter((p) => p.layer !== layer));
    setSelectedInstanceId(null);
  }, []);

  const resetPlan = useCallback(() => {
    setPlacements([]);
    setSelectedInstanceId(null);
    setDrawerState(DEFAULT_DRAWER);
    setActiveLayer(0);
    setStep("plan");
    setLastOrderId(null);
    setPlacementError(false);
  }, []);

  const bom = useMemo(() => buildBom(placements), [placements]);
  const totalCents = useMemo(() => totalFromItems(bom), [bom]);

  const value: ConfiguratorState = {
    locale,
    setLocale,
    drawer,
    setDrawer,
    placements,
    selectedModuleId,
    setSelectedModuleId,
    activeLayer,
    setActiveLayer,
    selectedInstanceId,
    setSelectedInstanceId,
    placeAt,
    moveInstance,
    removeInstance,
    clearLayer,
    resetPlan,
    bom,
    totalCents,
    step,
    setStep,
    lastOrderId,
    setLastOrderId,
    placementError,
    clearPlacementError: () => setPlacementError(false),
  };

  return (
    <ConfiguratorContext.Provider value={value}>
      {children}
    </ConfiguratorContext.Provider>
  );
}

export function useConfigurator(): ConfiguratorState {
  const ctx = useContext(ConfiguratorContext);
  if (!ctx) {
    throw new Error("useConfigurator must be used within ConfiguratorProvider");
  }
  return ctx;
}
