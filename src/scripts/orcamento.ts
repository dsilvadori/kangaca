import { mensagemEvento, whatsappLink } from '../lib/whatsapp';
import { rastrearLead, rastrearWhatsapp } from './rastreamento';

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

  form.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const invalidos = Object.keys(regras).filter((nome) => !validar(nome));
    if (invalidos.length) {
      const primeiro = form.elements.namedItem(invalidos[0]);
      (primeiro instanceof RadioNodeList ? (primeiro[0] as HTMLElement) : (primeiro as HTMLElement)).focus();
      status.textContent = '';
      return;
    }

    const mensagem = mensagemEvento({
      nome: texto('nome'),
      tipo: texto('tipo'),
      data: texto('data'),
      convidados: texto('convidados'),
      local: texto('local'),
      observacoes: texto('observacoes'),
    });

    rastrearWhatsapp('evento', 'formulario');
    rastrearLead();
    window.open(whatsappLink('evento', mensagem), '_blank', 'noopener');
    status.textContent = 'Sua mensagem foi aberta no WhatsApp. É só enviar!';
  });
}
