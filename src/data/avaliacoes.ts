/**
 * Avaliações reais do perfil no Google, transcritas sem correção.
 * Nas que terminam em "…", o texto original continua no Google.
 * Não usar em JSON-LD: o Google trata avaliação no próprio site como autopromoção.
 */
export interface Avaliacao {
  autor: string;
  nota: number;
  data: string;
  texto: string;
  destaque?: string;
  contexto?: string;
  criterios?: string[];
}

const NO_GOOGLE = 'no Google';
const CRITERIOS = ['Comida 5/5', 'Serviço 5/5', 'Ambiente 5/5'];

export const avaliacoes: Avaliacao[] = [
  {
    autor: 'Nicolle R.',
    nota: 5,
    data: NO_GOOGLE,
    contexto: 'Refeição no local',
    criterios: CRITERIOS,
    destaque: 'Melhor risoto de moqueca e melhor Hommus que já comemos!',
    texto:
      'Comida impressionante! Melhor risoto de moqueca e melhor Hommus que já comemos! O drink cangalivre (limão e rapadura) também é impressionante. Nota mil. Recomendo e voltarei com certeza',
  },
  {
    autor: 'Mayara C.',
    nota: 5,
    data: NO_GOOGLE,
    contexto: 'Almoço',
    criterios: CRITERIOS,
    destaque: 'Extremamente bem condimentado, apresentação sensacional',
    texto:
      'Comida excelente! Pedimos um chicken massala e uma galinha às 7 ervas e estava tudo maravilhoso! Extremamente bem condimentado, apresentação sensacional.. ótima experiência! Voltaremos com certeza!',
  },
  {
    autor: 'Vinicius S.',
    nota: 5,
    data: NO_GOOGLE,
    contexto: 'Local Guide',
    destaque: 'Temperos realmente no ponto',
    texto:
      'Comi o frango com angu e o risoto de frutos do mar. A comida estava muito bem temperada foi servida em boa quantidade. Temperos realmente no ponto e tudo servido bem corretamente. Com certeza voltarei para zerar o cardapio. …',
  },
  {
    autor: 'Debora C.',
    nota: 5,
    data: NO_GOOGLE,
    contexto: 'Local Guide',
    texto:
      'Que experiência ímpar. Primeiro que o restaurante é super aconchegante. Cheguei e fiz meu pedido sentada no sofá ao som de uma música agradável. Depois, fui pra mesa e aproveitei o melhor da vista e da canaria da rua, que é linda e tem …',
  },
  {
    autor: 'Maria Clara P.',
    nota: 5,
    data: NO_GOOGLE,
    texto:
      'experiência muito gostosa. pedimos de entrada a porção de kibe com queijo e linguiça e prato principal o risoto de frutos do mar e feijoada. 10/10. bons ventos ao novo espaço!! …',
  },
  {
    autor: 'Avaliação no Google',
    nota: 5,
    data: '',
    texto:
      'Chef Bia Souza, ela não tem medo de errar, ou ela tem a certeza que não está errando e nos entrega pratos carregados de sabor, sabendo que mesmo assim são harmoniosos.',
  },
];

/** Citados nas avaliações. Sem preços. */
export const maisElogiados = [
  'Risoto de moqueca',
  'Risoto de frutos do mar',
  'Frango com angu',
  'Galinha às 7 ervas',
  'Chicken massala',
  'Hommus',
  'Kibe com queijo e linguiça',
  'Feijoada',
  'Drink cangalivre, de limão e rapadura',
];
