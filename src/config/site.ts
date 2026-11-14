/**
 * Configuração central do site.
 * Tudo que pode mudar fica aqui: nenhum destes dados deve ser repetido nos componentes.
 * Procure por "TODO" para ver o que falta confirmar.
 */

export const SITE = {
  nome: 'Kangaça',
  nomeCompleto: 'Kangaça · Cozinha de Encontros',
  assinatura: 'Cozinha de encontros',
  conceito: 'Tradição em movimento.',
  descritor: 'Cozinha de fusão: comida de sustância, pesquisa e comunhão.',
  // TODO: confirmar domínio (manter igual ao `site` do astro.config.mjs e ao public/robots.txt)
  dominio: 'https://kangaca.com.br',
  chef: 'Beatriz Souza',
  // Ouvido por leitores de tela e leitura em voz alta logo depois do título da home.
  resumo:
    'O Kangaça é um restaurante autoral na Vila Mariana, em São Paulo: uma cozinha de fusão Brasil, África e Ásia. Nasce da curiosidade e da pesquisa da chef Bia Souza sobre o que essas culturas têm em comum, como a comunhão ao redor da mesa, as técnicas tradicionais e a comida de sustância. A casa serve almoço executivo de terça a sexta e happy hour de sexta a domingo, faz jantares especiais sob reserva e cuida de eventos e buffet.',
} as const;

export const SEO = {
  titulo: 'Kangaça | Restaurante na Vila Mariana, São Paulo',
  descricao:
    'Restaurante autoral na Vila Mariana, São Paulo: cozinha de fusão afro-brasileira e asiática. Almoço executivo, jantares sob reserva e buffet para eventos.',
  imagemOg: '/og-image.jpg',
  logo: '/icons/logo-kangaca.png',
  // Faixa citada pelos clientes no Google.
  priceRange: 'R$ 60–80',
  // TODO: colar o código de verificação do Google Search Console. Vazio, a meta tag não é renderizada.
  searchConsole: '',
  // TODO: preencher latitude e longitude da casa. Vazios, ficam fora do JSON-LD.
  geo: { latitude: '', longitude: '' },
} as const;

/** Perfil no Google. Atualize nota, total e referência de tempos em tempos. */
export const GOOGLE = {
  perfil: 'Kangaça - Cozinha de Encontros',
  // Vazia de propósito: a casa preferiu não exibir a nota (estava 4,8 em nov/2026). Preencha para voltar a mostrar.
  nota: '',
  avaliacoes: 31,
  referencia: 'novembro de 2026',
  url: 'https://maps.google.com/?cid=17650994143954835880',
} as const;

export const WHATSAPP = {
  // Se mudar o número, atualize também o public/_redirects (/whatsapp).
  numero: '5511912082104',
  exibicao: '(11) 91208-2104',
  telefoneE164: '+55-11-91208-2104',
  mensagens: {
    reserva: 'Olá, Kangaça! Vim pelo site e gostaria de reservar uma mesa.',
    almoco: 'Olá, Kangaça! Vim pelo site e queria saber o cardápio do almoço de hoje.',
    jantar: 'Olá, Kangaça! Vim pelo site e quero saber dos próximos jantares especiais.',
    evento: 'Olá, Kangaça! Vim pelo site e quero um orçamento de evento:',
    confra: 'Olá, Kangaça! Vim pelo site e quero um orçamento de confraternização de fim de ano:',
    geral: 'Olá, Kangaça! Vim pelo site.',
  },
} as const;

const enderecoCompleto = 'R. Guimarães Passos, 17, Vila Mariana, São Paulo, SP, CEP 04107-030';
const enderecoUrl = encodeURIComponent(enderecoCompleto);

export const ENDERECO = {
  rua: 'R. Guimarães Passos, 17',
  bairro: 'Vila Mariana',
  cidade: 'São Paulo',
  uf: 'SP',
  cep: '04107-030',
  pais: 'BR',
  completo: enderecoCompleto,
  mapaEmbed: `https://www.google.com/maps?q=${enderecoUrl}&output=embed`,
} as const;

export const INSTAGRAM = {
  usuario: '@kangacacozinha',
  url: 'https://www.instagram.com/kangacacozinha/',
} as const;

export const HORARIOS = {
  almoco: {
    dias: 'Terça a sexta',
    diasCurto: 'ter–sex',
    faixa: '11h30–15h',
    faixaExtenso: 'das 11h30 às 15h',
    // Usado no JSON-LD. Só o almoço tem horário confirmado.
    schema: {
      dias: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      abre: '11:30',
      fecha: '15:00',
    },
  },
  // TODO: confirmar o horário do happy hour (e então incluir no JSON-LD, como o almoço).
  happyHour: {
    dias: 'Sexta a domingo',
    diasCurto: 'sex–dom',
  },
  jantares: 'Jantares e eventos sob reserva',
  // TODO: confirmar horários de jantar e o funcionamento de segunda.
  demaisDias: 'Consulte pelo WhatsApp',
} as const;

/** Dados que a casa ainda não confirmou. Não invente: enquanto houver TODO, o site usa este texto. */
export const A_CONFIRMAR = {
  // TODO: confirmar preços do almoço e dos pratos do dia a dia.
  precos: 'Consulte pelo WhatsApp',
  // TODO: confirmar número de lugares e delivery antes de citar no site.
  // TODO: confirmar se a faixa R$ 60–80 pode ser mantida no JSON-LD (veio dos clientes).
} as const;

export const TRACKING = {
  // IDs com X não carregam nada. Rótulo: conversão "Enviar formulário de lead (1)" (Metas > Conversões).
  GOOGLE_ADS_ID: 'AW-18560090753',
  GOOGLE_ADS_CONVERSION_LABEL: '7x-7CMa0ubMdEIGFkpJF',
  GA4_ID: 'G-40WDYVLKNE',
  // Tag do Google criada pela conta do Google Ads (contato.kangaca@gmail.com).
  GTM_ID: 'GTM-M64DNH9N',
  // Pixel da Meta (Facebook/Instagram Ads). Só dispara depois do consentimento.
  META_PIXEL_ID: '1886427539462721',
} as const;

const idReal = (id: string) => id !== '' && !id.includes('XXX');

export const trackingAtivo = () =>
  idReal(TRACKING.GOOGLE_ADS_ID) ||
  idReal(TRACKING.GA4_ID) ||
  idReal(TRACKING.GTM_ID) ||
  idReal(TRACKING.META_PIXEL_ID);

/** `send_to` da conversão do Google Ads, ou null se os IDs ainda não forem reais. */
export const conversaoSendTo = () =>
  idReal(TRACKING.GOOGLE_ADS_ID) && idReal(TRACKING.GOOGLE_ADS_CONVERSION_LABEL)
    ? `${TRACKING.GOOGLE_ADS_ID}/${TRACKING.GOOGLE_ADS_CONVERSION_LABEL}`
    : null;

export const ga4Ativo = () => idReal(TRACKING.GA4_ID);
export const adsAtivo = () => idReal(TRACKING.GOOGLE_ADS_ID);
export const gtmAtivo = () => idReal(TRACKING.GTM_ID);
export const metaAtivo = () => idReal(TRACKING.META_PIXEL_ID);
