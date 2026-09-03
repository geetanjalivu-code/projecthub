import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import {
  AiSettings, EMPTY_AI, normalizeAiSettings, detectAiProvider,
  loadGuestAi, saveGuestAi,
} from '../lib/ai';

interface AiCtx {
  settings: AiSettings;
  hasKey: boolean;
  saveSettings: (partial: Partial<AiSettings>) => Promise<void>;
}

const Ctx = createContext<AiCtx>(null!);
export const useAiSettings = () => useContext(Ctx);

async function loadUserAi(userId: string): Promise<AiSettings> {
  const { data } = await supabase
    .from('user_settings')
    .select('ai_api_key, ai_model, ai_provider')
    .eq('user_id', userId)
    .maybeSingle();
  if (!data) return { ...EMPTY_AI };
  return normalizeAiSettings({
    apiKey: data.ai_api_key ?? '',
    model: data.ai_model ?? '',
    provider: data.ai_provider as AiSettings['provider'],
  });
}

async function saveUserAi(userId: string, s: AiSettings) {
  const n = normalizeAiSettings(s);
  await supabase.from('user_settings').upsert({
    user_id: userId,
    ai_api_key: n.apiKey,
    ai_model: n.model,
    ai_provider: n.provider,
    updated_at: new Date().toISOString(),
  });
}

export async function importGuestAiToUser(userId: string) {
  const guest = loadGuestAi();
  if (!guest.apiKey) return;
  await saveUserAi(userId, guest);
}

export function AiSettingsProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isGuest, passwordRecovery } = useAuth();
  const [settings, setSettings] = useState<AiSettings>({ ...EMPTY_AI });

  useEffect(() => {
    if (passwordRecovery) {
      setSettings({ ...EMPTY_AI });
      return;
    }
    if (isAuthenticated && user) {
      setSettings({ ...EMPTY_AI });
      if (!isSupabaseConfigured) return;
      loadUserAi(user.id).then(setSettings);
      return;
    }
    if (isGuest) {
      setSettings(loadGuestAi());
      return;
    }
    setSettings({ ...EMPTY_AI });
  }, [user?.id, isAuthenticated, isGuest, passwordRecovery]);

  useEffect(() => {
    const reload = () => {
      if (isAuthenticated && user && isSupabaseConfigured) loadUserAi(user.id).then(setSettings);
    };
    window.addEventListener('uxhub:ai-reload', reload);
    return () => window.removeEventListener('uxhub:ai-reload', reload);
  }, [isAuthenticated, user]);

  const saveSettings = async (partial: Partial<AiSettings>) => {
    const next = normalizeAiSettings({
      ...settings,
      ...partial,
      provider: detectAiProvider(partial.apiKey ?? settings.apiKey, partial.provider ?? settings.provider),
    });
    setSettings(next);
    if (isAuthenticated && user && isSupabaseConfigured) {
      await saveUserAi(user.id, next);
    } else if (isGuest) {
      saveGuestAi(next);
    }
  };

  return (
    <Ctx.Provider value={{ settings, hasKey: !!settings.apiKey, saveSettings }}>
      {children}
    </Ctx.Provider>
  );
}
