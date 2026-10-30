# Kangaça · Cozinha de Encontros

Site oficial do Kangaça, restaurante autoral na Vila Mariana, em São Paulo. Feito com Astro (site 100% estático), GSAP e Lenis, para hospedagem no Cloudflare Workers.

## Rodar localmente

É preciso ter **Node 22.23.4 ou mais recente** (o Astro atual não roda no Node 20). Com o nvm, `nvm install` lê a versão do `.nvmrc`.

```bash
npm install
npm run dev
```

O site abre em http://localhost:4321. O `astro dev` fica rodando em segundo plano: use `npx astro dev stop` para parar e `npx astro dev logs` para ver os logs.

Para testar a versão de produção:

```bash
npm run build
npx serve dist
```

## Publicar no Cloudflare Workers

O site é servido como arquivos estáticos de um Worker. A configuração está em `wrangler.jsonc`.

**Pelo GitHub (recomendado):** no painel do Cloudflare, vá em Workers & Pages > Create application e importe o repositório. Configure:

- Project name: `kangaca` (igual ao `name` do `wrangler.jsonc`)
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Variável de build: `NODE_VERSION` = `22.23.4`

Cada `git push` na `main` publica uma nova versão em alguns minutos. Se o build falhar, a versão anterior continua no ar.

**Pela linha de comando:**

```bash
npm run build
npx wrangler login
npx wrangler deploy
```

Depois, adicione o domínio em Settings > Domains & Routes.

## Páginas

- `/`: página principal.
- `/almoco-executivo-vila-mariana/`, `/buffet-e-eventos/` e `/jantares-especiais/`: páginas de destino dos grupos de anúncios. Reaproveitam as seções da home.
- `/politica-de-privacidade/` e a 404: `noindex` e fora do sitemap.

Parâmetros de anúncio (`gclid`, `gbraid`, `wbraid`, `utm_*`) são mantidos na navegação entre páginas por `src/scripts/parametros.ts`.

## Onde mudar as coisas

- **`src/config/site.ts`:** WhatsApp, mensagens, endereço, horários, Instagram, IDs do Google e os `TODO`s. Os dados ficam só aqui.
- **`src/data/avaliacoes.ts`:** avaliações do Google. Use o texto exato do Google. Nota, total e data de referência ficam em `GOOGLE`, no `site.ts`.
- **`public/_redirects`:** redirecionamento de `/whatsapp`. Se o número mudar, atualize aqui também.
- **`astro.config.mjs` e `public/robots.txt`:** domínio do site.
- **`src/assets/`:** fotos. Para trocar, substitua o arquivo mantendo o nome. A lista das que merecem foto profissional está em `src/components/Img.astro`.
- **`npm run icons`:** gera de novo os favicons (a partir de `src/assets/logo/favicon-k.svg`) e a imagem de compartilhamento.

## Google Ads e Analytics

Preencha `GOOGLE_ADS_ID`, `GOOGLE_ADS_CONVERSION_LABEL` e `GA4_ID` em `src/config/site.ts`. Enquanto tiverem X, nenhum script do Google é carregado.

- Todo clique em link do WhatsApp dispara a conversão do Google Ads e o evento GA4 `whatsapp_click`, com os parâmetros `cta` e `local`.
- O envio do formulário de eventos dispara também `generate_lead`.
- O consentimento começa negado (Consent Mode v2) e muda para concedido quando a pessoa clica em "Aceitar".
