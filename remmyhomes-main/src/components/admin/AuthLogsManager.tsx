import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, RefreshCw, Search } from 'lucide-react';

interface LogRow {
  id: string;
  trace_id: string;
  event: string;
  error_code: string | null;
  error_message: string | null;
  user_id: string | null;
  created_at: string;
}

const GROUPS: Record<string, string[]> = {
  all: [],
  signin: ['signin_success', 'signin_failed', 'oauth_failed', 'signup_failed'],
  reset: ['password_reset_requested', 'password_reset_completed', 'password_reset_failed'],
  failed: ['signin_failed', 'signup_failed', 'oauth_failed', 'password_reset_failed', 'session_refresh_failed'],
};

const RANGES: Record<string, number> = { '24h': 1, '7d': 7, '30d': 30, all: 0 };

const label = (e: string) => e.replace(/_/g, ' ');
const variant = (e: string): 'destructive' | 'secondary' | 'default' =>
  e.endsWith('_failed') ? 'destructive' : e.endsWith('_success') || e.endsWith('_completed') ? 'default' : 'secondary';

export const AuthLogsManager = () => {
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [group, setGroup] = useState('all');
  const [range, setRange] = useState('7d');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('auth_error_logs').select('*').order('created_at', { ascending: false }).limit(300);
    if (GROUPS[group].length) q = q.in('event', GROUPS[group]);
    if (RANGES[range]) q = q.gte('created_at', new Date(Date.now() - RANGES[range] * 86400000).toISOString());
    const { data } = await q;
    setRows((data ?? []) as LogRow[]);
    setLoading(false);
  }, [group, range]);

  useEffect(() => { load(); }, [load]);

  const s = search.trim().toLowerCase();
  const filtered = s
    ? rows.filter((r) => [r.trace_id, r.user_id, r.error_message, r.error_code].some((v) => v?.toLowerCase().includes(s)))
    : rows;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Auth Security Logs</CardTitle>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 md:grid-cols-[1fr_200px_140px]">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2.5 top-3 text-muted-foreground" />
            <Input className="pl-8" placeholder="Search trace ID, user, email, message…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={group} onValueChange={setGroup}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All events</SelectItem>
              <SelectItem value="signin">Sign-in / sign-up</SelectItem>
              <SelectItem value="reset">Password reset</SelectItem>
              <SelectItem value="failed">Failures only</SelectItem>
            </SelectContent>
          </Select>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Trace</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{loading ? 'Loading…' : 'No events match.'}</TableCell></TableRow>
              )}
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap text-xs">{new Date(r.created_at).toLocaleString()}</TableCell>
                  <TableCell><Badge variant={variant(r.event)} className="capitalize whitespace-nowrap">{label(r.event)}</Badge></TableCell>
                  <TableCell className="max-w-sm break-words text-sm">
                    {r.error_code && <span className="font-mono text-xs mr-1">[{r.error_code}]</span>}
                    {r.error_message ?? '—'}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{r.user_id ? r.user_id.slice(0, 8) : '—'}</TableCell>
                  <TableCell className="font-mono text-xs">{r.trace_id}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthLogsManager;
