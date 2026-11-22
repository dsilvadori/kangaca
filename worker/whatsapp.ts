/**
 * /whatsapp: todos os botões do site passam por aqui antes de abrir o WhatsApp.
 *
 * - Fora do Brasil: mostra uma página avisando que o atendimento é só no Brasil.
 * - No Brasil: verificação de robô do Cloudflare Turnstile (quase sempre invisível)
 *   e então redireciona para o wa.me com a mensagem do botão.
 *
 * Parâmetros: `m` = motivo (chave de WHATSAPP.mensagens) e `t` = texto pronto (formulário).
 * Sem TURNSTILE_SITEKEY/TURNSTILE_SECRET configurados, pula a verificação e só filtra o país.
 */
import { INSTAGRAM, WHATSAPP } from '../src/config/site';

type Motivo = keyof typeof WHATSAPP.mensagens;

const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/** Sem país (ex.: `wrangler dev` sem dados do Cloudflare) passa; desconhecido ("XX") e Tor ("T1") não. */
export const foraDoBrasil = (pais: string | undefined) => pais !== undefined && pais !== 'BR';

function mensagem(parametros: URLSearchParams): string {
  const texto = parametros.get('t')?.trim().slice(0, 3000);
  if (texto) return texto;
  const motivo = parametros.get('m') ?? '';
  return Object.hasOwn(WHATSAPP.mensagens, motivo)
    ? WHATSAPP.mensagens[motivo as Motivo]
    : WHATSAPP.mensagens.geral;
}

const destino = (parametros: URLSearchParams) =>
  `https://wa.me/${WHATSAPP.numero}?text=${encodeURIComponent(mensagem(parametros))}`;

const escapar = (valor: string) =>
  valor.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function pagina(titulo: string, corpo: string, status = 200, cabecalho = ''): Response {
  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${titulo} · Kangaça</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
${cabecalho}
<style>
  :root { color-scheme: light; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 1.5rem;
    box-sizing: border-box; background: #f4ecdf; color: #1e2b2c;
    font: 1.0625rem/1.55 system-ui, -apple-system, 'Segoe UI', sans-serif; }
  main { max-width: 30rem; text-align: center; }
  h1 { font-family: Georgia, serif; font-weight: 400; color: #0e464d; font-size: 1.75rem; line-height: 1.2; margin: 0 0 .75rem; }
  p { margin: 0 0 1rem; }
  .en { color: #4a5859; font-size: .9375rem; border-top: 1px solid #d9bc93; padding-top: 1rem; margin-top: 1.5rem; }
  a { color: #0e464d; font-weight: 600; }
  .btn { display: inline-block; margin-top: .5rem; padding: .8rem 1.4rem; border-radius: 999px;
    background: #0e464d; color: #f4ecdf; text-decoration: none; border: 0; font: inherit; font-weight: 600; cursor: pointer; }
  .erro { color: #a84a2a; }
  .cf-turnstile { display: flex; justify-content: center; margin: 1rem 0; min-height: 65px; }
</style>
</head>
<body><main>${corpo}</main></body>
</html>`;
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function paginaForaDoBrasil(): Response {
  return pagina(
    'Atendimento só no Brasil',
    `<h1>Atendimento pelo WhatsApp só no Brasil</h1>
<p>O contato pelo WhatsApp do Kangaça está disponível apenas para quem acessa o site do Brasil.
Se você estiver viajando, fale com a gente pelo Instagram <a href="${INSTAGRAM.url}" rel="noopener">${INSTAGRAM.usuario}</a>.</p>
<p class="en">WhatsApp contact is only available to visitors in Brazil.
You can reach us on Instagram at <a href="${INSTAGRAM.url}" rel="noopener">${INSTAGRAM.usuario}</a>.</p>
<p><a href="/">Voltar para o site</a></p>`,
    403,
  );
}

/** Página com o Turnstile. Quando ele aprova, o formulário é enviado sozinho (POST para /whatsapp). */
function paginaVerificacao(env: Env, parametros: URLSearchParams, erro = ''): Response {
  const campos = ['m', 't']
    .filter((chave) => parametros.get(chave))
    .map((chave) => `<input type="hidden" name="${chave}" value="${escapar(parametros.get(chave)!)}">`)
    .join('');
  return pagina(
    'Abrindo o WhatsApp',
    `<h1>Abrindo o WhatsApp…</h1>
<p>Só uma verificação rápida de segurança e a conversa com o Kangaça abre em seguida.</p>
${erro ? `<p class="erro" role="alert">${erro}</p>` : ''}
<form method="post" action="/whatsapp" id="f">
  ${campos}
  <div class="cf-turnstile" data-sitekey="${escapar(env.TURNSTILE_SITEKEY!)}" data-action="whatsapp"
    data-language="pt-BR" data-callback="kgAprovado" data-refresh-expired="auto"></div>
  <noscript><p class="erro">Ative o JavaScript para continuar.</p></noscript>
  <button class="btn" type="submit" id="b" hidden>Abrir o WhatsApp</button>
</form>
<script>
  function kgAprovado() { document.getElementById('f').submit(); }
  // Se o envio automático não acontecer (ex.: navegador bloqueou), o botão aparece.
  setTimeout(function () { document.getElementById('b').hidden = false; }, 6000);
</script>`,
    erro ? 400 : 200,
    '<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>',
  );
}

async function verificarTurnstile(env: Env, token: string, ip: string | null): Promise<boolean | null> {
  const corpo = new FormData();
  corpo.append('secret', env.TURNSTILE_SECRET!);
  corpo.append('response', token);
  if (ip) corpo.append('remoteip', ip);
  try {
    const resposta = await fetch(SITEVERIFY, { method: 'POST', body: corpo });
    const retorno = (await resposta.json()) as { success?: boolean; 'error-codes'?: string[] };
    if (!retorno.success) console.warn('Turnstile recusou', retorno['error-codes']);
    return retorno.success === true;
  } catch (erro) {
    console.error('Turnstile fora do ar', erro);
    return null;
  }
}

export async function abrirWhatsapp(request: Request, env: Env, pais: string | undefined): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD' && request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { Allow: 'GET, POST' } });
  }
  if (foraDoBrasil(pais)) return paginaForaDoBrasil();

  const verificacaoLigada = Boolean(env.TURNSTILE_SITEKEY && env.TURNSTILE_SECRET);
  const redirecionar = (parametros: URLSearchParams) =>
    new Response(null, { status: 303, headers: { Location: destino(parametros), 'Cache-Control': 'no-store' } });

  if (request.method !== 'POST') {
    const parametros = new URL(request.url).searchParams;
    return verificacaoLigada ? paginaVerificacao(env, parametros) : redirecionar(parametros);
  }

  if (Number(request.headers.get('Content-Length') ?? 0) > 20_000) return new Response(null, { status: 413 });
  const formulario = await request.formData().catch(() => null);
  const parametros = new URLSearchParams();
  for (const chave of ['m', 't']) {
    const valor = formulario?.get(chave);
    if (typeof valor === 'string' && valor) parametros.set(chave, valor);
  }
  if (!verificacaoLigada) return redirecionar(parametros);

  const token = formulario?.get('cf-turnstile-response');
  const aprovado =
    typeof token === 'string' && token
      ? await verificarTurnstile(env, token, request.headers.get('CF-Connecting-IP'))
      : false;
  // null = o Turnstile não respondeu. Deixa passar para não perder cliente por falha do serviço.
  if (aprovado === false) {
    return paginaVerificacao(env, parametros, 'Não conseguimos confirmar a verificação. Tente de novo.');
  }
  return redirecionar(parametros);
}
