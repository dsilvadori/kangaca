/** Painel dos leads: lista, atualização de status, exclusão e exportação em CSV. */
import { STATUS, statusValido, type Lead } from './leads';

// Nome da ação de conversão de importação criada no Google Ads (veja o README).
const CONVERSAO_OFFLINE = 'Evento fechado';
const FUSO = 'America/Sao_Paulo';

const esc = (valor: unknown) =>
  String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** O D1 grava em UTC ("AAAA-MM-DD HH:MM:SS"). */
const dataUtc = (valor: string) => new Date(`${valor.replace(' ', 'T')}Z`);

const dataHora = (valor: string) =>
  dataUtc(valor).toLocaleString('pt-BR', { timeZone: FUSO, dateStyle: 'short', timeStyle: 'short' });

const dataEvento = (valor: string) => valor.split('-').reverse().join('/');

const reais = (valor: number) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function origem(lead: Lead) {
  if (lead.gclid || lead.gbraid || lead.wbraid) return 'Google Ads';
  if (lead.utm_source) return [lead.utm_source, lead.utm_campaign].filter(Boolean).join(' · ');
  return 'Direto / orgânico';
}

const cabecalhosHtml = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'same-origin',
  'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'",
};

function cartao(lead: Lead, filtro: string) {
  const opcoes = Object.entries(STATUS)
    .map(([valor, rotulo]) => `<option value="${valor}"${valor === lead.status ? ' selected' : ''}>${rotulo}</option>`)
    .join('');
  const telefone = lead.whatsapp.replace(/^55(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3');
  const voltar = filtro ? `?status=${filtro}` : '';

  return `
  <details class="lead lead--${lead.status}">
    <summary>
      <span class="lead__status">${STATUS[lead.status]}</span>
      <strong>${esc(lead.nome)}</strong>
      <span>${esc(lead.tipo)} · ${dataEvento(lead.data_evento)} · ${lead.convidados} convidados</span>
      <span class="lead__quando">${dataHora(lead.criado_em)}</span>
    </summary>
    <div class="lead__corpo">
      <dl>
        <dt>WhatsApp</dt><dd><a href="https://wa.me/${lead.whatsapp}" target="_blank" rel="noopener noreferrer">${esc(telefone)}</a></dd>
        <dt>Local</dt><dd>${esc(lead.local)}</dd>
        <dt>Origem</dt><dd>${esc(origem(lead))}${lead.pagina ? ` (${esc(lead.pagina)})` : ''}</dd>
        ${lead.observacoes ? `<dt>Observações</dt><dd class="pre">${esc(lead.observacoes)}</dd>` : ''}
        ${lead.valor_fechado != null ? `<dt>Valor fechado</dt><dd>${reais(lead.valor_fechado)}</dd>` : ''}
      </dl>
      <form method="post" action="/painel/leads/${lead.id}${voltar}" class="lead__form">
        <label>Status <select name="status">${opcoes}</select></label>
        <label>Valor fechado (R$) <input name="valor" inputmode="decimal" value="${lead.valor_fechado ?? ''}" placeholder="ex.: 3500,00" /></label>
        <label class="largo">Anotações <textarea name="notas" rows="3">${esc(lead.notas)}</textarea></label>
        <button type="submit">Salvar</button>
      </form>
      <form method="post" action="/painel/leads/${lead.id}/excluir${voltar}" class="lead__excluir">
        <label><input type="checkbox" name="confirmar" value="sim" required /> Excluir de vez este lead (pedido do titular, teste, spam)</label>
        <button type="submit">Excluir</button>
      </form>
    </div>
  </details>`;
}

async function listar(request: Request, env: Env, email: string) {
  const filtro = new URL(request.url).searchParams.get('status') ?? '';
  const porStatus = statusValido(filtro);

  const [{ results: leads }, { results: totais }] = await Promise.all([
    (porStatus
      ? env.DB.prepare('SELECT * FROM leads WHERE status = ? ORDER BY criado_em DESC LIMIT 500').bind(filtro)
      : env.DB.prepare('SELECT * FROM leads ORDER BY criado_em DESC LIMIT 500')
    ).all<Lead>(),
    env.DB.prepare('SELECT status, COUNT(*) AS total FROM leads GROUP BY status').all<{ status: string; total: number }>(),
  ]);

  const total = (status: string) => totais.find((t) => t.status === status)?.total ?? 0;
  const geral = totais.reduce((soma, t) => soma + t.total, 0);
  const aba = (valor: string, rotulo: string, n: number) =>
    `<a href="/painel${valor ? `?status=${valor}` : ''}"${valor === (porStatus ? filtro : '') ? ' aria-current="page"' : ''}>${rotulo} <span>${n}</span></a>`;

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>Leads · Kangaça</title>
<style>
  :root { --tinta: #2b1d14; --papel: #faf5ee; --linha: #e6dccd; --terra: #a0461f; font-family: system-ui, sans-serif; color: var(--tinta); background: var(--papel); }
  body { margin: 0 auto; max-width: 960px; padding: 1.5rem 1rem 4rem; }
  header { display: flex; flex-wrap: wrap; gap: .5rem 1.5rem; align-items: baseline; justify-content: space-between; }
  h1 { margin: 0; font-size: 1.5rem; }
  .quem { font-size: .875rem; opacity: .7; }
  nav, .exportar { display: flex; flex-wrap: wrap; gap: .5rem; margin: 1rem 0; }
  nav a, .exportar a { padding: .4rem .8rem; border: 1px solid var(--linha); border-radius: 999px; color: inherit; text-decoration: none; background: #fff; }
  nav a[aria-current] { background: var(--tinta); color: var(--papel); border-color: var(--tinta); }
  nav span { opacity: .6; }
  .exportar { font-size: .875rem; }
  .lead { background: #fff; border: 1px solid var(--linha); border-left: 4px solid var(--linha); border-radius: 8px; margin-bottom: .5rem; }
  .lead--novo { border-left-color: var(--terra); }
  .lead--orcado { border-left-color: #c9962c; }
  .lead--fechado { border-left-color: #2f7d4a; }
  .lead--perdido { opacity: .7; }
  summary { display: flex; flex-wrap: wrap; gap: .25rem 1rem; align-items: baseline; padding: .75rem 1rem; cursor: pointer; }
  .lead__status { font-size: .75rem; text-transform: uppercase; letter-spacing: .05em; font-weight: 700; }
  .lead__quando { margin-left: auto; font-size: .875rem; opacity: .7; }
  .lead__corpo { padding: 0 1rem 1rem; border-top: 1px solid var(--linha); }
  dl { display: grid; grid-template-columns: max-content 1fr; gap: .25rem 1rem; }
  dt { font-weight: 600; }
  dd { margin: 0; }
  .pre { white-space: pre-wrap; }
  .lead__form { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
  .lead__form .largo { grid-column: 1 / -1; }
  label { display: grid; gap: .25rem; font-size: .875rem; }
  input, select, textarea, button { font: inherit; padding: .5rem; border: 1px solid var(--linha); border-radius: 6px; }
  button { background: var(--tinta); color: var(--papel); border: 0; cursor: pointer; justify-self: start; padding: .5rem 1.25rem; }
  .lead__excluir { display: flex; flex-wrap: wrap; gap: .75rem; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed var(--linha); }
  .lead__excluir label { display: flex; align-items: center; gap: .5rem; }
  .lead__excluir button { background: #8a2b1a; }
  .vazio { padding: 2rem; text-align: center; opacity: .7; }
</style>
</head>
<body>
<header>
  <h1>Leads · Kangaça</h1>
  <span class="quem">${esc(email)}</span>
</header>
<nav aria-label="Filtrar por status">
  ${aba('', 'Todos', geral)}
  ${Object.entries(STATUS).map(([valor, rotulo]) => aba(valor, rotulo, total(valor))).join('')}
</nav>
<div class="exportar">
  <a href="/painel/leads.csv">Baixar todos os leads (CSV)</a>
  <a href="/painel/conversoes-offline.csv">Conversões para o Google Ads (CSV)</a>
</div>
${leads.length ? leads.map((lead) => cartao(lead, porStatus ? filtro : '')).join('') : '<p class="vazio">Nenhum lead por aqui ainda.</p>'}
</body>
</html>`;

  return new Response(html, { headers: cabecalhosHtml });
}

/** Valor em reais digitado como "3.500,00", "3500,5" ou "3500.50". */
function lerValor(valor: string): number | null {
  const limpo = valor.trim().replace(/[R$\s]/g, '');
  if (!limpo) return null;
  const normal = limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo;
  const numero = Number(normal);
  return Number.isFinite(numero) && numero >= 0 ? Math.round(numero * 100) / 100 : null;
}

async function atualizar(form: FormData, env: Env, id: number): Promise<Response | undefined> {
  const status = String(form.get('status') ?? '');
  if (!statusValido(status)) return new Response('Status inválido', { status: 400 });
  const valor = lerValor(String(form.get('valor') ?? ''));
  const notas = String(form.get('notas') ?? '').trim().slice(0, 5000) || null;

  // fechado_em marca a primeira vez que o lead virou "fechado": é a hora da conversão offline.
  await env.DB.prepare(
    `UPDATE leads SET status = ?1, valor_fechado = ?2, notas = ?3, atualizado_em = datetime('now'),
       fechado_em = CASE WHEN ?1 = 'fechado' THEN COALESCE(fechado_em, datetime('now')) ELSE NULL END
     WHERE id = ?4`,
  )
    .bind(status, valor, notas, id)
    .run();
}

/** Escapa um campo de CSV e impede que planilhas o leiam como fórmula. */
function campoCsv(valor: unknown) {
  let texto = String(valor ?? '');
  if (/^[=+\-@\t\r]/.test(texto)) texto = `'${texto}`;
  return /[",\n\r;]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

const csv = (linhas: unknown[][], nome: string) =>
  new Response('﻿' + linhas.map((linha) => linha.map(campoCsv).join(',')).join('\r\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${nome}"`,
      'Cache-Control': 'no-store',
    },
  });

async function exportarLeads(env: Env) {
  const { results } = await env.DB.prepare('SELECT * FROM leads ORDER BY criado_em DESC').all<Lead>();
  const colunas = [
    'id', 'criado_em', 'nome', 'whatsapp', 'tipo', 'data_evento', 'convidados', 'local', 'observacoes',
    'status', 'valor_fechado', 'notas', 'fechado_em', 'pagina', 'gclid', 'gbraid', 'wbraid',
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  ] as const;
  return csv([colunas as unknown as string[], ...results.map((lead) => colunas.map((c) => lead[c]))], 'leads-kangaca.csv');
}

/** Modelo de importação de conversões off-line do Google Ads, só com leads fechados vindos de anúncio. */
async function exportarConversoes(env: Env) {
  const { results } = await env.DB.prepare(
    "SELECT gclid, fechado_em, valor_fechado FROM leads WHERE status = 'fechado' AND gclid IS NOT NULL AND fechado_em IS NOT NULL ORDER BY fechado_em",
  ).all<Pick<Lead, 'gclid' | 'fechado_em' | 'valor_fechado'>>();

  // "sv-SE" já sai no formato AAAA-MM-DD HH:MM:SS.
  const horaLocal = (valor: string) => dataUtc(valor).toLocaleString('sv-SE', { timeZone: FUSO });
  const linhas = [
    [`Parameters:TimeZone=${FUSO}`],
    ['Google Click ID', 'Conversion Name', 'Conversion Time', 'Conversion Value', 'Conversion Currency'],
    ...results.map((l) => [l.gclid, CONVERSAO_OFFLINE, horaLocal(l.fechado_em!), l.valor_fechado ?? '', 'BRL']),
  ];
  // Sem BOM: o importador do Google Ads espera o cabeçalho na primeira posição do arquivo.
  return new Response(linhas.map((linha) => linha.map(campoCsv).join(',')).join('\r\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="conversoes-offline-kangaca.csv"',
      'Cache-Control': 'no-store',
    },
  });
}

export async function painel(request: Request, env: Env, email: string): Promise<Response> {
  const url = new URL(request.url);
  const caminho = url.pathname.replace(/\/$/, '');

  if (request.method === 'GET') {
    if (caminho === '/painel') return listar(request, env, email);
    if (caminho === '/painel/leads.csv') return exportarLeads(env);
    if (caminho === '/painel/conversoes-offline.csv') return exportarConversoes(env);
    return new Response('Não encontrado', { status: 404 });
  }

  if (request.method === 'POST') {
    // Formulários só valem quando enviados do próprio painel.
    if (request.headers.get('Origin') !== url.origin) return new Response('Origem inválida', { status: 403 });

    const rota = caminho.match(/^\/painel\/leads\/(\d+)(\/excluir)?$/);
    if (!rota) return new Response('Não encontrado', { status: 404 });
    const id = Number(rota[1]);
    const form = await request.formData().catch(() => null);
    if (!form) return new Response('Formulário inválido', { status: 400 });

    if (rota[2]) {
      if (form.get('confirmar') !== 'sim') return new Response('Confirme a exclusão', { status: 400 });
      await env.DB.prepare('DELETE FROM leads WHERE id = ?').bind(id).run();
    } else {
      const erro = await atualizar(form, env, id);
      if (erro) return erro;
    }

    const filtro = url.searchParams.get('status');
    return Response.redirect(`${url.origin}/painel${statusValido(filtro) ? `?status=${filtro}` : ''}`, 303);
  }

  return new Response('Método não permitido', { status: 405, headers: { Allow: 'GET, POST' } });
}
