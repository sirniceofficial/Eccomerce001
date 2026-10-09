import { useState } from 'react';
import InfoModal from './InfoModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { AuthErrorCard } from '@/components/AuthErrorCard';
import {
  mapAuthError,
  logAuthError,
  signInWithGoogleWithRetry,
  validateOAuthRedirect,
  type FriendlyAuthError,
} from '@/lib/authErrors';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup?: () => void;
  onSwitchToLogin?: () => void;
}

type AuthErrorState = { friendly: FriendlyAuthError; traceId: string | null } | null;

const GoogleButton = ({
  loading,
  onError,
}: {
  loading: boolean;
  onError: (e: AuthErrorState) => void;
}) => {
  const [busy, setBusy] = useState(false);
  const handleGoogle = async () => {
    onError(null);
    const redirect = `${window.location.origin}/`;
    const misconfig = validateOAuthRedirect(redirect);
    if (misconfig) {
      const friendly: FriendlyAuthError = {
        title: 'Google sign-in misconfigured',
        message: misconfig,
        hint: 'Contact support so we can update the allowed redirect URLs.',
      };
      const traceId = await logAuthError({
        event: 'oauth_failed',
        errorCode: 'redirect_uri_invalid',
        errorMessage: misconfig,
      });
      onError({ friendly, traceId });
      return;
    }
    setBusy(true);
    const { error } = await signInWithGoogleWithRetry(redirect);
    setBusy(false);
    if (error) {
      const friendly = mapAuthError(error.message);
      const traceId = await logAuthError({
        event: 'oauth_failed',
        errorMessage: error.message,
      });
      onError({ friendly, traceId });
    }
  };
  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogle}
      disabled={loading || busy}
      className="w-full bg-card-light border-card-light-foreground/25 text-card-light-foreground hover:bg-card-light-foreground/10"
    >
      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue with Google'}
    </Button>
  );
};

export const LoginModal = ({ isOpen, onClose, onSwitchToSignup }: AuthModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<AuthErrorState>(null);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    const { error } = await signIn(email, password);

    if (error) {
      const friendly = mapAuthError(error.message);
      const traceId = await logAuthError({
        event: 'signin_failed',
        errorMessage: error.message,
      });
      setAuthError({ friendly, traceId });
    } else {
      toast.success('Welcome back!');
      void logAuthError({ event: 'signin_success', errorMessage: email });
      setEmail('');
      setPassword('');
      onClose();
    }
    setLoading(false);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!email) {
      setAuthError({
        friendly: { title: 'Email required', message: 'Enter the email address on your account.' },
        traceId: null,
      });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      const friendly = mapAuthError(error.message);
      const traceId = await logAuthError({
        event: 'password_reset_failed',
        errorMessage: error.message,
      });
      setAuthError({ friendly, traceId });
      return;
    }
    await logAuthError({ event: 'password_reset_requested', errorMessage: email });
    setResetSent(true);
  };

  const handleClose = () => {
    setAuthError(null);
    setForgotMode(false);
    setResetSent(false);
    onClose();
  };

  return (
    <InfoModal isOpen={isOpen} onClose={handleClose} title={forgotMode ? 'Forgot password' : 'Login'}>
      {forgotMode ? (
        resetSent ? (
          <div className="space-y-3">
            <p className="text-card-light-foreground">
              If an account exists for <strong>{email}</strong>, we've sent a password reset link. Check your inbox and spam folder.
            </p>
            <Button onClick={handleClose} className="bg-primary text-primary-foreground hover:bg-secondary">
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleForgot} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="bg-card-light-foreground/5 border-card-light-foreground/20 text-card-light-foreground"
            />
            {authError && <AuthErrorCard error={authError.friendly} traceId={authError.traceId} />}
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-secondary">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send reset link'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setForgotMode(false); setAuthError(null); }}
                disabled={loading}
                className="bg-card-light border-card-light-foreground/25 text-card-light-foreground hover:bg-card-light-foreground/10"
              >
                Back
              </Button>
            </div>
          </form>
        )
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="bg-card-light-foreground/5 border-card-light-foreground/20 text-card-light-foreground"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="bg-card-light-foreground/5 border-card-light-foreground/20 text-card-light-foreground"
          />
          {authError && <AuthErrorCard error={authError.friendly} traceId={authError.traceId} />}
          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-secondary">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Login'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => { onClose(); onSwitchToSignup?.(); }}
              disabled={loading}
              className="bg-card-light border-card-light-foreground/25 text-card-light-foreground hover:bg-card-light-foreground/10"
            >
              Sign Up
            </Button>
          </div>
          <div className="flex items-center gap-2 text-xs text-card-light-foreground/70">
            <span className="flex-1 h-px bg-card-light-foreground/20" />
            <span>or</span>
            <span className="flex-1 h-px bg-card-light-foreground/20" />
          </div>
          <GoogleButton loading={loading} onError={setAuthError} />
          <button
            type="button"
            onClick={() => { setForgotMode(true); setAuthError(null); }}
            className="text-sm text-card-light-foreground/80 underline hover:text-card-light-foreground"
          >
            Forgot password?
          </button>
        </form>
      )}
    </InfoModal>
  );
};

export const SignupModal = ({ isOpen, onClose, onSwitchToLogin }: AuthModalProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<AuthErrorState>(null);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (password.length < 8) {
      setAuthError({
        friendly: { title: 'Password too short', message: 'Use at least 8 characters.' },
        traceId: null,
      });
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, name);

    if (error) {
      const friendly = mapAuthError(error.message);
      const traceId = await logAuthError({
        event: 'signup_failed',
        errorMessage: error.message,
      });
      setAuthError({ friendly, traceId });
    } else {
      toast.success('Account created! Check your email to confirm.');
      setName('');
      setEmail('');
      setPassword('');
      onClose();
    }
    setLoading(false);
  };

  return (
    <InfoModal isOpen={isOpen} onClose={onClose} title="Create Account">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
          className="bg-card-light-foreground/5 border-card-light-foreground/20 text-card-light-foreground"
        />
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          className="bg-card-light-foreground/5 border-card-light-foreground/20 text-card-light-foreground"
        />
        <Input
          type="password"
          placeholder="Password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          disabled={loading}
          className="bg-card-light-foreground/5 border-card-light-foreground/20 text-card-light-foreground"
        />
        {authError && <AuthErrorCard error={authError.friendly} traceId={authError.traceId} />}
        <div className="flex gap-2">
          <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-secondary">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => { onClose(); onSwitchToLogin?.(); }}
            disabled={loading}
            className="bg-card-light border-card-light-foreground/25 text-card-light-foreground hover:bg-card-light-foreground/10"
          >
            Login
          </Button>
        </div>
        <div className="flex items-center gap-2 text-xs text-card-light-foreground/70">
          <span className="flex-1 h-px bg-card-light-foreground/20" />
          <span>or</span>
          <span className="flex-1 h-px bg-card-light-foreground/20" />
        </div>
        <GoogleButton loading={loading} onError={setAuthError} />
      </form>
    </InfoModal>
  );
};
