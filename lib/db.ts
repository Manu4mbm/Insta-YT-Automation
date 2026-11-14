import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env.js';

let client: SupabaseClient | null = null;
export function db(): SupabaseClient {
  if (!client) {
    client = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
      auth: { persistSession: false },
    });
  }
  return client;
}

export async function getSetting(key: string): Promise<string | null> {
  const { data } = await db().from('settings').select('value').eq('key', key).maybeSingle();
  return data?.value ?? null;
}

export async function setSetting(key: string, value: string) {
  const { error } = await db()
    .from('settings')
    .upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;
}
