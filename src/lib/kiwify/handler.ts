import { isValidKiwifySignature } from "./signature";
import { toKiwifyEventRow, type KiwifyEventRow } from "./event";

export type SaveEvent = (row: KiwifyEventRow) => Promise<void>;

export type KiwifyWebhookDeps = {
  tokens: string[];
  saveEvent: SaveEvent;
  log?: (msg: string) => void;
};

const text = (status: number, body: string) => new Response(body, { status });

/**
 * Processa um webhook da Kiwify.
 * - 401 se a assinatura não bate (a Kiwify não reenvia algo que nós recusamos por segurança);
 * - 200 para eventos ignorados (carrinho abandonado etc.), para a Kiwify não reenviar à toa;
 * - 500 se falhar ao gravar, para a Kiwify reenviar depois.
 * Gravar é idempotente (order_id + event_type), então reenvios e replays não duplicam.
 */
export async function handleKiwifyWebhook(
  request: Request,
  { tokens, saveEvent, log = console.log }: KiwifyWebhookDeps,
): Promise<Response> {
  if (tokens.length === 0) {
    log("kiwify: KIWIFY_WEBHOOK_TOKEN não configurado");
    return text(500, "Webhook não configurado");
  }

  const rawBody = await request.text();
  const signature = new URL(request.url).searchParams.get("signature");
  if (!isValidKiwifySignature(rawBody, signature, tokens)) {
    return text(401, "Assinatura inválida");
  }

  let payload: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(rawBody);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    payload = parsed as Record<string, unknown>;
  } catch {
    return text(400, "JSON inválido");
  }

  const row = toKiwifyEventRow(payload);
  if (!row) {
    log("kiwify: evento ignorado (sem webhook_event_type ou order_id)");
    return text(200, "Ignorado");
  }

  try {
    await saveEvent(row);
  } catch (error) {
    log(`kiwify: falha ao gravar ${row.event_type} ${row.order_id}: ${String(error)}`);
    return text(500, "Erro ao gravar");
  }
  return text(200, "OK");
}
