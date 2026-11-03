// Mantém gclid, gbraid, wbraid e utm_* ao navegar entre as páginas do site.
const CHAVE = 'kg-parametros';
const rastreavel = (nome: string) => /^(gclid|gbraid|wbraid|utm_.+)$/.test(nome);

function carregar() {
  const atuais = [...new URLSearchParams(location.search)].filter(([nome]) => rastreavel(nome));
  try {
    if (atuais.length) sessionStorage.setItem(CHAVE, JSON.stringify(atuais));
    return atuais.length ? atuais : (JSON.parse(sessionStorage.getItem(CHAVE) ?? '[]') as [string, string][]);
  } catch {
    return atuais;
  }
}

/** Parâmetros de anúncio da visita, também enviados com o pedido de orçamento. */
export const parametros = carregar();

if (parametros.length) {
  document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((link) => {
    const url = new URL(link.href);
    // Âncoras da própria página continuam como estão: a URL atual já traz os parâmetros.
    if (url.origin !== location.origin || url.pathname === location.pathname) return;
    parametros.forEach(([nome, valor]) => {
      if (!url.searchParams.has(nome)) url.searchParams.set(nome, valor);
    });
    link.href = url.href;
  });
}
