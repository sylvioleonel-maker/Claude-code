/** Linha gravada na tabela `kiwify_events`. */
export type KiwifyEventRow = {
  order_id: string;
  event_type: string;
  order_status: string | null;
  product_id: string | null;
  product_name: string | null;
  customer_email: string | null;
  customer_name: string | null;
  charge_amount_cents: number | null;
  payment_method: string | null;
  approved_date: string | null;
  payload: Record<string, unknown>;
};

type Json = Record<string, unknown>;

const obj = (v: unknown): Json => (v && typeof v === "object" ? (v as Json) : {});
const str = (v: unknown): string | null => (typeof v === "string" && v !== "" ? v : null);
const int = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? Math.round(v) : null;

/**
 * Converte o payload da Kiwify numa linha da tabela.
 * Retorna `null` para payloads sem `webhook_event_type` ou `order_id`
 * (ex.: carrinho abandonado, que tem outro formato).
 */
export function toKiwifyEventRow(payload: Json): KiwifyEventRow | null {
  const eventType = str(payload.webhook_event_type);
  const orderId = str(payload.order_id);
  if (!eventType || !orderId) return null;

  const product = obj(payload.Product);
  const customer = obj(payload.Customer);
  const commissions = obj(payload.Commissions);

  return {
    order_id: orderId,
    event_type: eventType,
    order_status: str(payload.order_status),
    product_id: str(product.product_id),
    product_name: str(product.product_name),
    customer_email: str(customer.email),
    customer_name: str(customer.full_name),
    charge_amount_cents: int(commissions.charge_amount),
    payment_method: str(payload.payment_method),
    // A Kiwify envia "AAAA-MM-DD HH:MM" sem fuso; guardamos como veio.
    approved_date: str(payload.approved_date),
    payload,
  };
}
