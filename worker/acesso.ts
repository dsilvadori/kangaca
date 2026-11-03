/**
 * Confere o token do Cloudflare Access que chega no cabeçalho Cf-Access-Jwt-Assertion.
 * O Access já barra quem não está na lista; esta checagem fecha o painel também
 * para quem chegar por outro endereço (como o *.workers.dev), onde o Access não atua.
 */

interface Chave extends JsonWebKey {
  kid: string;
}

let chaves: { dominio: string; lista: Chave[]; buscadoEm: number } | null = null;

async function buscarChaves(dominio: string, forcar = false): Promise<Chave[]> {
  const umaHora = 60 * 60 * 1000;
  if (!forcar && chaves?.dominio === dominio && Date.now() - chaves.buscadoEm < umaHora) {
    return chaves.lista;
  }
  const resposta = await fetch(`https://${dominio}/cdn-cgi/access/certs`);
  if (!resposta.ok) throw new Error(`Access certs: ${resposta.status}`);
  const { keys } = (await resposta.json()) as { keys: Chave[] };
  chaves = { dominio, lista: keys, buscadoEm: Date.now() };
  return keys;
}

function base64url(texto: string): Uint8Array<ArrayBuffer> {
  const base64 = texto.replace(/-/g, '+').replace(/_/g, '/');
  const binario = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4));
  return Uint8Array.from(binario, (c) => c.charCodeAt(0));
}

/** Devolve o e-mail de quem está logado, ou null se o token não for válido. */
export async function usuarioDoAccess(request: Request, env: Env): Promise<string | null> {
  const dominio = env.ACCESS_TEAM_DOMAIN.replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (!dominio || !env.ACCESS_AUD) return null;

  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token) return null;
  const partes = token.split('.');
  if (partes.length !== 3) return null;

  try {
    const [cabecalhoB64, corpoB64, assinaturaB64] = partes;
    const cabecalho = JSON.parse(new TextDecoder().decode(base64url(cabecalhoB64)));
    const corpo = JSON.parse(new TextDecoder().decode(base64url(corpoB64)));
    if (cabecalho.alg !== 'RS256') return null;

    let chave = (await buscarChaves(dominio)).find((k) => k.kid === cabecalho.kid);
    // O Access troca as chaves de tempos em tempos.
    if (!chave) chave = (await buscarChaves(dominio, true)).find((k) => k.kid === cabecalho.kid);
    if (!chave) return null;

    const publica = await crypto.subtle.importKey(
      'jwk',
      chave,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    const valida = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      publica,
      base64url(assinaturaB64),
      new TextEncoder().encode(`${cabecalhoB64}.${corpoB64}`),
    );
    if (!valida) return null;

    const audiencias: string[] = Array.isArray(corpo.aud) ? corpo.aud : [corpo.aud];
    const agora = Math.floor(Date.now() / 1000);
    if (!audiencias.includes(env.ACCESS_AUD)) return null;
    if (corpo.iss !== `https://${dominio}`) return null;
    if (typeof corpo.exp !== 'number' || corpo.exp < agora) return null;
    if (typeof corpo.nbf === 'number' && corpo.nbf > agora + 60) return null;

    return typeof corpo.email === 'string' ? corpo.email : null;
  } catch {
    return null;
  }
}
