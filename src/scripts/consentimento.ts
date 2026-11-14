export {};

const CHAVE = 'kg-consentimento';
const banner = document.querySelector<HTMLElement>('[data-consentimento]');

banner?.addEventListener('click', (evento) => {
  const botao = (evento.target as Element).closest<HTMLElement>('[data-consentir]');
  if (!botao) return;
  const valor = botao.dataset.consentir as 'granted' | 'denied';
  try {
    localStorage.setItem(CHAVE, valor);
  } catch {}
  window.gtag?.('consent', 'update', {
    ad_storage: valor,
    ad_user_data: valor,
    ad_personalization: valor,
    analytics_storage: valor,
  });
  window.fbq?.('consent', valor === 'granted' ? 'grant' : 'revoke');
  document.documentElement.classList.remove('pede-consentimento');
});
