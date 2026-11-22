import { WHATSAPP } from '../config/site';

export type Motivo = keyof typeof WHATSAPP.mensagens;

/**
 * Link do WhatsApp com a mensagem do motivo. `texto` substitui a mensagem padrão.
 * Passa pelo Worker (worker/whatsapp.ts), que barra quem está fora do Brasil e verifica
 * se é robô antes de redirecionar para o wa.me. O número não aparece no link.
 */
export function whatsappLink(motivo: Motivo, texto?: string): string {
  const parametros = new URLSearchParams({ m: motivo });
  if (texto) parametros.set('t', texto);
  return `/whatsapp?${parametros}`;
}

export interface PedidoEvento {
  nome: string;
  tipo: string;
  data: string; // AAAA-MM-DD, valor do <input type="date">
  convidados: string;
  local: string;
  observacoes?: string;
}

/** Monta o texto do orçamento enviado pelo formulário de eventos. */
export function mensagemEvento(pedido: PedidoEvento, motivo: Motivo = 'evento'): string {
  const [ano, mes, dia] = pedido.data.split('-');
  const linhas = [
    WHATSAPP.mensagens[motivo],
    '',
    `Nome: ${pedido.nome}`,
    `Tipo de evento: ${pedido.tipo}`,
    `Data: ${dia}/${mes}/${ano}`,
    `Convidados: ${pedido.convidados}`,
    `Local: ${pedido.local}`,
  ];
  if (pedido.observacoes) linhas.push(`Observações: ${pedido.observacoes}`);
  return linhas.join('\n');
}
