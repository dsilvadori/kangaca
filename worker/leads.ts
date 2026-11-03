/** Recebe os pedidos do formulário de eventos e grava no D1. */

export const STATUS = {
  novo: 'Novo',
  orcado: 'Orçado',
  fechado: 'Fechado',
  perdido: 'Perdido',
} as const;

export type Status = keyof typeof STATUS;

export const statusValido = (valor: unknown): valor is Status =>
  typeof valor === 'string' && Object.hasOwn(STATUS, valor);

export interface Lead {
  id: number;
  criado_em: string;
  nome: string;
  whatsapp: string;
  tipo: string;
  data_evento: string;
  convidados: number;
  local: string;
  observacoes: string | null;
  status: Status;
  valor_fechado: number | null;
  notas: string | null;
  atualizado_em: string | null;
  fechado_em: string | null;
  pagina: string | null;
  gclid: string | null;
  gbraid: string | null;
  wbraid: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
}

const RASTREIO = ['gclid', 'gbraid', 'wbraid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;

// Até 5 pedidos por IP a cada hora.
const LIMITE_POR_HORA = 5;

const texto = (valor: unknown, maximo: number) =>
  typeof valor === 'string' ? valor.trim().slice(0, maximo) : '';

/** Só dígitos, com o 55 do Brasil na frente quando faltar. Null se não parecer um celular ou fixo. */
export function normalizarWhatsapp(valor: string): string | null {
  let digitos = valor.replace(/\D/g, '');
  if (digitos.length === 10 || digitos.length === 11) digitos = `55${digitos}`;
  return /^55\d{10,11}$/.test(digitos) ? digitos : null;
}

async function hashIp(ip: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`kangaca:${ip}`));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
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

  let dados: Record<string, unknown>;
  try {
    dados = await request.json();
  } catch {
    return json({ erro: 'json' }, 400);
  }

  // Campo escondido do formulário: só robô preenche. Responde como sucesso e não grava.
  if (texto(dados.empresa, 200)) return json({ ok: true }, 200);

  const nome = texto(dados.nome, 100);
  const whatsapp = normalizarWhatsapp(texto(dados.whatsapp, 30));
  const tipo = texto(dados.tipo, 50);
  const dataEvento = texto(dados.data, 10);
  const convidados = Math.floor(Number(dados.convidados));
  const local = texto(dados.local, 50);
  const observacoes = texto(dados.observacoes, 2000);

  if (
    nome.length < 2 ||
    !whatsapp ||
    !tipo ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dataEvento) ||
    !(convidados >= 1 && convidados <= 100_000) ||
    !local
  ) {
    return json({ erro: 'dados' }, 400);
  }

  const ipHash = await hashIp(request.headers.get('CF-Connecting-IP') ?? '');
  const recentes = await env.DB.prepare(
    "SELECT COUNT(*) AS total FROM leads WHERE ip_hash = ? AND criado_em > datetime('now', '-1 hour')",
  )
    .bind(ipHash)
    .first<number>('total');
  if ((recentes ?? 0) >= LIMITE_POR_HORA) return json({ erro: 'limite' }, 429);

  const rastreio = RASTREIO.map((chave) => texto(dados[chave], 200) || null);

  await env.DB.prepare(
    `INSERT INTO leads (nome, whatsapp, tipo, data_evento, convidados, local, observacoes, pagina, ip_hash, ${RASTREIO.join(', ')})
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ${RASTREIO.map(() => '?').join(', ')})`,
  )
    .bind(nome, whatsapp, tipo, dataEvento, convidados, local, observacoes || null, texto(dados.pagina, 200) || null, ipHash, ...rastreio)
    .run();

  return json({ ok: true }, 201);
}
