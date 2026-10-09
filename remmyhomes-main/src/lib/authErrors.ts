import { supabase } from "@/integrations/supabase/client";


export interface FriendlyAuthError {
  title: string;
  message: string;
  hint?: string;
}

/** Map a raw Supabase auth error message into a friendly UI message. */
export function mapAuthError(raw?: string | null): FriendlyAuthError {
  const msg = (raw || "").toLowerCase();

  if (msg.includes("invalid login") || msg.includes("invalid credentials")) {
    return {
      title: "Incorrect email or password",
      message: "We couldn't sign you in with those details.",
      hint: "Double-check your email and password, or reset it if you've forgotten.",
    };
  }
  if (msg.includes("email not confirmed") || msg.includes("not confirmed")) {
    return {
      title: "Email not confirmed",
      message: "Please confirm your email address before signing in.",
      hint: "Check your inbox (and spam folder) for the confirmation link.",
    };
  }
  if (msg.includes("same password") || msg.includes("new password should be different")) {
    return {
      title: "Password already used",
      message: "Your new password must be different from your current one.",
    };
  }
  if (msg.includes("token has expired") || msg.includes("otp_expired") || msg.includes("expired")) {
    return {
      title: "Recovery link expired",
      message: "This password reset link is no longer valid.",
      hint: "Request a fresh password reset email and try again.",
    };
  }
  if (msg.includes("invalid token") || msg.includes("invalid_grant") || msg.includes("link is invalid") || msg.includes("invalid recovery") || msg.includes("flow_state_not_found")) {
    return {
      title: "Invalid recovery link",
      message: "We couldn't verify this password reset link.",
      hint: "It may have already been used. Request a new reset email.",
    };
  }
  if (msg.includes("expired") || msg.includes("link is invalid")) {
    return {
      title: "Link expired",
      message: "This link is no longer valid.",
      hint: "Request a new email and try again.",
    };
  }
  if (msg.includes("rate limit") || msg.includes("too many")) {
    return {
      title: "Too many attempts",
      message: "Please wait a minute before trying again.",
    };
  }
  if (msg.includes("invalid_request") || msg.includes("invalid request")) {
    return {
      title: "Sign-in request rejected",
      message: "Your previous session may be stale. Please try again.",
    };
  }
  if (msg.includes("pwned") || msg.includes("compromised")) {
    return {
      title: "Password is unsafe",
      message: "This password has appeared in a known data breach.",
      hint: "Choose a stronger, unique password.",
    };
  }
  if (msg.includes("network") || msg.includes("fetch")) {
    return {
      title: "Network error",
      message: "We couldn't reach the server. Check your connection and try again.",
    };
  }
  return {
    title: "Sign-in failed",
    message: raw || "Something went wrong. Please try again.",
  };
}

/** Best-effort log to auth_error_logs. Returns the trace ID, or null. */
export async function logAuthError(args: {
  event:
    | "signin_failed"
    | "signup_failed"
    | "oauth_failed"
    | "password_reset_failed"
    | "password_reset_requested"
    | "session_refresh_failed"
    | "signin_success"
    | "password_reset_completed";
  errorCode?: string | null;
  errorMessage?: string | null;
  userId?: string | null;
}): Promise<string | null> {
  try {
    const payload = {
      event: args.event,
      error_code: (args.errorCode || "").slice(0, 100) || null,
      error_message: (args.errorMessage || "").slice(0, 500) || null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 300) : null,
      url: typeof window !== "undefined" ? window.location.href.slice(0, 300) : null,
      user_id: args.userId ?? null,
    };
    const { data, error } = await supabase
      .from("auth_error_logs")
      .insert(payload)
      .select("trace_id")
      .single();
    if (error) {
      console.warn("auth log failed", error.message);
      return null;
    }
    return data?.trace_id ?? null;
  } catch {
    return null;
  }
}

/** Sign in with Google through the configured Supabase OAuth provider. */
export async function signInWithGoogleWithRetry(redirectTo?: string) {
  const target = redirectTo || `${window.location.origin}/`;
  try {
    const signIn = () => supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: target },
    });

    let result = await signIn();
    if (result.error?.message.toLowerCase().includes("invalid_request")) {
      await supabase.auth.signOut({ scope: "local" });
      result = await signIn();
    }

    if (result.error) return { error: result.error as Error };
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e : new Error("Google sign-in failed") };
  }
}


/** Sanity-check the OAuth redirect_uri so misconfigurations surface early. */
export function validateOAuthRedirect(redirect: string): string | null {
  try {
    const u = new URL(redirect);
    if (!["http:", "https:"].includes(u.protocol)) {
      return "Redirect URL must use http or https.";
    }
    if (u.hostname === "localhost" && window.location.hostname !== "localhost") {
      return "Redirect URL points to localhost but the app isn't running locally.";
    }
    if (u.origin !== window.location.origin) {
      return `Redirect URL ${u.origin} does not match the current origin ${window.location.origin}.`;
    }
    return null;
  } catch {
    return "Redirect URL is not a valid URL.";
  }
}
