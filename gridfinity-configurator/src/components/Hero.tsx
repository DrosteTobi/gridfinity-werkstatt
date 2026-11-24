"use client";

import { LanguageSwitch } from "@/components/LanguageSwitch";
import { useConfigurator } from "@/context/ConfiguratorContext";
import { t } from "@/lib/i18n";

export function Hero() {
  const { locale } = useConfigurator();

  return (
    <header id="top" className="relative min-h-[70svh] overflow-hidden md:min-h-[80svh]">
      <div
        className="absolute inset-0"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(105deg, rgba(12,14,16,0.55) 0%, rgba(12,14,16,0.75) 38%, rgba(12,14,16,0.92) 100%), url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect fill='%23171b1f' width='800' height='600'/%3E%3Cg fill='none' stroke='%23c9a227' stroke-opacity='0.18' stroke-width='1'%3E%3Cpath d='M40 40h720v520H40z'/%3E%3Cpath d='M40 40h84v84H40zm84 0h84v84H124zm84 0h84v84H208zm84 0h84v84H292zm84 0h84v84H376zm84 0h84v84H460zm84 0h84v84H544zm84 0h84v84H628z'/%3E%3Cpath d='M40 124h84v84H40zm84 0h84v84H124zm168 0h168v168H208zm336 0h84v84H544zm84 0h84v84H628z'/%3E%3Cpath d='M40 208h84v84H40zm84 0h84v84H124zm336 0h168v168H544z'/%3E%3Cpath d='M40 292h168v168H40zm168 0h84v84H208zm84 0h84v84H292zm84 0h84v84H376z'/%3E%3Cpath d='M208 376h84v84H208zm84 0h84v84H292zm84 0h84v84H376zm84 0h84v84H460z'/%3E%3Cpath d='M40 460h84v84H40zm84 0h84v84H124zm84 0h84v84H208zm84 0h84v84H292zm84 0h84v84H376zm84 0h84v84H460zm84 0h84v84H544zm84 0h84v84H628z'/%3E%3C/g%3E%3C/svg%3E\")",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#121417] to-transparent" />

      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
        <a href="#planner" className="font-display text-2xl tracking-wide text-ink/80">
          GF
        </a>
        <div className="flex items-center gap-3">
          <a href="/admin/orders" className="btn-ghost text-sm">
            {t(locale, "ctaAdmin")}
          </a>
          <LanguageSwitch />
        </div>
      </nav>

      <div className="relative z-10 mx-auto flex min-h-[calc(70svh-5rem)] max-w-6xl flex-col justify-end px-5 pb-14 pt-8 md:min-h-[calc(80svh-5rem)] md:justify-center md:px-8 md:pb-20">
        <p className="animate-rise font-mono text-xs uppercase tracking-[0.28em] text-brass">
          Gridfinity
        </p>
        <h1 className="animate-rise-delay-1 brand-mark mt-3 max-w-4xl font-display text-[clamp(3.2rem,11vw,6.8rem)] leading-[0.9]">
          {t(locale, "brand")}
        </h1>
        <p className="animate-rise-delay-1 mt-3 font-display text-2xl uppercase tracking-[0.18em] text-ink/80 md:text-3xl">
          {t(locale, "tagline")}
        </p>
        <p className="animate-rise-delay-2 mt-5 max-w-xl text-base leading-relaxed text-muted md:text-lg">
          {t(locale, "heroSub")}
        </p>
        <div className="animate-rise-delay-2 mt-8 flex flex-wrap gap-3">
          <a href="#planner" className="btn-primary">
            {t(locale, "ctaPlan")}
          </a>
        </div>
      </div>
    </header>
  );
}
