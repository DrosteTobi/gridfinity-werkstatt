"use client";

import { FormEvent, useState } from "react";
import { useConfigurator } from "@/context/ConfiguratorContext";
import { formatEur } from "@/lib/catalog";
import { t } from "@/lib/i18n";

export function OrderFlow() {
  const {
    locale,
    drawer,
    placements,
    bom,
    totalCents,
    step,
    setStep,
    lastOrderId,
    setLastOrderId,
    resetPlan,
  } = useConfigurator();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [mailto, setMailto] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  if (step === "plan") return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = t(locale, "required");
    if (!email.trim()) next.email = t(locale, "required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = t(locale, "invalidEmail");
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          customer: { name, email, phone, notes },
          drawer,
          placements,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || t(locale, "errorGeneric"));
        return;
      }
      setLastOrderId(data.order.id);
      setMailto(data.mailto ?? null);
      setStep("done");
    } catch {
      setFormError(t(locale, "errorGeneric"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm md:items-center">
      <div
        className="workshop-panel max-h-[92vh] w-full max-w-lg overflow-y-auto p-6 animate-rise"
        role="dialog"
        aria-modal
        aria-labelledby="order-title"
      >
        <h2
          id="order-title"
          className="font-display text-4xl uppercase tracking-wide text-ink"
        >
          {step === "done" ? t(locale, "confirmTitle") : t(locale, "orderTitle")}
        </h2>

        {step === "review" && (
          <>
            <p className="mt-2 text-sm text-muted">{t(locale, "reviewConfig")}</p>
            <div className="mt-4 space-y-2 font-mono text-sm">
              <p>
                {drawer.widthCm}×{drawer.depthCm} cm → {drawer.width}×
                {drawer.depth} U · {drawer.layers}{" "}
                {t(locale, "layer").toLowerCase()}
                {drawer.layers > 1 ? "s" : ""}
              </p>
              {bom.map((line) => (
                <p key={line.moduleId} className="flex justify-between gap-3">
                  <span>
                    {line.quantity}×{" "}
                    {locale === "de" ? line.nameDe : line.nameEn}
                  </span>
                  <span className="text-brass">
                    {formatEur(line.lineTotalCents, locale)}
                  </span>
                </p>
              ))}
              <p className="flex justify-between border-t border-[rgba(201,162,39,0.25)] pt-3 text-base">
                <span>{t(locale, "total")}</span>
                <span className="text-brass">{formatEur(totalCents, locale)}</span>
              </p>
            </div>
            <p className="mt-3 text-xs text-muted">{t(locale, "shippingNote")}</p>
            <div className="mt-6 flex gap-3">
              <button type="button" className="btn-ghost" onClick={() => setStep("plan")}>
                {t(locale, "back")}
              </button>
              <button
                type="button"
                className="btn-primary flex-1"
                onClick={() => setStep("contact")}
              >
                {t(locale, "contactTitle")}
              </button>
            </div>
          </>
        )}

        {step === "contact" && (
          <form className="mt-4 space-y-4" onSubmit={onSubmit}>
            <p className="text-sm text-muted">{t(locale, "contactTitle")}</p>
            <label>
              <span className="label">{t(locale, "name")}</span>
              <input
                className="field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
              {errors.name && (
                <span className="mt-1 block text-xs text-[var(--danger)]">
                  {errors.name}
                </span>
              )}
            </label>
            <label>
              <span className="label">{t(locale, "email")}</span>
              <input
                className="field"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              {errors.email && (
                <span className="mt-1 block text-xs text-[var(--danger)]">
                  {errors.email}
                </span>
              )}
            </label>
            <label>
              <span className="label">{t(locale, "phone")}</span>
              <input
                className="field"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </label>
            <label>
              <span className="label">{t(locale, "notes")}</span>
              <textarea
                className="field min-h-24"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>
            {formError && (
              <p className="text-sm text-[var(--danger)]" role="alert">
                {formError}
              </p>
            )}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setStep("review")}
              >
                {t(locale, "back")}
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={submitting}
              >
                {submitting ? t(locale, "submitting") : t(locale, "submit")}
              </button>
            </div>
          </form>
        )}

        {step === "done" && (
          <div className="mt-4 space-y-4">
            <p className="text-muted">{t(locale, "confirmBody")}</p>
            {lastOrderId && (
              <p className="font-mono text-brass">
                {t(locale, "orderId")}: {lastOrderId}
              </p>
            )}
            {mailto && (
              <a href={mailto} className="btn-ghost inline-flex">
                {t(locale, "mailtoOwner")}
              </a>
            )}
            <button type="button" className="btn-primary w-full" onClick={resetPlan}>
              {t(locale, "newPlan")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
