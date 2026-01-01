import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log de diagnóstico para desenvolvimento (ajuda a ver se carregou as chaves)
if (import.meta.env.DEV) {
  if (!SUPABASE_URL) console.warn('⚠️ VITE_SUPABASE_URL não encontrada no .env');
  if (!SUPABASE_ANON_KEY) console.warn('⚠️ VITE_SUPABASE_ANON_KEY não encontrada no .env');
}

export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;