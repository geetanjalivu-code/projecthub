import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, DbProfile } from '../lib/supabase';

const GUEST_KEY = 'uxHub_guest';

interface AuthCtx {
  user: User | null;
  profile: DbProfile | null;
  session: Session | null;
  loading: boolean;
  isGuest: boolean;
  isAuthenticated: boolean;
  authReady: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  continueAsGuest: () => void;
  exitGuest: () => void;
  signOut: () => Promise<void>;
  updateProfile: (fields: Partial<Pick<DbProfile, 'display_name' | 'avatar_url'>>) => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
}

const Ctx = createContext<AuthCtx>(null!);
export const useAuth = () => useContext(Ctx);

function profileFromUser(user: User): DbProfile {
  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    display_name: (meta.full_name || meta.name || meta.display_name || user.email?.split('@')[0] || 'Designer') as string,
    email: user.email ?? '',
    avatar_url: (meta.avatar_url || meta.picture || null) as string | null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem(GUEST_KEY) === '1');

  const fetchProfile = async (u: User) => {
    const fallback = profileFromUser(u);
    setProfile(fallback);
    const { data } = await supabase.from('profiles').select('*').eq('id', u.id).maybeSingle();
    if (data) {
      setProfile(data as DbProfile);
      return;
    }
    await supabase.from('profiles').upsert({
      id: u.id,
      display_name: fallback.display_name,
      email: fallback.email,
      avatar_url: fallback.avatar_url,
      updated_at: new Date().toISOString(),
    });
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        localStorage.removeItem(GUEST_KEY);
        setIsGuest(false);
        fetchProfile(session.user);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        localStorage.removeItem(GUEST_KEY);
        setIsGuest(false);
        fetchProfile(session.user);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const mapAuthError = (message: string | undefined | null) => {
    const m = (message ?? '').toLowerCase();
    if (!message) return null;
    if (m.includes('email not confirmed')) {
      return 'Email confirmation is still enabled. In Supabase go to Authentication → Providers → Email and turn Confirm email OFF, then sign in again. (Or open the confirmation email first.)';
    }
    if (m.includes('invalid login credentials')) {
      return 'Wrong email or password. If you just signed up, create the account on the Sign up tab, or reset the password.';
    }
    if (m.includes('provider is not enabled') || m.includes('unsupported provider')) {
      return 'Google is not enabled. In Supabase: Authentication → Providers → Google → enable it, paste the Google Cloud Client ID and Client secret, then add this site URL under Authentication → URL configuration → Redirect URLs.';
    }
    if (m.includes('failed to fetch') || m.includes('network')) {
      return 'Cannot reach Supabase. Check VITE_SUPABASE_URL in `.env` (or the Connect Supabase fields) and that the project is not paused.';
    }
    return message;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return { error: mapAuthError(error?.message) };
  };

  const signUp = async (email: string, password: string, name: string) => {
    const trimmed = email.trim();
    const { data, error } = await supabase.auth.signUp({
      email: trimmed,
      password,
      options: {
        data: { full_name: name.trim() },
        emailRedirectTo: window.location.origin,
      },
    });
    if (data.session) return { error: null };

    const already = (error?.message ?? '').toLowerCase().includes('already registered');
    if (!error || already) {
      const second = await supabase.auth.signInWithPassword({ email: trimmed, password });
      if (second.data.session) return { error: null };
      if (second.error) return { error: mapAuthError(second.error.message) };
    }

    if (data.user && !data.session) {
      return {
        error: mapAuthError('Email not confirmed'),
      };
    }
    return { error: mapAuthError(error?.message) };
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      return { error: 'Add your Supabase URL and anon key first (Connect Supabase on this page, or `.env`).' };
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { access_type: 'offline', prompt: 'select_account' },
      },
    });
    return { error: mapAuthError(error?.message) };
  };

  const continueAsGuest = () => {
    localStorage.setItem(GUEST_KEY, '1');
    setIsGuest(true);
  };

  const exitGuest = () => {
    localStorage.removeItem(GUEST_KEY);
    setIsGuest(false);
  };

  const signOut = async () => {
    localStorage.removeItem(GUEST_KEY);
    setIsGuest(false);
    if (isSupabaseConfigured) await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const updateProfile = async (fields: Partial<Pick<DbProfile, 'display_name' | 'avatar_url'>>) => {
    if (!user) {
      setProfile(prev => (prev ? { ...prev, ...fields } : null));
      return;
    }
    await supabase.from('profiles').upsert({
      id: user.id,
      display_name: fields.display_name ?? profile?.display_name ?? '',
      email: profile?.email ?? user.email ?? '',
      avatar_url: fields.avatar_url ?? profile?.avatar_url ?? null,
      updated_at: new Date().toISOString(),
    });
    setProfile(prev => (prev ? { ...prev, ...fields } : { ...profileFromUser(user), ...fields }));
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    return { error: error?.message ?? null };
  };

  const isAuthenticated = !!user;
  const authReady = isAuthenticated || isGuest;

  return (
    <Ctx.Provider value={{
      user, profile, session, loading, isGuest, isAuthenticated, authReady,
      signIn, signUp, signInWithGoogle, continueAsGuest, exitGuest,
      signOut, updateProfile, resetPassword,
    }}>
      {children}
    </Ctx.Provider>
  );
}
