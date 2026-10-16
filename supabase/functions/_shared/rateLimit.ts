// Shared rate limiter for edge functions, backed by Postgres.
// Keep simple: count requests in window, insert new row.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface RateLimitOptions {
  userId: string;
  functionName: string;
  windowSeconds: number;
  max: number;
}

export async function checkRateLimit(opts: RateLimitOptions): Promise<{ allowed: boolean; retryAfter?: number }> {
  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SECRET_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, serviceKey);
  const sinceIso = new Date(Date.now() - opts.windowSeconds * 1000).toISOString();

  const { count, error } = await admin
    .from("edge_rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("user_id", opts.userId)
    .eq("function_name", opts.functionName)
    .gte("created_at", sinceIso);

  if (error) {
    // Fail open but log
    console.error("rate limit query error", error);
    return { allowed: true };
  }

  if ((count ?? 0) >= opts.max) {
    return { allowed: false, retryAfter: opts.windowSeconds };
  }

  await admin.from("edge_rate_limits").insert({
    user_id: opts.userId,
    function_name: opts.functionName,
  });

  // Best-effort cleanup of old rows
  admin
    .from("edge_rate_limits")
    .delete()
    .lt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .then(() => {});

  return { allowed: true };
}

export const MAX_BODY_BYTES = 16 * 1024; // 16 KB

export async function readJsonWithLimit(req: Request, maxBytes = MAX_BODY_BYTES): Promise<{ ok: true; data: any } | { ok: false; error: string; status: number }> {
  const lenHeader = req.headers.get("content-length");
  if (lenHeader && Number(lenHeader) > maxBytes) {
    return { ok: false, error: "Payload too large", status: 413 };
  }
  const text = await req.text();
  if (text.length > maxBytes) {
    return { ok: false, error: "Payload too large", status: 413 };
  }
  try {
    return { ok: true, data: JSON.parse(text) };
  } catch {
    return { ok: false, error: "Invalid JSON", status: 400 };
  }
}
