"use client";

import { useConfigurator } from "@/context/ConfiguratorContext";
import { t } from "@/lib/i18n";

export function LanguageSwitch() {
  const { locale, setLocale } = useConfigurator();
  return (
    <div
      className="inline-flex border border-[rgba(138,148,156,0.35)]"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        className={`px-3 py-1.5 text-xs font-mono tracking-widest ${
          locale === "de"
            ? "bg-brass text-[#14160f]"
            : "text-muted hover:text-ink"
        }`}
        onClick={() => setLocale("de")}
      >
        {t(locale, "langDe")}
      </button>
      <button
        type="button"
        className={`px-3 py-1.5 text-xs font-mono tracking-widest ${
          locale === "en"
            ? "bg-brass text-[#14160f]"
            : "text-muted hover:text-ink"
        }`}
        onClick={() => setLocale("en")}
      >
        {t(locale, "langEn")}
      </button>
    </div>
  );
}
