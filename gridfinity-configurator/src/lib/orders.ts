import { randomUUID } from "node:crypto";
import { sql } from "./db";
import { buildBom, totalFromItems } from "./orders-client";
import type {
  CustomerContact,
  DrawerSize,
  Locale,
  OrderItemSnapshot,
  OrderRecord,
  PlacedModule,
} from "./types";

type OrderRow = {
  id: string;
  created_at: string | Date;
  locale: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  customer_notes: string | null;
  drawer_width: number;
  drawer_depth: number;
  drawer_layers: number;
  items_json: unknown;
  total_cents: number;
  currency: string;
  status: string;
};

function parseItemsJson(raw: unknown): {
  items: OrderItemSnapshot[];
  placements: PlacedModule[];
  drawerCm?: {
    widthCm: number;
    depthCm: number;
    heightCm: number | null;
  };
} {
  const value =
    typeof raw === "string" ? (JSON.parse(raw) as unknown) : raw;
  if (!value || typeof value !== "object") {
    return { items: [], placements: [] };
  }
  const obj = value as {
    items?: OrderItemSnapshot[];
    placements?: PlacedModule[];
    drawerCm?: {
      widthCm: number;
      depthCm: number;
      heightCm: number | null;
    };
  };
  return {
    items: Array.isArray(obj.items) ? obj.items : [],
    placements: Array.isArray(obj.placements) ? obj.placements : [],
    drawerCm: obj.drawerCm,
  };
}

function rowToOrder(row: OrderRow): OrderRecord {
  const payload = parseItemsJson(row.items_json);
  const width = row.drawer_width;
  const depth = row.drawer_depth;
  return {
    id: row.id,
    createdAt:
      typeof row.created_at === "string"
        ? row.created_at
        : row.created_at.toISOString(),
    locale: (row.locale === "en" ? "en" : "de") as Locale,
    customer: {
      name: row.customer_name,
      email: row.customer_email,
      phone: row.customer_phone ?? undefined,
      notes: row.customer_notes ?? undefined,
    },
    drawer: {
      widthCm: payload.drawerCm?.widthCm ?? (width * 42) / 10,
      depthCm: payload.drawerCm?.depthCm ?? (depth * 42) / 10,
      heightCm: payload.drawerCm?.heightCm ?? null,
      width,
      depth,
      layers: row.drawer_layers,
    },
    items: payload.items ?? [],
    placements: payload.placements ?? [],
    totalCents: row.total_cents,
    currency: "EUR",
    status: (row.status as OrderRecord["status"]) || "new",
  };
}

export async function createOrder(input: {
  locale: Locale;
  customer: CustomerContact;
  drawer: DrawerSize;
  placements: PlacedModule[];
}): Promise<OrderRecord> {
  const items = buildBom(input.placements);
  const totalCents = totalFromItems(items);
  const id = `GF-${randomUUID().slice(0, 8).toUpperCase()}`;
  const payload = {
    items,
    placements: input.placements,
    drawerCm: {
      widthCm: input.drawer.widthCm,
      depthCm: input.drawer.depthCm,
      heightCm: input.drawer.heightCm,
    },
  };

  await sql(
    `insert into orders (
      id, locale, customer_name, customer_email, customer_phone, customer_notes,
      drawer_width, drawer_depth, drawer_layers, items_json, total_cents, currency, status
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,cast($10 as jsonb),$11,'EUR','new')`,
    [
      id,
      input.locale,
      input.customer.name.trim(),
      input.customer.email.trim(),
      input.customer.phone?.trim() || null,
      input.customer.notes?.trim() || null,
      input.drawer.width,
      input.drawer.depth,
      input.drawer.layers,
      JSON.stringify(payload),
      totalCents,
    ],
  );

  const order: OrderRecord = {
    id,
    createdAt: new Date().toISOString(),
    locale: input.locale,
    customer: {
      name: input.customer.name.trim(),
      email: input.customer.email.trim(),
      phone: input.customer.phone?.trim() || undefined,
      notes: input.customer.notes?.trim() || undefined,
    },
    drawer: input.drawer,
    items,
    placements: input.placements,
    totalCents,
    currency: "EUR",
    status: "new",
  };

  await notifyOwner(order);
  return order;
}

export async function listOrders(): Promise<OrderRecord[]> {
  const rows = await sql<OrderRow>(
    `select * from orders order by created_at desc limit 200`,
  );
  return rows.map(rowToOrder);
}

export async function getOrder(id: string): Promise<OrderRecord | null> {
  const rows = await sql<OrderRow>(`select * from orders where id = $1`, [id]);
  return rows[0] ? rowToOrder(rows[0]) : null;
}

function notifyEmail(): string {
  return (
    process.env.ORDER_NOTIFY_EMAIL?.trim() ||
    "orders@example.local"
  );
}

export function getNotifyEmail(): string {
  return notifyEmail();
}

async function notifyOwner(order: OrderRecord): Promise<void> {
  const webhook = process.env.ORDER_WEBHOOK_URL?.trim();
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "gridfinity.order.created",
          order,
          notifyEmail: notifyEmail(),
        }),
      });
    } catch {
      // Webhook is best-effort in MVP; order is already persisted.
    }
  }
}

export function buildMailto(order: OrderRecord): string {
  const to = notifyEmail();
  const subject = encodeURIComponent(
    `[Gridfinity] Order ${order.id} — ${order.customer.name}`,
  );
  const lines = [
    `Order: ${order.id}`,
    `Customer: ${order.customer.name} <${order.customer.email}>`,
    order.customer.phone ? `Phone: ${order.customer.phone}` : null,
    `Drawer: ${order.drawer.widthCm}×${order.drawer.depthCm} cm → ${order.drawer.width}×${order.drawer.depth} U × ${order.drawer.layers} layer(s)`,
    `Total: ${(order.totalCents / 100).toFixed(2)} EUR`,
    "",
    "BOM:",
    ...order.items.map(
      (i) =>
        `- ${i.quantity}× ${i.nameEn} (${i.nameDe}) @ ${(i.unitPriceCents / 100).toFixed(2)} EUR`,
    ),
    order.customer.notes ? `\nNotes: ${order.customer.notes}` : null,
  ].filter(Boolean);
  const body = encodeURIComponent(lines.join("\n"));
  return `mailto:${to}?subject=${subject}&body=${body}`;
}
