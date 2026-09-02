import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { isSupabaseConfigured } from '../lib/supabase';
import { Eye, EyeOff, AlertCircle, Sparkles, Layers, Shield, MessageSquare } from 'lucide-react';
import { InfineonLogo } from '../components/ui';

type Mode = 'signin' | 'signup' | 'reset';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.348 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  );
}

export function Login() {
  const { signIn, signUp, resetPassword, signInWithGoogle, continueAsGuest } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    if (mode === 'signin') {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    } else if (mode === 'signup') {
      if (!name.trim()) { setError('Please enter your name.'); setLoading(false); return; }
      const { error } = await signUp(email, password, name);
      if (error) setError(error);
      else setInfo('Check your email to confirm your account, then sign in. Your hub is waiting.');
    } else {
      const { error } = await resetPassword(email);
      if (error) setError(error);
      else setInfo('Password reset email sent. Check your inbox.');
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.includes('provider is not enabled')
        ? 'Google sign-in is not enabled yet. In the Supabase dashboard, open Authentication → Providers → Google, add your Google Cloud OAuth Client ID and secret, and add this site URL to Redirect URLs.'
        : error);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden p-10 text-white"
        style={{ background: 'linear-gradient(165deg, #06534B 0%, #0A8276 48%, #0E9B8C 100%)' }}>
        <div className="hub-mesh absolute inset-0 opacity-40" />
        <div className="relative">
          <InfineonLogo inverted />
        </div>
        <div className="relative max-w-md space-y-8">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/70 mb-3">Open source, built like a product</p>
            <h1 className="text-4xl leading-tight text-white mb-4">The workspace UX teams wish they had.</h1>
            <p className="text-white/80 text-base leading-relaxed">
              Thirteen living sections. Semantic versioning. Research, IA, heuristics, and changelog — one hub, zero scatter.
            </p>
          </div>
          <ul className="space-y-4">
            {[
              { icon: Layers, t: 'Full project memory', d: 'Cover to changelog, auto-saved as you design.' },
              { icon: Shield, t: 'Your account, your cloud', d: 'Sign in to persist. Guest stays on this device only.' },
              { icon: MessageSquare, t: 'Ask the hub anything', d: 'Bring your own API key. The assistant already knows your projects.' },
            ].map(item => (
              <li key={item.t} className="flex gap-3">
                <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20">
                  <item.icon size={16} />
                </span>
                <div>
                  <p className="text-sm font-semibold">{item.t}</p>
                  <p className="text-sm text-white/75">{item.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-white/60">© Software Transformation Team · BELEG</p>
      </aside>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[420px]">
          <div className="lg:hidden mb-8">
            <InfineonLogo />
          </div>

          <div className="mb-7">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-ocean-50 px-2.5 py-1 text-xs text-primary mb-4">
              <Sparkles size={12} /> UX Project Hub
            </div>
            <h2 className="text-foreground mb-1">
              {mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Create your hub' : 'Reset password'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === 'signin' && 'Sign in to sync projects across devices.'}
              {mode === 'signup' && 'Start documenting design work like a product team.'}
              {mode === 'reset' && 'Enter your email and we will send a reset link.'}
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-destructive/10 border border-destructive/20 rounded-xl text-xs text-destructive mb-4">
              <AlertCircle size={13} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}
          {info && (
            <div className="px-3 py-2.5 bg-success/10 border border-success/20 rounded-xl text-xs text-success mb-4">
              {info}
            </div>
          )}

          {mode !== 'reset' && (
            <>
              <button
                type="button"
                onClick={handleGoogle}
                disabled={googleLoading || !isSupabaseConfigured}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground hover:bg-muted hover:border-primary/40 transition-all disabled:opacity-50 shadow-sm"
                style={{ fontWeight: 600 }}
              >
                <GoogleIcon />
                {googleLoading
                  ? 'Redirecting to Google…'
                  : mode === 'signup'
                    ? 'Sign up with Google'
                    : 'Sign in with Google'}
              </button>
              <div className="flex items-center gap-3 my-5">
                <span className="flex-1 h-px bg-border" />
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground">or with email</span>
                <span className="flex-1 h-px bg-border" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-widest mb-1.5 block">Full name</label>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Your name" required
                  className="w-full border border-border rounded-xl bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            )}

            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-widest mb-1.5 block">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com" required
                className="w-full border border-border rounded-xl bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>

            {mode !== 'reset' && (
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-widest mb-1.5 block">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required minLength={6}
                    className="w-full border border-border rounded-xl bg-card px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                  <button type="button" onClick={() => setShowPw(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {mode === 'signin' && (
                  <button type="button" onClick={() => { setMode('reset'); setError(null); setInfo(null); }}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors mt-1.5 block">
                    Forgot password?
                  </button>
                )}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full mt-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm transition-all hover:bg-ocean-600 disabled:opacity-50 shadow-sm"
              style={{ fontWeight: 600 }}>
              {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-border text-center text-xs text-muted-foreground">
            {mode === 'signin' ? (
              <>Don&apos;t have an account?{' '}
                <button onClick={() => { setMode('signup'); setError(null); setInfo(null); }}
                  className="text-primary hover:underline" style={{ fontWeight: 600 }}>Sign up</button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => { setMode('signin'); setError(null); setInfo(null); }}
                  className="text-primary hover:underline" style={{ fontWeight: 600 }}>Sign in</button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={continueAsGuest}
            className="mt-6 w-full py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted border border-dashed border-border transition-all"
          >
            Continue as guest — work stays on this browser until you sign in
          </button>
        </div>
      </div>
    </div>
  );
}
