/**
 * Worker do site. Os arquivos estáticos do Astro continuam saindo direto do ASSETS;
 * só /api/* passa por aqui (veja run_worker_first no wrangler.jsonc).
 */
import { receberLead } from './leads';

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (pathname === '/api/leads') {
      if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });
      return receberLead(request, env);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
