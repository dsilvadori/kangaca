/**
 * Worker do site. Os arquivos estáticos do Astro continuam saindo direto do ASSETS;
 * só /api/* e /whatsapp passam por aqui (veja run_worker_first no wrangler.jsonc).
 */
import { receberLead } from './leads';
import { abrirWhatsapp, foraDoBrasil } from './whatsapp';

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    const pais = request.cf?.country;

    if (pathname === '/whatsapp' || pathname === '/whatsapp/') {
      return abrirWhatsapp(request, env, pais);
    }

    if (pathname === '/api/leads') {
      if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });
      // Pedidos de fora do Brasil não vão para a planilha.
      if (foraDoBrasil(pais)) return Response.json({ erro: 'pais' }, { status: 403 });
      return receberLead(request, env);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
