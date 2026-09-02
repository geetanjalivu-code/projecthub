import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthProvider';
import { InfineonLogo } from '../components/ui';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

export function ResetPassword() {
  const { updatePassword, signOut, session } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (!session) {
      setError('This reset link is invalid or expired. Request a new one from the sign-in page.');
      return;
    }
    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);
    if (error) { setError(error); return; }
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-[420px]">
        <div className="mb-8">
          <InfineonLogo />
        </div>
        <h2 className="text-foreground mb-1">Set a new password</h2>
        <p className="text-sm text-muted-foreground mb-6">Choose a password for your hub account, then sign in with it.</p>

        {error && (
          <div className="flex items-start gap-2 px-3 py-2.5 bg-destructive/10 border border-destructive/20 text-xs text-destructive mb-4">
            <AlertCircle size={13} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-widest mb-1.5 block">New password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required minLength={6}
                className="w-full border border-border bg-card px-3 py-2.5 pr-10 text-sm"
              />
              <button type="button" onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-widest mb-1.5 block">Confirm password</label>
            <input
              type={showPw ? 'text' : 'password'}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required minLength={6}
              className="w-full border border-border bg-card px-3 py-2.5 text-sm"
            />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-primary text-primary-foreground text-sm hover:bg-neutral-700 disabled:opacity-50"
            style={{ fontWeight: 600 }}>
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
        <button type="button" onClick={async () => { await signOut(); navigate('/'); }}
          className="mt-5 text-xs text-muted-foreground hover:text-primary">
          Back to sign in
        </button>
      </div>
    </div>
  );
}
