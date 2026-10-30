import { WHATSAPP } from '../config/site';

export type Motivo = keyof typeof WHATSAPP.mensagens;

/** Link do WhatsApp com a mensagem do motivo. `texto` substitui a mensagem padrão. */
export function whatsappLink(motivo: Motivo, texto?: string): string {
  const mensagem = texto ?? WHATSAPP.mensagens[motivo];
  return `https://wa.me/${WHATSAPP.numero}?text=${encodeURIComponent(mensagem)}`;
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
export function mensagemEvento(pedido: PedidoEvento): string {
  const [ano, mes, dia] = pedido.data.split('-');
  const linhas = [
    WHATSAPP.mensagens.evento,
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
