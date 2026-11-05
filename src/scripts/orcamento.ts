import { mensagemEvento, whatsappLink, type Motivo } from '../lib/whatsapp';
import { rastrearLead, rastrearWhatsapp } from './rastreamento';
import { parametros } from './parametros';

const form = document.querySelector<HTMLFormElement>('[data-orcamento]');

function hojeLocal() {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

if (form) {
  const dataInput = form.elements.namedItem('data') as HTMLInputElement;
  const status = form.querySelector<HTMLElement>('[data-orcamento-status]')!;
  dataInput.min = hojeLocal();

  const texto = (nome: string) => String(new FormData(form).get(nome) ?? '').trim();

  const regras: Record<string, () => string> = {
    nome: () => (texto('nome').length >= 2 ? '' : 'Conte pra gente o seu nome.'),
    whatsapp: () => {
      const digitos = texto('whatsapp').replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
      return /^\d{10,11}$/.test(digitos) ? '' : 'Informe o WhatsApp com DDD.';
    },
    tipo: () => (texto('tipo') ? '' : 'Escolha o tipo de evento.'),
    data: () => {
      const data = texto('data');
      if (!data) return 'Informe a data do evento.';
      return data < hojeLocal() ? 'Escolha uma data a partir de hoje.' : '';
    },
    convidados: () => (Number(texto('convidados')) >= 1 ? '' : 'Informe o número de convidados.'),
    local: () => (texto('local') ? '' : 'Diga onde vai ser o evento.'),
  };

  function validar(nome: string) {
    const erro = regras[nome]();
    const campo = form!.elements.namedItem(nome);
    const saida = form!.querySelector<HTMLElement>(`#ev-${nome}-erro`)!;
    saida.textContent = erro;
    if (campo instanceof HTMLElement) campo.setAttribute('aria-invalid', String(!!erro));
    return !erro;
  }

  form.addEventListener('change', (evento) => {
    const nome = (evento.target as HTMLInputElement).name;
    if (regras[nome]) validar(nome);
  });

  /**
   * Guarda o pedido no painel de leads. Não espera a resposta: o WhatsApp precisa abrir
   * ainda dentro do clique (senão o navegador bloqueia) e abre mesmo se o envio falhar.
   */
  function salvarLead(pedido: Record<string, string>) {
    const corpo = {
      ...Object.fromEntries(parametros),
      ...pedido,
      whatsapp: texto('whatsapp'),
      empresa: texto('empresa'),
      campanha: texto('campanha'),
      pagina: location.pathname,
    };
    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
      keepalive: true,
    }).catch(() => {});
  }

  form.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const invalidos = Object.keys(regras).filter((nome) => !validar(nome));
    if (invalidos.length) {
      const primeiro = form.elements.namedItem(invalidos[0]);
      (primeiro instanceof RadioNodeList ? (primeiro[0] as HTMLElement) : (primeiro as HTMLElement)).focus();
      status.textContent = '';
      return;
    }

    const pedido = {
      nome: texto('nome'),
      tipo: texto('tipo'),
      data: texto('data'),
      convidados: texto('convidados'),
      local: texto('local'),
      observacoes: texto('observacoes'),
    };
    salvarLead(pedido);
    const motivo = (form.dataset.motivo ?? 'evento') as Motivo;
    const mensagem = mensagemEvento(pedido, motivo);

    rastrearWhatsapp(motivo, 'formulario');
    rastrearLead();
    window.open(whatsappLink(motivo, mensagem), '_blank', 'noopener');
    status.textContent = 'Sua mensagem foi aberta no WhatsApp. É só enviar!';
  });
}
