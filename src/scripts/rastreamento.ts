import { conversaoSendTo, ga4Ativo } from '../config/site';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    __kgAnimacoes?: boolean;
  }
}

/** Conversão do Google Ads e evento GA4 de um clique que leva ao WhatsApp. */
export function rastrearWhatsapp(cta: string, local: string) {
  if (!window.gtag) return;
  const sendTo = conversaoSendTo();
  if (sendTo) {
    window.gtag('event', 'conversion', { send_to: sendTo, transport_type: 'beacon' });
  }
  if (ga4Ativo()) {
    window.gtag('event', 'whatsapp_click', { cta, local, transport_type: 'beacon' });
  }
}

export function rastrearLead() {
  if (window.gtag && ga4Ativo()) {
    window.gtag('event', 'generate_lead', { transport_type: 'beacon' });
  }
}

document.addEventListener('click', (evento) => {
  const link = (evento.target as Element).closest<HTMLAnchorElement>('a[href*="wa.me"]');
  if (link) rastrearWhatsapp(link.dataset.cta ?? 'geral', link.dataset.local ?? 'desconhecido');
});
