import { Button } from "@/components/ui/button";
import { AlertCircle, LifeBuoy } from "lucide-react";
import type { FriendlyAuthError } from "@/lib/authErrors";

interface Props {
  error: FriendlyAuthError;
  traceId?: string | null;
  supportEmail?: string;
}

export const AuthErrorCard = ({ error, traceId, supportEmail = "support@remmyhomes.co.ke" }: Props) => {
  const subject = encodeURIComponent(`Sign-in help${traceId ? ` (Trace ${traceId})` : ""}`);
  const body = encodeURIComponent(
    `Hi support team,\n\nI ran into an issue signing in.\n\nWhat happened: ${error.title} — ${error.message}\nTrace ID: ${traceId ?? "n/a"}\nURL: ${typeof window !== "undefined" ? window.location.href : ""}\n`
  );
  return (
    <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
      <div className="flex items-start gap-2">
        <AlertCircle className="w-4 h-4 mt-0.5 text-destructive shrink-0" />
        <div className="flex-1 space-y-1">
          <p className="font-medium text-destructive">{error.title}</p>
          <p className="text-foreground/80">{error.message}</p>
          {error.hint && <p className="text-muted-foreground text-xs">{error.hint}</p>}
          {traceId && (
            <p className="text-xs text-muted-foreground">
              Trace ID: <code className="font-mono">{traceId}</code>
            </p>
          )}
          <div className="pt-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              asChild
            >
              <a href={`mailto:${supportEmail}?subject=${subject}&body=${body}`}>
                <LifeBuoy className="w-3.5 h-3.5 mr-1.5" /> Contact support
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
