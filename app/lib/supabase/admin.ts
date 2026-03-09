import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase com service_role – usar APENAS em API routes no servidor.
 * Nunca exponha no browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL');
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
