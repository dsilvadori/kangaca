import { ENDERECO, GOOGLE, HORARIOS, INSTAGRAM, SEO, SITE, WHATSAPP } from '../config/site';

const absoluto = (caminho: string) => new URL(caminho, SITE.dominio).href;
const ID_RESTAURANTE = absoluto('/#restaurante');
const ID_SITE = absoluto('/#site');

const bia = { '@type': 'Person', name: SITE.chef, jobTitle: 'Chef, ativista pela Soberania Alimentar e entusiasta de comida afrodiaspórica e asiática' };

export const restaurante = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  '@id': ID_RESTAURANTE,
  name: SITE.nome,
  description: SEO.descricao,
  url: absoluto('/'),
  image: absoluto(SEO.imagemOg),
  logo: absoluto(SEO.logo),
  telephone: WHATSAPP.telefoneE164,
  address: {
    '@type': 'PostalAddress',
    streetAddress: ENDERECO.rua,
    addressLocality: ENDERECO.cidade,
    addressRegion: ENDERECO.uf,
    postalCode: ENDERECO.cep,
    addressCountry: ENDERECO.pais,
  },
  ...(SEO.geo.latitude && SEO.geo.longitude
    ? { geo: { '@type': 'GeoCoordinates', latitude: SEO.geo.latitude, longitude: SEO.geo.longitude } }
    : {}),
  servesCuisine: ['Fusão', 'Afro-brasileira', 'Asiática', 'Autoral'],
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: HORARIOS.almoco.schema.dias,
    opens: HORARIOS.almoco.schema.abre,
    closes: HORARIOS.almoco.schema.fecha,
  },
  acceptsReservations: true,
  priceRange: SEO.priceRange,
  hasMenu: absoluto('/#cardapio'),
  sameAs: [INSTAGRAM.url, GOOGLE.url],
  founder: bia,
  employee: bia,
};

export const webSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': ID_SITE,
  url: absoluto('/'),
  name: SITE.nomeCompleto,
  inLanguage: 'pt-BR',
  publisher: { '@id': ID_RESTAURANTE },
};

export const breadcrumb = (nome: string, caminho: string) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Início', item: absoluto('/') },
    { '@type': 'ListItem', position: 2, name: nome, item: absoluto(caminho) },
  ],
});
