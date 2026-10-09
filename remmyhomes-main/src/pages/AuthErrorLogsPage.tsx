import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import SimpleHeader from "@/components/SimpleHeader";
import SimpleFooter from "@/components/SimpleFooter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, RefreshCw } from "lucide-react";

interface LogRow {
  id: string;
  trace_id: string;
  event: string;
  error_code: string | null;
  error_message: string | null;
  user_agent: string | null;
  url: string | null;
  user_id: string | null;
  created_at: string;
}

const EVENTS = [
  "all",
  "signin_failed",
  "signup_failed",
  "oauth_failed",
  "password_reset_failed",
  "password_reset_requested",
  "session_refresh_failed",
];

const AuthErrorLogsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [trace, setTrace] = useState("");
  const [userId, setUserId] = useState("");
  const [eventFilter, setEventFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    let q = supabase
      .from("auth_error_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (trace.trim()) q = q.eq("trace_id", trace.trim());
    if (userId.trim()) q = q.eq("user_id", userId.trim());
    if (eventFilter !== "all") q = q.eq("event", eventFilter);
    const { data, error } = await q;
    setLoading(false);
    if (!error) setRows((data ?? []) as LogRow[]);
  };

  useEffect(() => {
    if (isAdmin) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const filtered = useMemo(() => rows, [rows]);

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SimpleHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Auth Error Logs</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6 items-end">
          <div>
            <Label htmlFor="trace">Trace ID</Label>
            <Input id="trace" placeholder="e.g. a1b2c3d4e5f6" value={trace} onChange={(e) => setTrace(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="user">User ID</Label>
            <Input id="user" placeholder="UUID" value={userId} onChange={(e) => setUserId(e.target.value)} />
          </div>
          <div>
            <Label>Event</Label>
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {EVENTS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button onClick={load} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 mr-1" />}
              Search
            </Button>
            <Button variant="outline" onClick={() => { setTrace(""); setUserId(""); setEventFilter("all"); setTimeout(load, 0); }}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="border rounded-md overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr className="text-left">
                <th className="p-2">When</th>
                <th className="p-2">Trace</th>
                <th className="p-2">Event</th>
                <th className="p-2">User</th>
                <th className="p-2">Code</th>
                <th className="p-2">Message</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">No logs match.</td></tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className="border-t align-top">
                  <td className="p-2 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="p-2 font-mono text-xs">{r.trace_id}</td>
                  <td className="p-2">{r.event}</td>
                  <td className="p-2 font-mono text-xs">{r.user_id ?? "—"}</td>
                  <td className="p-2">{r.error_code ?? "—"}</td>
                  <td className="p-2 max-w-md break-words">{r.error_message ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <SimpleFooter />
    </div>
  );
};

export default AuthErrorLogsPage;
