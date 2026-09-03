import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../lib/supabase';
import { useAiSettings } from '../ai/AiSettingsProvider';
import { detectAiProvider, OPENAI_MODELS, GEMINI_MODELS, AiProvider } from '../lib/ai';
import { X, LogOut, User, Lock, Check, KeyRound, LogIn } from 'lucide-react';

interface Props { onClose: () => void; }

export function ProfileModal({ onClose }: Props) {
  const { user, profile, updateProfile, signOut, isGuest, exitGuest } = useAuth();
  const { settings, saveSettings } = useAiSettings();
  const [name, setName] = useState(profile?.display_name ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [newPw, setNewPw] = useState('');
  const [pwErr, setPwErr] = useState<string | null>(null);
  const [pwOk, setPwOk] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [model, setModel] = useState(settings.model);
  const [aiProvider, setAiProvider] = useState<AiProvider>(settings.provider);
  const [aiSaved, setAiSaved] = useState(false);

  const authProviders = user?.app_metadata?.providers as string[] | undefined;
  const authProvider = (user?.app_metadata?.provider as string | undefined) || authProviders?.[0];
  const isGoogle = authProvider === 'google' || !!user?.identities?.some(i => i.provider === 'google');
  const canChangePassword = !!user && !isGuest && !isGoogle;

  const saveName = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await updateProfile({ display_name: name.trim() });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const changePassword = async () => {
    setPwErr(null);
    if (!newPw || newPw.length < 6) { setPwErr('New password must be at least 6 characters.'); return; }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setPwLoading(false);
    if (error) setPwErr(error.message);
    else { setPwOk(true); setNewPw(''); setTimeout(() => setPwOk(false), 3000); }
  };

  const saveAi = async () => {
    const next = detectAiProvider(apiKey, aiProvider);
    await saveSettings({ apiKey, model, provider: next });
    setAiProvider(next);
    setAiSaved(true);
    setTimeout(() => setAiSaved(false), 2000);
  };

  const handleSignOut = async () => { await signOut(); onClose(); };
  const handleSignIn = () => { exitGuest(); onClose(); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/25 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-foreground">Account settings</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 ring-2 ring-muted"
              style={{ fontWeight: 600, fontSize: '1rem' }}>
              {(profile?.display_name ?? profile?.email ?? (isGuest ? 'G' : '?')).charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-foreground" style={{ fontWeight: 600 }}>{profile?.display_name || (isGuest ? 'Guest designer' : '—')}</p>
              <p className="text-xs text-muted-foreground truncate">{profile?.email || (isGuest ? 'Not signed in' : '')}</p>
              {isGuest && <p className="text-xs text-primary mt-0.5">Guest — sign in to save to the cloud</p>}
              {isGoogle && !isGuest && <p className="text-xs text-muted-foreground mt-0.5">Signed in with Google</p>}
            </div>
          </div>

          {!isGuest && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <User size={13} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground uppercase tracking-widest">Display name</span>
              </div>
              <div className="flex gap-2">
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  className="flex-1 border border-border rounded-xl bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                <button onClick={saveName} disabled={saving || name === profile?.display_name}
                  className="px-3 py-2 bg-primary text-primary-foreground text-sm transition-all hover:bg-neutral-700 disabled:opacity-40 flex items-center gap-1.5"
                  style={{ fontWeight: 600 }}>
                  {saved ? <><Check size={13} /> Saved</> : saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          )}

          {canChangePassword && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lock size={13} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground uppercase tracking-widest">Change password</span>
              </div>
              <div className="space-y-2">
                <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
                  placeholder="New password (min 6 chars)"
                  className="w-full border border-border rounded-xl bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                {pwErr && <p className="text-xs text-destructive">{pwErr}</p>}
                {pwOk && <p className="text-xs text-success">Password updated successfully.</p>}
                <button onClick={changePassword} disabled={pwLoading || !newPw}
                  className="px-4 py-2 border border-border rounded-xl text-sm text-foreground hover:bg-muted transition-colors disabled:opacity-40"
                  style={{ fontWeight: 600 }}>
                  {pwLoading ? 'Updating…' : 'Update password'}
                </button>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-3">
              <KeyRound size={13} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground uppercase tracking-widest">Hub Guide API key</span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {isGuest
                ? 'Stored only for this guest session on this device. Sign in to keep the key with your account.'
                : 'Stored on your account and loaded when you sign in. Not shared with other users on this browser.'}
            </p>
            <div className="space-y-2">
              <input type="password" value={apiKey} onChange={e => {
                setApiKey(e.target.value);
                setAiProvider(detectAiProvider(e.target.value, aiProvider));
              }}
                placeholder="AIza… or sk-…"
                className="w-full border border-border bg-card px-3 py-2 text-sm" />
              <select value={aiProvider} onChange={e => {
                const p = e.target.value as AiProvider;
                setAiProvider(p);
                setModel(p === 'gemini' ? GEMINI_MODELS[0] : OPENAI_MODELS[0]);
              }} className="w-full border border-border bg-card px-3 py-2 text-xs">
                <option value="openai">OpenAI</option>
                <option value="gemini">Gemini</option>
              </select>
              <select value={model} onChange={e => setModel(e.target.value)}
                className="w-full border border-border bg-card px-3 py-2 text-xs">
                {(aiProvider === 'gemini' ? GEMINI_MODELS : OPENAI_MODELS).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <button onClick={saveAi}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm hover:bg-neutral-700"
                style={{ fontWeight: 600 }}>
                {aiSaved ? 'Key saved' : 'Save API key'}
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border">
          {isGuest ? (
            <button onClick={handleSignIn}
              className="flex items-center gap-2 text-sm text-primary hover:opacity-80 transition-opacity"
              style={{ fontWeight: 600 }}>
              <LogIn size={14} /> Sign in to save
            </button>
          ) : (
            <button onClick={handleSignOut}
              className="flex items-center gap-2 text-sm text-destructive hover:opacity-80 transition-opacity"
              style={{ fontWeight: 600 }}>
              <LogOut size={14} /> Sign out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
