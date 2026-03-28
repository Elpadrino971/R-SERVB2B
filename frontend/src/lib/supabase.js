import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Ignorer les placeholders (.env.example) pour utiliser le backend FastAPI
const isPlaceholder = !supabaseUrl || !supabaseAnonKey ||
  supabaseUrl.includes('votre-projet') ||
  supabaseAnonKey.includes('votre_anon') ||
  supabaseAnonKey.length < 50;

export const supabase = !isPlaceholder
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = () => !!supabase;
