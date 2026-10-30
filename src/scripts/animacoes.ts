import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

const FORA = 'expo.out';
const DESKTOP = '(min-width: 1024px)';

const todos = <T extends Element = HTMLElement>(seletor: string, raiz: ParentNode = document) =>
  gsap.utils.toArray<T>(raiz.querySelectorAll(seletor));

function rolagemSuave() {
  const lenis = new Lenis({ lerp: 0.14, anchors: { duration: 0.9 } });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((tempo) => lenis.raf(tempo * 1000));
  gsap.ticker.lagSmoothing(0);
  window.addEventListener('kg:menu', (e) => ((e as CustomEvent<boolean>).detail ? lenis.stop() : lenis.start()));
}

function titulo(el: HTMLElement) {
  gsap.set(el, { autoAlpha: 1, y: 0 });
  SplitText.create(el, {
    type: 'lines',
    mask: 'lines',
    linesClass: 'linha-split',
    autoSplit: true,
    onSplit: (split) =>
      gsap.from(split.lines, {
        yPercent: 110,
        duration: 0.65,
        stagger: 0.05,
        ease: FORA,
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      }),
  });
}

function revelacoes() {
  ScrollTrigger.batch(todos('[data-reveal]'), {
    start: 'top 94%',
    once: true,
    onEnter: (lote) => gsap.to(lote, { opacity: 1, y: 0, duration: 0.55, stagger: 0.05, ease: FORA, overwrite: true }),
  });
}

/** Revelação em cortina. */
function cortina(quadro: HTMLElement) {
  const imagem = quadro.querySelector('img');
  const linha = gsap.timeline({ scrollTrigger: { trigger: quadro, start: 'top 90%', once: true } });
  linha.to(quadro, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.75, ease: FORA }, 0);
  if (imagem) linha.from(imagem, { scale: 1.1, duration: 0.95, ease: FORA }, 0);
}

function cortinas() {
  todos('[data-curtain]').forEach((quadro) => cortina(quadro));
}

function fundoDoHero() {
  const fundo = document.querySelector('[data-hero-fundo]');
  if (!fundo) return;
  gsap.to(fundo, {
    yPercent: 7,
    ease: 'none',
    scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true },
  });
}

function parallax() {
  todos('[data-parallax]').forEach((foto) => {
    gsap.to(foto, {
      yPercent: Number(foto.dataset.parallax),
      ease: 'none',
      scrollTrigger: { trigger: foto, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

/** O loop roda em CSS, no compositor; aqui só mudam velocidade e sentido conforme a rolagem. */
function marquee() {
  const trilha = document.querySelector('[data-marquee-trilha]');
  const loop = trilha?.getAnimations()[0];
  if (!loop) return;
  loop.currentTime = 38000 * 100; // folga para o sentido inverso não bater no início

  const ritmo = { valor: 1 };
  const aplicar = () => (loop.playbackRate = ritmo.valor);
  ScrollTrigger.create({
    onUpdate: (self) => {
      const extra = gsap.utils.clamp(0, 2.5, Math.abs(self.getVelocity()) / 900);
      ritmo.valor = self.direction * (1 + extra);
      aplicar();
      gsap.to(ritmo, { valor: self.direction, duration: 0.8, ease: 'power2.out', overwrite: true, onUpdate: aplicar });
    },
  });
}

function circulos(mm: gsap.MatchMedia) {
  const palco = document.querySelector<HTMLElement>('[data-conceito]');
  if (!palco) return;

  mm.add(DESKTOP, () => {
    const linha = gsap.timeline({
      scrollTrigger: { trigger: palco, start: 'center center', end: '+=70%', scrub: 0.3, pin: true },
    });
    const origem: Record<string, { x: number; y: number }> = {
      topo: { x: 0, y: 78 },
      esquerda: { x: -210, y: -78 },
      direita: { x: 210, y: -78 },
    };
    todos<SVGCircleElement>('[data-circulo]', palco).forEach((circulo) => {
      const de = origem[circulo.dataset.circulo!];
      linha.fromTo(circulo, { ...de, strokeDashoffset: 1 }, { x: 0, y: 0, strokeDashoffset: 0, ease: 'power1.inOut', duration: 1 }, 0);
    });
    linha.to(todos('[data-orbe]', palco), { opacity: 1, y: 0, stagger: 0.2, duration: 0.4 }, 0.45);

    // Ao estreitar a janela o pin some: o conteúdo precisa continuar visível.
    return () => todos('[data-orbe], [data-circulo]', palco).forEach((el) => el.classList.add('visivel'));
  });
}

function estrelas() {
  const grupo = document.querySelector('[data-estrelas]');
  if (!grupo) return;
  gsap.to(todos('[data-estrela]', grupo), {
    opacity: 1,
    scale: 1,
    duration: 0.3,
    stagger: 0.1,
    ease: 'back.out(2.5)',
    scrollTrigger: { trigger: grupo, start: 'top 85%', once: true },
  });
}

function magneticos() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  todos('[data-magnetic]').forEach((botao) => {
    const x = gsap.quickTo(botao, 'x', { duration: 0.3, ease: 'power3.out' });
    const y = gsap.quickTo(botao, 'y', { duration: 0.3, ease: 'power3.out' });
    botao.addEventListener('pointermove', (e) => {
      const caixa = botao.getBoundingClientRect();
      x((e.clientX - caixa.left - caixa.width / 2) * 0.18);
      y((e.clientY - caixa.top - caixa.height / 2) * 0.28);
    });
    botao.addEventListener('pointerleave', () => {
      x(0);
      y(0);
    });
  });
}

const pausa = () => new Promise((fim) => setTimeout(fim));

/** Fatiado em tarefas curtas, para não travar a página. Os pins vêm primeiro: os gatilhos abaixo deles dependem do espaço que ocupam. */
async function iniciar() {
  rolagemSuave();
  const mm = gsap.matchMedia();

  const etapas = [
    () => circulos(mm),
    ...todos('[data-split]').map((el) => () => titulo(el)),
    revelacoes,
    cortinas,
    fundoDoHero,
    parallax,
    marquee,
    estrelas,
    magneticos,
  ];

  for (const etapa of etapas) {
    etapa();
    await pausa();
  }
  ScrollTrigger.refresh();
  window.__kgAnimacoes = true;
}

const quandoOcioso = window.requestIdleCallback ?? ((fn: () => void) => setTimeout(fn, 200));
quandoOcioso(iniciar, { timeout: 1500 });
