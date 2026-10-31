import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Valida a assinatura de um webhook da Kiwify.
 *
 * A Kiwify envia `?signature=<hex>` com o HMAC-SHA1 do corpo cru, usando o token
 * do webhook como chave. Aceita mais de um token para permitir a troca sem perder
 * eventos (token novo + antigo durante a transição).
 */
export function isValidKiwifySignature(
  rawBody: string,
  signature: string | null,
  tokens: string[],
): boolean {
  if (!signature || !/^[0-9a-f]{40}$/.test(signature)) return false;
  const received = Buffer.from(signature, "utf8");

  return tokens
    .filter((token) => token.length > 0)
    .some((token) => {
      const expected = Buffer.from(
        createHmac("sha1", token).update(rawBody, "utf8").digest("hex"),
        "utf8",
      );
      return expected.length === received.length && timingSafeEqual(expected, received);
    });
}

/** Tokens aceitos: o atual e, durante uma troca, o anterior. */
export function kiwifyTokensFromEnv(
  env: Record<string, string | undefined> = process.env,
): string[] {
  return [env.KIWIFY_WEBHOOK_TOKEN, env.KIWIFY_WEBHOOK_TOKEN_PREVIOUS].filter(
    (t): t is string => Boolean(t),
  );
}
