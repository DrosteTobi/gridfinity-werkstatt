import { NextRequest, NextResponse } from "next/server";
import { isValidAdminToken } from "@/lib/admin-auth";
import { buildMailto, createOrder, getNotifyEmail, listOrders } from "@/lib/orders";
import { catalogById } from "@/lib/catalog";
import { canPlace } from "@/lib/geometry";
import type { CustomerContact, DrawerSize, Locale, PlacedModule } from "@/lib/types";

export const runtime = "nodejs";

function validatePayload(body: unknown): {
  locale: Locale;
  customer: CustomerContact;
  drawer: DrawerSize;
  placements: PlacedModule[];
} | { error: string } {
  if (!body || typeof body !== "object") return { error: "Invalid body" };
  const b = body as Record<string, unknown>;
  const locale: Locale = b.locale === "en" ? "en" : "de";
  const customer = b.customer as CustomerContact | undefined;
  const drawer = b.drawer as DrawerSize | undefined;
  const placements = b.placements as PlacedModule[] | undefined;

  if (!customer?.name?.trim() || !customer?.email?.trim()) {
    return { error: "Name and email required" };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) {
    return { error: "Invalid email" };
  }
  if (
    !drawer ||
    !Number.isFinite(drawer.width) ||
    !Number.isFinite(drawer.depth) ||
    !Number.isFinite(drawer.layers)
  ) {
    return { error: "Invalid drawer" };
  }
  if (!Array.isArray(placements) || placements.length === 0) {
    return { error: "Place at least one module" };
  }
  if (placements.length > 256) {
    return { error: "Too many placements" };
  }

  const normalizedDrawer: DrawerSize = {
    width: Math.min(16, Math.max(2, Math.round(drawer.width))),
    depth: Math.min(16, Math.max(2, Math.round(drawer.depth))),
    layers: Math.min(3, Math.max(1, Math.round(drawer.layers))),
  };

  const seen = new Set<string>();
  const normalized: PlacedModule[] = [];
  for (const p of placements) {
    if (!p || typeof p !== "object") return { error: "Invalid placement" };
    if (!catalogById[p.moduleId]) return { error: `Unknown module ${p.moduleId}` };
    if (seen.has(p.instanceId)) return { error: "Duplicate instance" };
    seen.add(p.instanceId);
    if (
      !canPlace(
        normalizedDrawer,
        normalized,
        p.moduleId,
        Math.round(p.x),
        Math.round(p.y),
        Math.round(p.layer),
      )
    ) {
      return { error: "Invalid layout (overlap or out of bounds)" };
    }
    normalized.push({
      instanceId: String(p.instanceId).slice(0, 64),
      moduleId: p.moduleId,
      x: Math.round(p.x),
      y: Math.round(p.y),
      layer: Math.round(p.layer),
    });
  }

  return {
    locale,
    customer: {
      name: customer.name.trim().slice(0, 120),
      email: customer.email.trim().slice(0, 200),
      phone: customer.phone?.trim().slice(0, 60),
      notes: customer.notes?.trim().slice(0, 2000),
    },
    drawer: normalizedDrawer,
    placements: normalized,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = validatePayload(body);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const order = await createOrder(parsed);
    return NextResponse.json({
      order,
      mailto: buildMailto(order),
      notifyEmail: getNotifyEmail(),
    });
  } catch (error) {
    console.error("order create failed", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const token =
    req.headers.get("x-admin-token") ||
    req.nextUrl.searchParams.get("token");
  if (!isValidAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const orders = await listOrders();
    return NextResponse.json({
      orders,
      notifyEmail: getNotifyEmail(),
    });
  } catch (error) {
    console.error("order list failed", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
