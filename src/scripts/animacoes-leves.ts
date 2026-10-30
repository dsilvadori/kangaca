// Versão do celular: nada de GSAP, pin ou scrub. Um observer liga as transições do CSS.
const SELETOR = '[data-reveal], [data-split], [data-curtain], [data-orbe], [data-circulo], [data-estrela]';

function marquee() {
  const loop = document.querySelector('[data-marquee-trilha]')?.getAnimations()[0];
  if (!loop) return;
  loop.currentTime = 38000 * 100; // folga para o sentido inverso não bater no início

  let anterior = window.scrollY;
  let espera = 0;
  window.addEventListener(
    'scroll',
    () => {
      const delta = window.scrollY - anterior;
      anterior = window.scrollY;
      if (!delta) return;
      const sentido = Math.sign(delta);
      loop.playbackRate = sentido * (1 + Math.min(Math.abs(delta) / 40, 2));
      clearTimeout(espera);
      espera = window.setTimeout(() => (loop.playbackRate = sentido), 180);
    },
    { passive: true },
  );
}

export function animacoesLeves() {
  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add('visivel');
        observador.unobserve(entrada.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px' },
  );

  document.querySelectorAll(SELETOR).forEach((el) => observador.observe(el));
  marquee();
  window.__kgAnimacoes = true;
}
