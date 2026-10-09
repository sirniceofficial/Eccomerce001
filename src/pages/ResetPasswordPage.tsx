import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SimpleHeader from "@/components/SimpleHeader";
import SimpleFooter from "@/components/SimpleFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import { AuthErrorCard } from "@/components/AuthErrorCard";
import { mapAuthError, logAuthError, type FriendlyAuthError } from "@/lib/authErrors";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<{ friendly: FriendlyAuthError; traceId: string | null } | null>(null);

  useEffect(() => {
    // Supabase recovery links arrive with #type=recovery in the URL hash;
    // the SDK will fire onAuthStateChange with PASSWORD_RECOVERY.
    const hash = window.location.hash || "";
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const errCode = params.get("error_code") || params.get("error");
    const errDesc = params.get("error_description");
    if (errCode || errDesc) {
      const friendly = mapAuthError(errDesc || errCode || "Invalid recovery link");
      logAuthError({ event: "password_reset_failed", errorCode: errCode, errorMessage: errDesc }).then((traceId) => {
        setError({ friendly, traceId });
      });
      return;
    }
    if (hash.includes("type=recovery") || hash.includes("access_token")) {
      setReady(true);
    }
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError({ friendly: { title: "Password too short", message: "Use at least 8 characters." }, traceId: null });
      return;
    }
    if (password !== confirm) {
      setError({ friendly: { title: "Passwords don't match", message: "Re-enter the same password in both fields." }, traceId: null });
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      const friendly = mapAuthError(err.message);
      const traceId = await logAuthError({
        event: "password_reset_failed",
        errorMessage: err.message,
      });
      setError({ friendly, traceId });
      return;
    }
    setDone(true);
    void logAuthError({ event: "password_reset_completed" });
    toast.success("Password updated");
    setTimeout(() => navigate("/"), 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SimpleHeader />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-md">
        <h1 className="text-2xl font-semibold mb-6">Reset your password</h1>
        {!ready && !done && (
          <p className="text-muted-foreground text-sm">
            Open this page from the password reset email link. If you arrived here by accident, you can request a new link from the login screen.
          </p>
        )}
        {done && (
          <div className="rounded-md border border-primary/40 bg-primary/5 p-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <p>Password updated. Redirecting…</p>
          </div>
        )}
        {ready && !done && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={8}
                disabled={loading}
              />
            </div>
            {error && <AuthErrorCard error={error.friendly} traceId={error.traceId} />}
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update password"}
            </Button>
          </form>
        )}
      </main>
      <SimpleFooter />
    </div>
  );
};

export default ResetPasswordPage;
