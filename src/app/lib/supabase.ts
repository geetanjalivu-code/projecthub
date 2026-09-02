import { createClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://lsgwclxsegpjxdxfqcxk.supabase.co';
const FALLBACK_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzZ3djbHhzZWdwanhkeGZxY3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNjcwMDcsImV4cCI6MjEwMzk0MzAwN30.irshhySlduJvK9FaFXQEV5L0c9vJgT3YvS3phYG5X_w';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || FALLBACK_URL;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || FALLBACK_ANON;

export const isSupabaseConfigured =
  !!supabaseUrl &&
  !!supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 20;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

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
