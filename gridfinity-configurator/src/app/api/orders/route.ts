import { NextRequest, NextResponse } from "next/server";
import { isValidAdminToken } from "@/lib/admin-auth";
import { deriveDrawer } from "@/lib/drawer";
import { catalogById } from "@/lib/catalog";
import { canPlace } from "@/lib/geometry";
import {
  buildMailto,
  createOrder,
  getNotifyEmail,
  listOrders,
} from "@/lib/orders";
import type {
  CustomerContact,
  DrawerSize,
  Locale,
  PlacedModule,
} from "@/lib/types";
import { MAX_GRID_UNITS } from "@/lib/units";

export const runtime = "nodejs";

function validatePayload(body: unknown):
  | {
      locale: Locale;
      customer: CustomerContact;
      drawer: DrawerSize;
      placements: PlacedModule[];
    }
  | { error: string } {
  if (!body || typeof body !== "object") return { error: "Invalid body" };
  const b = body as Record<string, unknown>;
  const locale: Locale = b.locale === "en" ? "en" : "de";
  const customer = b.customer as CustomerContact | undefined;
  const drawer = b.drawer as Partial<DrawerSize> | undefined;
  const placements = b.placements as PlacedModule[] | undefined;

  if (!customer?.name?.trim() || !customer?.email?.trim()) {
    return { error: "Name and email required" };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) {
    return { error: "Invalid email" };
  }
  if (!drawer) return { error: "Invalid drawer" };

  let normalizedDrawer: DrawerSize;
  if (
    Number.isFinite(drawer.widthCm) &&
    Number.isFinite(drawer.depthCm)
  ) {
    const heightRaw = drawer.heightCm;
    const heightCm =
      heightRaw == null ||
      (typeof heightRaw === "number" &&
        (!Number.isFinite(heightRaw) || heightRaw <= 0))
        ? null
        : Number(heightRaw);
    normalizedDrawer = deriveDrawer(
      Number(drawer.widthCm),
      Number(drawer.depthCm),
      heightCm,
    );
    if (Number.isFinite(drawer.layers)) {
      normalizedDrawer.layers = Math.min(
        3,
        Math.max(1, Math.round(Number(drawer.layers))),
      );
    }
  } else if (
    Number.isFinite(drawer.width) &&
    Number.isFinite(drawer.depth) &&
    Number.isFinite(drawer.layers)
  ) {
    // Legacy unit-only payloads
    const width = Math.min(
      MAX_GRID_UNITS,
      Math.max(1, Math.round(Number(drawer.width))),
    );
    const depth = Math.min(
      MAX_GRID_UNITS,
      Math.max(1, Math.round(Number(drawer.depth))),
    );
    normalizedDrawer = {
      widthCm: (width * 42) / 10,
      depthCm: (depth * 42) / 10,
      heightCm: null,
      width,
      depth,
      layers: Math.min(3, Math.max(1, Math.round(Number(drawer.layers)))),
    };
  } else {
    return { error: "Invalid drawer" };
  }

  if (normalizedDrawer.width < 1 || normalizedDrawer.depth < 1) {
    return { error: "Drawer too small for one grid unit" };
  }

  if (!Array.isArray(placements) || placements.length === 0) {
    return { error: "Place at least one module" };
  }
  if (placements.length > 256) {
    return { error: "Too many placements" };
  }

  const seen = new Set<string>();
  const normalized: PlacedModule[] = [];
  for (const p of placements) {
    if (!p || typeof p !== "object") return { error: "Invalid placement" };
    if (!catalogById[p.moduleId]) {
      return { error: `Unknown module ${p.moduleId}` };
    }
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
  const token = req.headers.get("x-admin-token");
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
