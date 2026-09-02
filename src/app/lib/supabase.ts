import { createClient, SupabaseClient } from '@supabase/supabase-js';

const LS_URL = 'uxHub_supabase_url';
const LS_ANON = 'uxHub_supabase_anon';

const ENV_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? '';
const ENV_ANON = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ?? '';

function readLs(key: string) {
  try { return localStorage.getItem(key)?.trim() ?? ''; } catch { return ''; }
}

export function getSupabaseCredentials() {
  const url = readLs(LS_URL) || ENV_URL;
  const anonKey = readLs(LS_ANON) || ENV_ANON;
  return { url, anonKey };
}

export function saveSupabaseCredentials(url: string, anonKey: string) {
  localStorage.setItem(LS_URL, url.trim());
  localStorage.setItem(LS_ANON, anonKey.trim());
}

export function clearSupabaseCredentials() {
  localStorage.removeItem(LS_URL);
  localStorage.removeItem(LS_ANON);
}

export const isSupabaseConfigured = (() => {
  const { url, anonKey } = getSupabaseCredentials();
  return url.startsWith('https://') && anonKey.length > 20;
})();

function makeClient(): SupabaseClient {
  const { url, anonKey } = getSupabaseCredentials();
  const safeUrl = url.startsWith('https://') ? url : 'https://placeholder.supabase.co';
  const safeKey = anonKey.length > 20 ? anonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjAsImV4cCI6MH0.placeholder';
  return createClient(safeUrl, safeKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  });
}

export const supabase = makeClient();

export type DbProject = {
  id: string;
  user_id: string;
  workspace_id: string | null;
  data: unknown;
  updated_at: string;
};

export type DbProfile = {
  id: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
};

export type DbNotification = {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  read: boolean;
  created_at: string;
};
