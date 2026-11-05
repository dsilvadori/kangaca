/**
 * Planilha de leads do Kangaça.
 *
 * Cole este arquivo em Extensões > Apps Script da planilha (veja o README).
 * O site manda cada pedido de orçamento para cá pelo Worker do Cloudflare.
 * O TOKEN fica em Configurações do projeto > Propriedades do script e precisa ser
 * igual ao secret PLANILHA_TOKEN do Worker.
 */

const ABA = 'Leads';
const STATUS = ['Novo', 'Em conversa', 'Orçado', 'Fechado', 'Perdido'];

const COLUNAS = [
  'Recebido em', 'Status', 'Nome', 'WhatsApp', 'Tipo de evento', 'Data do evento', 'Convidados',
  'Local', 'Observações', 'Valor fechado (R$)', 'Anotações', 'Origem', 'Página',
  'gclid', 'gbraid', 'wbraid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
];

/** Rode uma vez pelo editor (botão Executar) para montar a aba. Pode rodar de novo sem perder dados. */
function prepararPlanilha() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  planilha.setSpreadsheetTimeZone('America/Sao_Paulo');
  const aba = planilha.getSheetByName(ABA) || planilha.insertSheet(ABA, 0);

  aba.getRange(1, 1, 1, COLUNAS.length).setValues([COLUNAS]).setFontWeight('bold').setBackground('#f3e9dc');
  aba.setFrozenRows(1);
  aba.setFrozenColumns(3);

  const linhas = aba.getMaxRows() - 1;
  aba.getRange(2, 1, linhas, 1).setNumberFormat('dd/mm/yyyy hh:mm');
  aba.getRange(2, 6, linhas, 1).setNumberFormat('dd/mm/yyyy');
  aba.getRange(2, 10, linhas, 1).setNumberFormat('"R$" #,##0.00');
  aba.getRange(2, 2, linhas, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(STATUS, true).setAllowInvalid(false).build(),
  );
  aba.getRange(2, 9, linhas, 1).setWrap(true);
  aba.getRange(2, 11, linhas, 1).setWrap(true);

  [140, 110, 180, 150, 120, 110, 90, 150, 260, 130, 260, 150, 160].forEach((largura, i) =>
    aba.setColumnWidth(i + 1, largura),
  );

  const cores = { Novo: '#fde2d4', 'Em conversa': '#fff1c2', Orçado: '#e3ecfb', Fechado: '#d6f0dd', Perdido: '#e8e8e8' };
  const statusRange = aba.getRange(2, 2, linhas, 1);
  aba.setConditionalFormatRules(
    Object.entries(cores).map(([valor, cor]) =>
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(valor).setBackground(cor).setRanges([statusRange]).build(),
    ),
  );
}

function doPost(e) {
  let dados;
  try {
    dados = JSON.parse(e.postData.contents);
  } catch (erro) {
    return resposta({ ok: false, erro: 'json' });
  }

  const token = PropertiesService.getScriptProperties().getProperty('TOKEN');
  if (!token || dados.token !== token) return resposta({ ok: false, erro: 'token' });

  const lead = dados.lead || {};
  if (!/^55\d{10,11}$/.test(String(lead.whatsapp)) || !/^\d{4}-\d{2}-\d{2}$/.test(String(lead.data))) {
    return resposta({ ok: false, erro: 'dados' });
  }

  // Dois pedidos ao mesmo tempo não podem cair na mesma linha.
  const trava = LockService.getScriptLock();
  trava.waitLock(10000);
  try {
    const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ABA);
    if (!aba) return resposta({ ok: false, erro: 'aba' });

    const [ano, mes, dia] = lead.data.split('-').map(Number);
    const linha = [
      new Date(),
      'Novo',
      seguro(lead.nome),
      '', // WhatsApp: entra abaixo como link
      seguro(lead.tipo),
      new Date(ano, mes - 1, dia, 12), // meio-dia: o fuso do script não muda o dia
      Number(lead.convidados),
      seguro(lead.local),
      seguro(lead.observacoes),
      '',
      '',
      origem(lead),
      seguro(lead.pagina),
      seguro(lead.gclid),
      seguro(lead.gbraid),
      seguro(lead.wbraid),
      seguro(lead.utm_source),
      seguro(lead.utm_medium),
      seguro(lead.utm_campaign),
      seguro(lead.utm_term),
      seguro(lead.utm_content),
    ];
    aba.appendRow(linha);

    const numero = aba.getLastRow();
    aba.getRange(numero, 4).setRichTextValue(
      SpreadsheetApp.newRichTextValue().setText(telefone(lead.whatsapp)).setLinkUrl(linkWhatsapp(lead)).build(),
    );
  } finally {
    trava.releaseLock();
  }

  return resposta({ ok: true });
}

/** Link que abre a conversa com uma primeira mensagem pronta (dá para editar antes de enviar). */
function linkWhatsapp(lead) {
  const primeiroNome = String(lead.nome).split(/\s+/)[0];
  const [ano, mes, dia] = lead.data.split('-');
  const mensagem =
    `Olá, ${primeiroNome}! Aqui é do Kangaça. Recebemos seu pedido de orçamento ` +
    `(${String(lead.tipo).toLowerCase()}, ${dia}/${mes}/${ano}, ${lead.convidados} convidados). Vamos conversar?`;
  return `https://wa.me/${lead.whatsapp}?text=${encodeURIComponent(mensagem)}`;
}

/** 5511987654321 → (11) 98765-4321 */
function telefone(digitos) {
  return String(digitos).replace(/^55(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3');
}

/** De onde veio o pedido. Páginas de campanha (ex.: confra-2026) aparecem na frente: "confra-2026 · Google Ads". */
function origem(lead) {
  let fonte = 'Direto / orgânico';
  if (lead.gclid || lead.gbraid || lead.wbraid) fonte = 'Google Ads';
  else if (lead.utm_source) fonte = [lead.utm_source, lead.utm_campaign].filter(Boolean).join(' · ');
  const partes = [lead.campanha, ...fonte.split(' · ')].filter(Boolean);
  return seguro([...new Set(partes)].join(' · '));
}

/** Texto digitado pelo visitante nunca vira fórmula na planilha. */
function seguro(valor) {
  const texto = String(valor == null ? '' : valor);
  return /^[=+\-@]/.test(texto) ? `'${texto}` : texto;
}

function resposta(corpo) {
  return ContentService.createTextOutput(JSON.stringify(corpo)).setMimeType(ContentService.MimeType.JSON);
}
