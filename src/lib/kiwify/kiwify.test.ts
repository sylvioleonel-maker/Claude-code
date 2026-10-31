import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { isValidKiwifySignature, kiwifyTokensFromEnv } from "./signature";
import { toKiwifyEventRow } from "./event";
import { handleKiwifyWebhook } from "./handler";

// Vetor de teste oficial: docs.kiwify.com.br/api-reference/webhooks/receiving
const TOKEN = "kiwify-token-de-teste";
const BODY =
  '{"order_id":"9b1c2d3e-0000-4000-8000-000000000001","order_status":"paid","webhook_event_type":"order_approved"}';
const SIGNATURE = "bf18f352a4f981b91dfa3f6d8742a81080ab8c86";

const sign = (body: string, token = TOKEN) =>
  createHmac("sha1", token).update(body, "utf8").digest("hex");

const req = (body: string, signature?: string) =>
  new Request(
    `https://app.test/api/webhooks/kiwify${signature ? `?signature=${signature}` : ""}`,
    { method: "POST", body, headers: { "content-type": "application/json" } },
  );

describe("isValidKiwifySignature", () => {
  it("aceita o vetor de teste oficial da Kiwify", () => {
    expect(isValidKiwifySignature(BODY, SIGNATURE, [TOKEN])).toBe(true);
  });

  it("recusa assinatura errada, ausente ou malformada", () => {
    expect(isValidKiwifySignature(BODY, SIGNATURE.replace("b", "c"), [TOKEN])).toBe(false);
    expect(isValidKiwifySignature(BODY, null, [TOKEN])).toBe(false);
    expect(isValidKiwifySignature(BODY, "abc", [TOKEN])).toBe(false);
  });

  it("recusa corpo alterado (mesmo JSON reformatado)", () => {
    const reformatted = JSON.stringify(JSON.parse(BODY), null, 1);
    expect(isValidKiwifySignature(reformatted, SIGNATURE, [TOKEN])).toBe(false);
  });

  it("aceita o token antigo durante a troca e ignora tokens vazios", () => {
    expect(isValidKiwifySignature(BODY, SIGNATURE, ["token-novo", TOKEN])).toBe(true);
    expect(isValidKiwifySignature(BODY, sign(BODY, ""), [""])).toBe(false);
  });

  it("lê os tokens do ambiente", () => {
    expect(
      kiwifyTokensFromEnv({ KIWIFY_WEBHOOK_TOKEN: "a", KIWIFY_WEBHOOK_TOKEN_PREVIOUS: "b" }),
    ).toEqual(["a", "b"]);
    expect(kiwifyTokensFromEnv({})).toEqual([]);
  });
});

describe("toKiwifyEventRow", () => {
  it("extrai os campos principais de uma venda", () => {
    const row = toKiwifyEventRow({
      order_id: "o1",
      webhook_event_type: "order_approved",
      order_status: "paid",
      payment_method: "credit_card",
      approved_date: "2026-10-31 10:00",
      Product: { product_id: "p1", product_name: "Curso" },
      Customer: { email: "a@b.com", full_name: "Ana" },
      Commissions: { charge_amount: 1500 },
    });
    expect(row).toMatchObject({
      order_id: "o1",
      event_type: "order_approved",
      product_name: "Curso",
      customer_email: "a@b.com",
      charge_amount_cents: 1500,
    });
  });

  it("ignora carrinho abandonado (sem webhook_event_type)", () => {
    expect(toKiwifyEventRow({ status: "abandoned", cart_id: "c1" })).toBeNull();
  });
});

describe("handleKiwifyWebhook", () => {
  const deps = () => ({ tokens: [TOKEN], saveEvent: vi.fn().mockResolvedValue(undefined), log: () => {} });

  it("grava um evento válido e responde 200", async () => {
    const d = deps();
    const res = await handleKiwifyWebhook(req(BODY, SIGNATURE), d);
    expect(res.status).toBe(200);
    expect(d.saveEvent).toHaveBeenCalledWith(
      expect.objectContaining({ order_id: "9b1c2d3e-0000-4000-8000-000000000001", event_type: "order_approved" }),
    );
  });

  it("responde 401 sem gravar quando a assinatura é inválida", async () => {
    const d = deps();
    expect((await handleKiwifyWebhook(req(BODY, "0".repeat(40)), d)).status).toBe(401);
    expect((await handleKiwifyWebhook(req(BODY), d)).status).toBe(401);
    expect(d.saveEvent).not.toHaveBeenCalled();
  });

  it("responde 400 para JSON inválido com assinatura válida", async () => {
    const body = "não é json";
    expect((await handleKiwifyWebhook(req(body, sign(body)), deps())).status).toBe(400);
  });

  it("responde 200 e não grava eventos ignorados", async () => {
    const d = deps();
    const body = '{"status":"abandoned"}';
    expect((await handleKiwifyWebhook(req(body, sign(body)), d)).status).toBe(200);
    expect(d.saveEvent).not.toHaveBeenCalled();
  });

  it("responde 500 quando falha ao gravar, para a Kiwify reenviar", async () => {
    const d = { ...deps(), saveEvent: vi.fn().mockRejectedValue(new Error("db fora")) };
    expect((await handleKiwifyWebhook(req(BODY, SIGNATURE), d)).status).toBe(500);
  });

  it("responde 500 quando o token não está configurado", async () => {
    expect((await handleKiwifyWebhook(req(BODY, SIGNATURE), { ...deps(), tokens: [] })).status).toBe(500);
  });
});
