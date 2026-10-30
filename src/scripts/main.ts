import './rastreamento';
import './consentimento';
import './parametros';
import './interface';
import './menu';
import './orcamento';
import './carrossel';
import { animacoesLeves } from './animacoes-leves';

// Só telas grandes baixam GSAP e Lenis. Sem movimento, nenhuma animação roda.
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  if (matchMedia('(min-width: 1024px)').matches) import('./animacoes');
  else animacoesLeves();
}
