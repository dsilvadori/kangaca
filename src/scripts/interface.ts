const html = document.documentElement;
const hero = document.querySelector('[data-hero]');
const rodape = document.querySelector('[data-rodape]');

// Header sólido e barra do celular aparecem depois do hero.
if (hero) {
  new IntersectionObserver(
    ([entrada]) => html.classList.toggle('passou-hero', !entrada.isIntersecting),
    { rootMargin: '-72px 0px 0px 0px' },
  ).observe(hero);
} else {
  html.classList.add('passou-hero');
}

// Antes de seguir uma âncora, o navegador precisa das alturas reais das seções.
document.addEventListener('click', (evento) => {
  if ((evento.target as Element).closest('a[href*="#"]')) html.classList.add('layout-completo');
}, true);

// A barra some quando o rodapé entra na tela.
if (rodape) {
  new IntersectionObserver(([entrada]) => html.classList.toggle('no-rodape', entrada.isIntersecting)).observe(rodape);
}
