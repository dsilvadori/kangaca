const botao = document.querySelector<HTMLButtonElement>('[data-menu-botao]');
const menu = document.querySelector<HTMLElement>('[data-menu]');
const atras = document.querySelectorAll<HTMLElement>('main, footer, .flutuante, .barra, .consentimento');

function alternar(abrir: boolean) {
  if (!botao || !menu) return;
  document.documentElement.classList.toggle('menu-aberto', abrir);
  botao.setAttribute('aria-expanded', String(abrir));
  botao.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
  menu.inert = !abrir;
  atras.forEach((el) => (el.inert = abrir));
  window.dispatchEvent(new CustomEvent('kg:menu', { detail: abrir }));
}

botao?.addEventListener('click', () => alternar(botao.getAttribute('aria-expanded') !== 'true'));

menu?.addEventListener('click', (evento) => {
  if ((evento.target as Element).closest('a')) alternar(false);
});

document.addEventListener('keydown', (evento) => {
  if (evento.key === 'Escape' && botao?.getAttribute('aria-expanded') === 'true') {
    alternar(false);
    botao.focus();
  }
});
