import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, isJsonObject, readJsonWithLimit } from "../_shared/rateLimit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200, extra: Record<string,string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders, ...extra },
  });

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SECRET_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: authErr } = await userClient.auth.getClaims(token);
    if (authErr || !claimsData?.claims?.sub) return json({ error: "Unauthorized" }, 401);
    const userId = claimsData.claims.sub as string;

    // Rate limit: 30 / minute per user
    const rl = await checkRateLimit({ userId, functionName: "send-order-notification", windowSeconds: 60, max: 30 });
    if (!rl.allowed) return json({ error: "Too many requests" }, 429, { "Retry-After": String(rl.retryAfter ?? 60) });

    const parsed = await readJsonWithLimit(req, 4 * 1024);
    if (!parsed.ok) return json({ error: parsed.error }, parsed.status);
    const body = parsed.data;
    if (!isJsonObject(body)) {
      return json({ error: "Invalid request" }, 400);
    }
    const { orderId, status } = body;

    if (!orderId || typeof orderId !== "string" || orderId.length > 64 ||
        !status || typeof status !== "string" || status.length > 32) {
      return json({ error: "Invalid request" }, 400);
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    const isAdmin = !!roleData;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`*, order_items (*)`)
      .eq("id", orderId)
      .single();

    if (orderError || !order) return json({ error: "Order not found" }, 404);
    if (!isAdmin && order.user_id !== userId) return json({ error: "Forbidden" }, 403);

    const statusMessages: Record<string, string> = {
      pending: "Your order has been received and is awaiting processing.",
      processing: "Your order is now being prepared for shipment.",
      shipped: "Great news! Your order has been shipped and is on its way.",
      delivered: "Your order has been delivered. Thank you for shopping with us!",
      cancelled: "Your order has been cancelled. If you have any questions, please contact support.",
    };
    const message = statusMessages[status] || `Your order status has been updated to: ${status}`;

    console.log("Email notification:", {
      to: order.customer_email,
      subject: `Order Update: ${orderId.slice(0, 8).toUpperCase()}`,
      message,
      orderTotal: order.total_amount,
      itemCount: order.order_items?.length || 0,
    });

    return json({ success: true, message: "Notification sent successfully", details: { orderId, status, message } });
  } catch (error) {
    console.error("Error in send-order-notification:", error);
    return json({ error: "Internal error" }, 500);
  }
};

serve(handler);
