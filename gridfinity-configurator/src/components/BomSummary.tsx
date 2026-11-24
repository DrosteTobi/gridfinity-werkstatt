"use client";

import { useConfigurator } from "@/context/ConfiguratorContext";
import { formatEur } from "@/lib/catalog";
import { t } from "@/lib/i18n";

export function BomSummary() {
  const { locale, bom, totalCents, placements, setStep } = useConfigurator();

  return (
    <section className="workshop-panel p-5 md:p-6">
      <h2 className="font-display text-3xl uppercase tracking-wide text-ink">
        {t(locale, "bomTitle")}
      </h2>
      {bom.length === 0 ? (
        <p className="mt-4 text-sm text-muted">{t(locale, "bomEmpty")}</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {bom.map((line) => (
            <li
              key={line.moduleId}
              className="flex items-baseline justify-between gap-3 border-b border-[rgba(138,148,156,0.15)] py-2"
            >
              <span>
                <span className="block text-ink">
                  {locale === "de" ? line.nameDe : line.nameEn}
                </span>
                <span className="font-mono text-xs text-muted">
                  {line.quantity} × {formatEur(line.unitPriceCents, locale)}
                </span>
              </span>
              <span className="font-mono text-sm text-brass">
                {formatEur(line.lineTotalCents, locale)}
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-5 flex items-center justify-between border-t border-[rgba(201,162,39,0.25)] pt-4">
        <span className="font-display text-2xl uppercase tracking-wide">
          {t(locale, "total")}
        </span>
        <span className="font-mono text-xl text-brass">
          {formatEur(totalCents, locale)}
        </span>
      </div>
      <p className="mt-2 text-xs text-muted">{t(locale, "shippingNote")}</p>
      <button
        type="button"
        className="btn-primary mt-5 w-full"
        disabled={placements.length === 0}
        onClick={() => setStep("review")}
      >
        {t(locale, "orderCta")}
      </button>
    </section>
  );
}
