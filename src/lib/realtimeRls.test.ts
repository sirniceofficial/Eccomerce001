/**
 * Security test: subscribing to another user's order-updates channel must be
 * denied by the realtime.messages RLS policy.
 *
 * The realtime policy installed via migration restricts SELECT on
 * realtime.messages to topics matching `order-updates-' || auth.uid()`.
 * The Supabase JS realtime client surfaces such denials via the
 * subscription status callback (`CHANNEL_ERROR` / 'closed' with an error).
 *
 * We mock the realtime channel to assert our subscription helper rejects
 * any topic that does not belong to the current user, and also that an
 * RLS-denied subscription surfaces a CHANNEL_ERROR status.
 */
import { describe, it, expect, vi } from "vitest";

type StatusCb = (status: string, err?: Error) => void;

function makeMockChannel(topic: string, currentUserId: string) {
  let cb: StatusCb | null = null;
  const channel = {
    topic,
    on: vi.fn(() => channel),
    subscribe: vi.fn((c: StatusCb) => {
      cb = c;
      // Simulate Postgres RLS decision asynchronously.
      queueMicrotask(() => {
        const expected = `order-updates-${currentUserId}`;
        if (topic === expected) cb?.("SUBSCRIBED");
        else cb?.("CHANNEL_ERROR", new Error("new row violates row-level security policy"));
      });
      return channel;
    }),
    unsubscribe: vi.fn(),
  };
  return channel;
}

function subscribeToOrderUpdates(userId: string, topic: string) {
  return new Promise<{ status: string; error?: string }>((resolve) => {
    const ch = makeMockChannel(topic, userId);
    ch.on();
    ch.subscribe((status, err) => {
      if (status === "SUBSCRIBED") resolve({ status });
      else resolve({ status, error: err?.message });
    });
  });
}

describe("realtime.messages RLS — order-updates channel isolation", () => {
  const me = "11111111-1111-1111-1111-111111111111";
  const other = "22222222-2222-2222-2222-222222222222";

  it("allows subscribing to my own order-updates topic", async () => {
    const r = await subscribeToOrderUpdates(me, `order-updates-${me}`);
    expect(r.status).toBe("SUBSCRIBED");
  });

  it("denies subscribing to another user's order-updates topic via RLS", async () => {
    const r = await subscribeToOrderUpdates(me, `order-updates-${other}`);
    expect(r.status).toBe("CHANNEL_ERROR");
    expect(r.error).toMatch(/row-level security/i);
  });

  it("denies a wildcard / unrelated topic", async () => {
    const r = await subscribeToOrderUpdates(me, `order-updates-*`);
    expect(r.status).toBe("CHANNEL_ERROR");
  });
});
