// Carrossel de avaliações: scroll-snap nativo, com setas e arrastar com o mouse.
document.querySelectorAll<HTMLElement>('[data-carrossel]').forEach((carrossel) => {
  const trilha = carrossel.querySelector<HTMLElement>('[data-carrossel-trilha]')!;

  const setas = carrossel.querySelectorAll<HTMLButtonElement>('[data-carrossel-seta]');
  const itens = [...trilha.children] as HTMLElement[];
  const recuo = () => parseFloat(getComputedStyle(trilha).scrollPaddingLeft) || 0;
  const destino = (item: HTMLElement) => item.offsetLeft - recuo();

  const irPara = (item?: HTMLElement) => {
    if (item) trilha.scrollTo({ left: destino(item), behavior: 'smooth' });
  };

  setas.forEach((seta) => {
    seta.addEventListener('click', () => {
      const atual = trilha.scrollLeft;
      irPara(
        seta.dataset.carrosselSeta === '1'
          ? itens.find((item) => destino(item) > atual + 2)
          : itens.findLast((item) => destino(item) < atual - 2),
      );
    });
  });

  const atualizarSetas = () => {
    const fim = trilha.scrollWidth - trilha.clientWidth - 2;
    setas.forEach((seta) => {
      seta.disabled = seta.dataset.carrosselSeta === '1' ? trilha.scrollLeft >= fim : trilha.scrollLeft <= 2;
    });
  };
  trilha.addEventListener('scroll', atualizarSetas, { passive: true });
  window.addEventListener('resize', atualizarSetas);
  atualizarSetas();

  // Imagens lazy numa trilha lateral só baixariam ao aparecer: adianta quando a seção se aproxima.
  const antecipar = new IntersectionObserver(
    ([entrada]) => {
      if (!entrada.isIntersecting) return;
      trilha.querySelectorAll('img').forEach((img) => {
        if (img.offsetParent) img.loading = 'eager'; // ignora as que estão em display: none
      });
      antecipar.disconnect();
    },
    { rootMargin: '800px 0px' },
  );
  antecipar.observe(trilha);

  // Arrastar com o mouse. Só assume depois de mover, para os links dos cards continuarem clicáveis.
  let inicio: number | null = null;
  let posicao = 0;
  let arrastando = false;

  trilha.addEventListener('dragstart', (e) => e.preventDefault());

  trilha.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return;
    inicio = e.clientX;
    posicao = trilha.scrollLeft;
  });

  trilha.addEventListener('pointermove', (e) => {
    if (inicio === null) return;
    const delta = e.clientX - inicio;
    if (!arrastando && Math.abs(delta) > 6) {
      arrastando = true;
      trilha.classList.add('is-arrastando');
      trilha.setPointerCapture(e.pointerId);
    }
    if (arrastando) trilha.scrollLeft = posicao - delta;
  });

  const soltar = () => {
    inicio = null;
    if (!arrastando) return;
    arrastando = false;
    // Desliza até o card mais próximo e só então devolve o snap, sem salto.
    const atual = trilha.scrollLeft;
    irPara(itens.reduce((perto, item) => (Math.abs(destino(item) - atual) < Math.abs(destino(perto) - atual) ? item : perto)));
    setTimeout(() => trilha.classList.remove('is-arrastando'), 350);
  };
  trilha.addEventListener('pointerup', soltar);
  trilha.addEventListener('pointercancel', soltar);
});
