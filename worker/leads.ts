/**
 * Recebe os pedidos do formulário de eventos e repassa para a planilha do Google
 * (apps-script/planilha-leads.gs). Nada fica guardado no Cloudflare.
 */

const RASTREIO = ['gclid', 'gbraid', 'wbraid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;

const texto = (valor: unknown, maximo: number) =>
  typeof valor === 'string' ? valor.trim().slice(0, maximo) : '';

/** Só dígitos, com o 55 do Brasil na frente quando faltar. Null se não parecer um celular ou fixo. */
export function normalizarWhatsapp(valor: string): string | null {
  let digitos = valor.replace(/\D/g, '');
  if (digitos.length === 10 || digitos.length === 11) digitos = `55${digitos}`;
  return /^55\d{10,11}$/.test(digitos) ? digitos : null;
}

const json = (corpo: object, status: number) =>
  new Response(JSON.stringify(corpo), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

export async function receberLead(request: Request, env: Env): Promise<Response> {
  const origem = request.headers.get('Origin');
  if (origem && origem !== new URL(request.url).origin) return json({ erro: 'origem' }, 403);
  if (Number(request.headers.get('Content-Length') ?? 0) > 10_000) return json({ erro: 'tamanho' }, 413);

  const { success } = await env.LIMITE_LEADS.limit({ key: request.headers.get('CF-Connecting-IP') ?? '' });
  if (!success) return json({ erro: 'limite' }, 429);

  let dados: Record<string, unknown>;
  try {
    dados = await request.json();
  } catch {
    return json({ erro: 'json' }, 400);
  }

  // Campo escondido do formulário: só robô preenche. Responde como sucesso e não grava.
  if (texto(dados.empresa, 200)) return json({ ok: true }, 200);

  const lead = {
    nome: texto(dados.nome, 100),
    whatsapp: normalizarWhatsapp(texto(dados.whatsapp, 30)),
    tipo: texto(dados.tipo, 50),
    data: texto(dados.data, 10),
    convidados: Math.floor(Number(dados.convidados)),
    local: texto(dados.local, 50),
    observacoes: texto(dados.observacoes, 2000),
    pagina: texto(dados.pagina, 200),
    ...Object.fromEntries(RASTREIO.map((chave) => [chave, texto(dados[chave], 200)])),
  };

  if (
    lead.nome.length < 2 ||
    !lead.whatsapp ||
    !lead.tipo ||
    !/^\d{4}-\d{2}-\d{2}$/.test(lead.data) ||
    !(lead.convidados >= 1 && lead.convidados <= 100_000) ||
    !lead.local
  ) {
    return json({ erro: 'dados' }, 400);
  }

  if (!env.PLANILHA_URL || !env.PLANILHA_TOKEN) {
    console.error('PLANILHA_URL ou PLANILHA_TOKEN não configurados');
    return json({ erro: 'configuracao' }, 503);
  }

  // O Apps Script responde com um redirecionamento; o fetch segue e lê o JSON final.
  const resposta = await fetch(env.PLANILHA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: env.PLANILHA_TOKEN, lead }),
  }).catch((erro) => {
    console.error('Planilha fora do ar', erro);
    return null;
  });
  const retorno = (await resposta?.json().catch(() => null)) as { ok?: boolean; erro?: string } | null;
  if (!retorno?.ok) {
    console.error('Planilha recusou o lead', resposta?.status, retorno?.erro);
    return json({ erro: 'planilha' }, 502);
  }

  return json({ ok: true }, 201);
}
