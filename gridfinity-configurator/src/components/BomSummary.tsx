"use client";

import { useConfigurator } from "@/context/ConfiguratorContext";
import { formatEur } from "@/lib/catalog";
import { t } from "@/lib/i18n";

export function BomSummary() {
  const {
    locale,
    bom,
    totalCents,
    placements,
    drawer,
    setStep,
    removeModuleLine,
  } = useConfigurator();

  return (
    <aside className="workshop-panel flex h-full min-h-0 flex-col overflow-hidden p-4">
      <h2 className="shrink-0 font-display text-2xl uppercase tracking-wide text-ink md:text-3xl">
        {t(locale, "bomTitle")}
      </h2>
      <p className="mt-1 shrink-0 font-mono text-xs text-muted">
        {drawer.widthCm}×{drawer.depthCm} cm → {drawer.width}×{drawer.depth} U
      </p>

      <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
        {bom.length === 0 ? (
          <p className="text-sm text-muted">{t(locale, "bomEmpty")}</p>
        ) : (
          <ul className="space-y-2">
            {bom.map((line) => (
              <li
                key={line.moduleId}
                className="flex items-center gap-2 rounded-lg border border-[rgba(138,148,156,0.15)] bg-[rgba(10,12,14,0.22)] px-2.5 py-2"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-ink">
                    {locale === "de" ? line.nameDe : line.nameEn}
                  </span>
                  <span className="font-mono text-xs text-muted">
                    {line.quantity} × {formatEur(line.unitPriceCents, locale)}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-sm text-brass">
                  {formatEur(line.lineTotalCents, locale)}
                </span>
                <button
                  type="button"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[rgba(138,148,156,0.3)] text-base leading-none text-muted transition hover:border-[var(--danger)] hover:text-[var(--danger)]"
                  aria-label={t(locale, "remove")}
                  title={t(locale, "remove")}
                  onClick={() => removeModuleLine(line.moduleId)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 shrink-0 border-t border-[rgba(201,162,39,0.25)] pt-4">
        <div className="flex items-end justify-between gap-3">
          <span className="font-display text-2xl uppercase tracking-wide md:text-3xl">
            {t(locale, "total")}
          </span>
          <span className="font-mono text-2xl font-medium text-brass md:text-3xl">
            {formatEur(totalCents, locale)}
          </span>
        </div>
        <p className="mt-2 text-xs text-muted">{t(locale, "shippingNote")}</p>
        <button
          type="button"
          className="btn-primary btn-cta-arrow mt-4 w-full"
          disabled={placements.length === 0 || drawer.width < 1 || drawer.depth < 1}
          onClick={() => setStep("review")}
        >
          <span>{t(locale, "orderCta")}</span>
          <span className="cta-arrow" aria-hidden>
            →
          </span>
        </button>
      </div>
    </aside>
  );
}
