import { handleKiwifyWebhook } from "@/lib/kiwify/handler";
import { kiwifyTokensFromEnv } from "@/lib/kiwify/signature";
import type { KiwifyEventRow } from "@/lib/kiwify/event";
import { supabaseAdmin } from "@/lib/supabase/admin";

async function saveEvent(row: KiwifyEventRow) {
  const { error } = await supabaseAdmin()
    .from("kiwify_events")
    .upsert(row, { onConflict: "order_id,event_type", ignoreDuplicates: true });
  if (error) throw new Error(error.message);
}

// Cadastre na Kiwify: https://SEU-DOMINIO/api/webhooks/kiwify
export async function POST(request: Request) {
  return handleKiwifyWebhook(request, { tokens: kiwifyTokensFromEnv(), saveEvent });
}
