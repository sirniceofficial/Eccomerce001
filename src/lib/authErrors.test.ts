import { describe, it, expect, vi, beforeEach } from "vitest";
import { mapAuthError, signInWithGoogleWithRetry } from "./authErrors";

vi.mock("@/integrations/supabase/client", () => {
  const signInWithOAuth = vi.fn();
  const signOut = vi.fn().mockResolvedValue({ error: null });
  return {
    supabase: {
      auth: { signInWithOAuth, signOut },
    },
  };
});

import { supabase } from "@/integrations/supabase/client";

describe("Google sign-in invalid_request retry flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // jsdom location origin
    Object.defineProperty(window, "location", {
      value: { origin: "https://app.example.com", hostname: "app.example.com", href: "https://app.example.com/" },
      writable: true,
    });
  });

  it("clears the local session and retries when the provider returns invalid_request", async () => {
    const oauth = supabase.auth.signInWithOAuth as unknown as ReturnType<typeof vi.fn>;
    const signOut = supabase.auth.signOut as unknown as ReturnType<typeof vi.fn>;

    oauth
      .mockResolvedValueOnce({ data: null, error: { message: "invalid_request: stale state" } })
      .mockResolvedValueOnce({ data: { url: "https://accounts.google.com/o/oauth2/auth" }, error: null });

    const { error } = await signInWithGoogleWithRetry();

    expect(error).toBeNull();
    expect(oauth).toHaveBeenCalledTimes(2);
    expect(signOut).toHaveBeenCalledTimes(1);
    expect(signOut).toHaveBeenCalledWith({ scope: "local" });
  });

  it("surfaces a friendly UI message with a trace placeholder for invalid_request errors", async () => {
    const oauth = supabase.auth.signInWithOAuth as unknown as ReturnType<typeof vi.fn>;
    oauth
      .mockResolvedValueOnce({ data: null, error: { message: "invalid_request" } })
      .mockResolvedValueOnce({ data: null, error: { message: "invalid_request again" } });

    const { error } = await signInWithGoogleWithRetry();
    expect(error).not.toBeNull();
    const friendly = mapAuthError(error?.message ?? "");
    expect(friendly.title).toMatch(/sign-in request rejected/i);
    expect(friendly.message).toMatch(/stale|try again/i);
  });
});

describe("Reset password friendly errors", () => {
  it("maps an expired recovery token", () => {
    const f = mapAuthError("Token has expired or is invalid");
    expect(f.title).toMatch(/expired|invalid/i);
  });
  it("maps an already-used recovery link", () => {
    const f = mapAuthError("flow_state_not_found");
    expect(f.title).toMatch(/invalid recovery/i);
  });
  it("maps reusing the same password", () => {
    const f = mapAuthError("New password should be different from the old password");
    expect(f.title).toMatch(/already used/i);
  });
});
