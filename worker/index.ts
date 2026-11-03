/**
 * Worker do site. Os arquivos estáticos do Astro continuam saindo direto do ASSETS;
 * só /api/* e /painel* passam por aqui (veja run_worker_first no wrangler.jsonc).
 */
import { usuarioDoAccess } from './acesso';
import { receberLead } from './leads';
import { painel } from './painel';

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (pathname === '/api/leads') {
      if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });
      return receberLead(request, env);
    }

    if (pathname === '/painel' || pathname.startsWith('/painel/')) {
      const email = await usuarioDoAccess(request, env);
      if (!email) {
        return new Response('Acesso restrito. Entre pelo endereço oficial do site com um e-mail autorizado.', {
          status: 403,
          headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex' },
        });
      }
      return painel(request, env, email);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
