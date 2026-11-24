"use client";

import { useCallback, useEffect, useState } from "react";
import { formatEur } from "@/lib/catalog";
import type { Locale, OrderRecord } from "@/lib/types";

const TOKEN_KEY = "gf-admin-token";

export default function AdminOrdersPage() {
  const [locale, setLocale] = useState<Locale>("de");
  const [token, setToken] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(TOKEN_KEY);
    if (saved) {
      setToken(saved);
      void load(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = useCallback(async (adminToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        headers: { "x-admin-token": adminToken },
      });
      const data = await res.json();
      if (!res.ok) {
        setUnlocked(false);
        setError(data.error || "Unauthorized");
        return;
      }
      sessionStorage.setItem(TOKEN_KEY, adminToken);
      setUnlocked(true);
      setOrders(data.orders ?? []);
      setNotifyEmail(data.notifyEmail ?? "");
    } catch {
      setError("Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  const copy = {
    de: {
      title: "Bestellungen",
      auth: "Admin-Token",
      unlock: "Freischalten",
      hint: "Token aus der Umgebungsvariable ADMIN_TOKEN.",
      empty: "Noch keine Bestellungen.",
      back: "Zur Planung",
      notify: "Benachrichtigung",
      mailto: "E-Mail öffnen",
    },
    en: {
      title: "Orders",
      auth: "Admin token",
      unlock: "Unlock",
      hint: "Token from the ADMIN_TOKEN environment variable.",
      empty: "No orders yet.",
      back: "Back to planner",
      notify: "Notify",
      mailto: "Open email",
    },
  }[locale];

  return (
    <main className="relative z-10 mx-auto min-h-screen max-w-4xl px-5 py-10 md:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-brass">
            Gridfinity
          </p>
          <h1 className="brand-mark font-display text-5xl uppercase tracking-wide">
            {copy.title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex border border-[rgba(138,148,156,0.35)]">
            <button
              type="button"
              className={`px-3 py-1.5 text-xs font-mono ${locale === "de" ? "bg-brass text-[#14160f]" : "text-muted"}`}
              onClick={() => setLocale("de")}
            >
              DE
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-xs font-mono ${locale === "en" ? "bg-brass text-[#14160f]" : "text-muted"}`}
              onClick={() => setLocale("en")}
            >
              EN
            </button>
          </div>
          <a href="/" className="btn-ghost">
            {copy.back}
          </a>
        </div>
      </div>

      {!unlocked ? (
        <form
          className="workshop-panel max-w-md space-y-4 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            void load(token);
          }}
        >
          <label>
            <span className="label">{copy.auth}</span>
            <input
              className="field"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          <p className="text-xs text-muted">{copy.hint}</p>
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {copy.unlock}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            {copy.notify}:{" "}
            <span className="font-mono text-brass">{notifyEmail}</span>
          </p>
          {loading && <p className="text-muted">…</p>}
          {!loading && orders.length === 0 && (
            <p className="workshop-panel p-6 text-muted">{copy.empty}</p>
          )}
          {orders.map((order) => (
            <article key={order.id} className="workshop-panel p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-mono text-brass">{order.id}</h2>
                  <p className="mt-1 text-sm text-ink">
                    {order.customer.name} · {order.customer.email}
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted">
                    {new Date(order.createdAt).toLocaleString(
                      locale === "de" ? "de-DE" : "en-GB",
                      { timeZone: "Europe/Berlin" },
                    )}{" "}
                    · {order.drawer.width}×{order.drawer.depth} ·{" "}
                    {order.status}
                  </p>
                </div>
                <p className="font-mono text-lg text-brass">
                  {formatEur(order.totalCents, locale)}
                </p>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-muted">
                {order.items.map((item) => (
                  <li key={item.moduleId}>
                    {item.quantity}×{" "}
                    {locale === "de" ? item.nameDe : item.nameEn}
                  </li>
                ))}
              </ul>
              {order.customer.notes && (
                <p className="mt-3 text-sm italic text-muted">
                  {order.customer.notes}
                </p>
              )}
              <a
                className="btn-ghost mt-4 inline-flex text-sm"
                href={`mailto:${notifyEmail}?subject=${encodeURIComponent(
                  `[Gridfinity] ${order.id}`,
                )}&body=${encodeURIComponent(
                  `${order.customer.name} <${order.customer.email}>\n${order.items
                    .map((i) => `${i.quantity}× ${i.nameEn}`)
                    .join("\n")}\nTotal: ${(order.totalCents / 100).toFixed(2)} EUR`,
                )}`}
              >
                {copy.mailto}
              </a>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
