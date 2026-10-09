import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit } from "../_shared/rateLimit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ActivityData {
  productTitle: string;
  category: string;
  viewCount: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const publishableKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, publishableKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rateLimit = await checkRateLimit({ userId: user.id, functionName: "shopping-recommendations", windowSeconds: 60, max: 15 });
    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please slow down." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": String(rateLimit.retryAfter ?? 60) },
      });
    }

    const maxBodyBytes = 32 * 1024;
    if (Number(req.headers.get("content-length") || "0") > maxBodyBytes) {
      return new Response(JSON.stringify({ error: "Payload too large" }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rawBody = await req.text();
    if (rawBody.length > maxBodyBytes) {
      return new Response(JSON.stringify({ error: "Payload too large" }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let activities: ActivityData[] = [];
    try {
      const body = JSON.parse(rawBody || "{}");
      activities = Array.isArray(body.activities) ? body.activities.slice(0, 50) : [];
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const categoryViews = new Map<string, number>();
    const productViews = new Map<string, number>();
    for (const activity of activities) {
      if (!activity || typeof activity.productTitle !== "string" || typeof activity.category !== "string") continue;
      const viewCount = Number.isFinite(activity.viewCount) ? Math.max(0, activity.viewCount) : 0;
      categoryViews.set(activity.category, (categoryViews.get(activity.category) ?? 0) + viewCount);
      productViews.set(activity.productTitle, (productViews.get(activity.productTitle) ?? 0) + viewCount);
    }

    const favoriteCategory = [...categoryViews.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    const mostViewedProducts = [...productViews.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([title]) => title);
    const recommendation = favoriteCategory
      ? `You have been exploring ${favoriteCategory} the most. You may enjoy more items in this category. Products you viewed most include: ${mostViewedProducts.join(", ")}.`
      : "Start browsing products to get shopping suggestions tailored to your interests.";

    return new Response(JSON.stringify({ recommendation }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Shopping recommendations error:", error);
    return new Response(JSON.stringify({ error: "Unable to process request" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});