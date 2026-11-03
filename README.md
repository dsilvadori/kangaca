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

## Leads de eventos (mini CRM)

Cada envio do formulário de eventos é gravado num banco D1 do Cloudflare antes de abrir o WhatsApp. Se a gravação falhar, o WhatsApp abre do mesmo jeito. A equipe acompanha os pedidos em `/painel`, que fica protegido pelo Cloudflare Access.

- **`worker/`:** o Worker que atende `/api/leads` (recebe o formulário) e `/painel` (lista, status, anotações, exclusão e CSV). O resto do site continua estático.
- **`migrations/`:** estrutura da tabela `leads`.
- **Proteção contra spam:** campo escondido no formulário e no máximo 5 pedidos por IP a cada hora.
- **Status:** Novo → Orçado → Fechado ou Perdido. Ao marcar "Fechado", informe o valor: ele vai para o CSV de conversões do Google Ads.

### Configuração (uma vez só)

Enquanto o `database_id` do `wrangler.jsonc` estiver zerado, o deploy falha. Faça os passos 1 e 2 antes do próximo `git push`.

1. Crie o banco e a tabela:
   ```bash
   npx wrangler login
   npx wrangler d1 create kangaca-leads
   ```
   Copie o `database_id` que aparecer para o `wrangler.jsonc` e rode:
   ```bash
   npx wrangler d1 migrations apply kangaca-leads --remote
   ```
2. Faça o deploy (`git push` ou `npx wrangler deploy`). O domínio `kangaca.com.br` precisa estar ligado ao Worker em Settings > Domains & Routes.
3. Proteja o painel no Cloudflare Zero Trust (plano Free):
   - Em **Settings > Authentication > Login methods**, deixe ativo o **One-time PIN**, que manda um código por e-mail (ou adicione o login com Google).
   - Em **Access > Applications > Add an application > Self-hosted**, use o nome `Painel Kangaça`, o domínio `kangaca.com.br` e o caminho `painel`.
   - Crie a política **Allow** com **Include > Emails** e os e-mails da equipe com acesso ao painel.
   - Na aplicação criada, copie o **Application Audience (AUD) Tag**. Em **Settings > Custom Pages**, veja o seu **team domain** (`algo.cloudflareaccess.com`).
4. Cole os dois valores em `ACCESS_TEAM_DOMAIN` e `ACCESS_AUD` no `wrangler.jsonc` e publique de novo. Com eles vazios, o painel responde "Acesso restrito" para todo mundo.

Para dar ou tirar acesso depois, edite só a política do Access. O Worker confere o token do Access em todo pedido ao painel, então o endereço `*.workers.dev`, que fica fora do Access, não abre o painel.

### Conversões off-line no Google Ads

O botão "Conversões para o Google Ads (CSV)" do painel gera o arquivo no formato de importação do Google Ads, só com os leads **fechados** que vieram de anúncio (com `gclid`).

1. No Google Ads, vá em **Metas > Conversões > Nova ação de conversão > Importar > Cliques de CRMs, arquivos ou outras fontes**. Escolha a categoria **Lead convertido** e use o nome **`Evento fechado`**, exatamente assim.
2. Uma vez por semana, baixe o CSV no painel e envie em **Metas > Conversões > Uploads**. O Google ignora cliques repetidos e cliques com mais de 90 dias.

### Desenvolvimento

```bash
npm run build
npx wrangler d1 migrations apply kangaca-leads --local
npx wrangler dev
```

Depois de mudar o `wrangler.jsonc`, rode `npm run worker:tipos` e `npm run worker:check`.
