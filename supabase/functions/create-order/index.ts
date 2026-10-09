import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PRICE_MAP } from "./prices.ts";
import { checkRateLimit, readJsonWithLimit } from "../_shared/rateLimit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartItem { product_id: number; qty: number; expected_price?: number; }
interface ShippingAddress {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  postal_code?: string;
}

const KENYA_PHONE = /^(?:\+?254|0)(?:7|1)\d{8}$/;

const json = (body: unknown, status = 200, extraHeaders: Record<string,string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders, ...extraHeaders },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: authErr } = await userClient.auth.getClaims(token);
    if (authErr || !claimsData?.claims?.sub) return json({ error: "Unauthorized" }, 401);
    const userId = claimsData.claims.sub as string;

    // Rate limit: 5 orders / 60s per user
    const rl = await checkRateLimit({ userId, functionName: "create-order", windowSeconds: 60, max: 5 });
    if (!rl.allowed) return json({ error: "Too many requests" }, 429, { "Retry-After": String(rl.retryAfter ?? 60) });

    const parsed = await readJsonWithLimit(req);
    if (!parsed.ok) return json({ error: parsed.error }, parsed.status);
    const body = parsed.data;
    if (!body || !Array.isArray(body.cart) || !body.shipping) {
      return json({ error: "Invalid request body" }, 400);
    }

    const cart: CartItem[] = body.cart;
    const shipping: ShippingAddress = body.shipping;

    if (cart.length === 0 || cart.length > 50) return json({ error: "Invalid cart size" }, 400);

    // Validate shipping
    const requiredStr = (v: unknown, max = 200) =>
      typeof v === "string" && v.trim().length > 0 && v.length <= max;
    if (
      !requiredStr(shipping.full_name, 100) ||
      !requiredStr(shipping.phone, 30) ||
      !requiredStr(shipping.address_line1, 200) ||
      !requiredStr(shipping.city, 100)
    ) {
      return json({ error: "Invalid shipping address" }, 400);
    }
    if (!KENYA_PHONE.test(shipping.phone.trim())) {
      return json({ error: "Invalid Kenyan phone number" }, 400);
    }

    // Aggregate cart by product id
    const aggregated = new Map<number, number>();
    for (const item of cart) {
      const pid = Number(item.product_id);
      const qty = Number(item.qty);
      if (!Number.isInteger(pid) || !Number.isInteger(qty) || qty < 1 || qty > 100) {
        return json({ error: `Invalid cart item: ${pid}` }, 400);
      }
      aggregated.set(pid, (aggregated.get(pid) ?? 0) + qty);
    }

    const adminClient = createClient(supabaseUrl, serviceKey);
    const productIds = Array.from(aggregated.keys());

    // Stock check (only enforce when inventory rows exist)
    const { data: inventoryRows, error: invErr } = await adminClient
      .from("product_inventory")
      .select("product_id, stock, is_active")
      .in("product_id", productIds);
    if (invErr) {
      console.error("inventory query error", invErr);
      return json({ error: "Inventory check failed" }, 500);
    }
    const invMap = new Map<number, { stock: number; is_active: boolean }>();
    for (const row of inventoryRows ?? []) invMap.set(row.product_id as number, { stock: row.stock as number, is_active: row.is_active as boolean });

    let total = 0;
    const orderItemsData: { product_id: number; product_title: string; product_price: number; quantity: number }[] = [];
    for (const [pid, qty] of aggregated) {
      const product = PRICE_MAP[pid];
      if (!product) return json({ error: `Unknown product: ${pid}` }, 400);
      const inv = invMap.get(pid);
      if (inv && !inv.is_active) return json({ error: `Product unavailable: ${product.title}` }, 409);
      // If the client sent an expected unit price, verify it matches the server price.
      const clientItem = cart.find(c => Number(c.product_id) === pid);
      if (clientItem?.expected_price !== undefined &&
          Math.abs(Number(clientItem.expected_price) - product.price) > 0.01) {
        return json({ error: `Price mismatch for ${product.title}` }, 409);
      }
      total += product.price * qty;
      orderItemsData.push({
        product_id: pid,
        product_title: product.title,
        product_price: product.price,
        quantity: qty,
      });
    }
    if (total <= 0) return json({ error: "Invalid total" }, 400);

    // Atomically reserve stock BEFORE creating the order to prevent TOCTOU oversell.
    // For each product with an inventory row, call the conditional decrement RPC.
    // If any reservation fails, restore previously reserved stock and reject.
    const reserved: { pid: number; qty: number }[] = [];
    for (const [pid, qty] of aggregated) {
      if (!invMap.has(pid)) continue; // product has no managed inventory; skip
      const { data: ok, error: decErr } = await adminClient.rpc("decrement_stock_if_available", {
        _product_id: pid,
        _qty: qty,
      });
      if (decErr) {
        console.error("decrement rpc error", decErr);
        for (const r of reserved) {
          await adminClient.rpc("restore_stock", { _product_id: r.pid, _qty: r.qty });
        }
        return json({ error: "Inventory check failed" }, 500);
      }
      if (!ok) {
        for (const r of reserved) {
          await adminClient.rpc("restore_stock", { _product_id: r.pid, _qty: r.qty });
        }
        const product = PRICE_MAP[pid];
        return json({ error: `Insufficient stock for ${product?.title ?? pid}` }, 409);
      }
      reserved.push({ pid, qty });
    }

    const restoreReserved = async () => {
      for (const r of reserved) {
        await adminClient.rpc("restore_stock", { _product_id: r.pid, _qty: r.qty });
      }
    };

    const { data: order, error: orderErr } = await adminClient
      .from("orders")
      .insert({
        user_id: userId,
        total_amount: total,
        status: "pending",
        shipping_address: {
          full_name: shipping.full_name,
          phone: shipping.phone,
          address_line1: shipping.address_line1,
          address_line2: shipping.address_line2 ?? "",
          city: shipping.city,
          postal_code: shipping.postal_code ?? "",
        },
      })
      .select()
      .single();

    if (orderErr || !order) {
      console.error("order insert error", orderErr);
      await restoreReserved();
      return json({ error: "Failed to create order" }, 500);
    }

    const itemsToInsert = orderItemsData.map((i) => ({ ...i, order_id: order.id }));
    const { error: itemsErr } = await adminClient.from("order_items").insert(itemsToInsert);
    if (itemsErr) {
      console.error("items insert error", itemsErr);
      await adminClient.from("orders").delete().eq("id", order.id);
      await restoreReserved();
      return json({ error: "Failed to create order items" }, 500);
    }

    return json({ success: true, order_id: order.id, total_amount: total });
  } catch (e) {
    console.error("create-order error", e);
    return json({ error: "Internal error" }, 500);
  }
});
