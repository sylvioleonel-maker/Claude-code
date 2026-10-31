import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Cliente Supabase com a service role. Só para código de servidor
 * (rotas de API): ignora RLS e nunca deve ir para o navegador.
 */
export function supabaseAdmin(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausente");
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}
