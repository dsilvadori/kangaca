// Secrets configurados no painel do Cloudflare (não aparecem no wrangler.jsonc).
interface Env {
  PLANILHA_URL?: string;
  PLANILHA_TOKEN?: string;
  /** Chave secreta do widget do Turnstile (verificação de robô do /whatsapp). */
  TURNSTILE_SECRET?: string;
  /** Chave pública (site key) do widget do Turnstile. Fica em "vars" no wrangler.jsonc. */
  TURNSTILE_SITEKEY?: string;
}
