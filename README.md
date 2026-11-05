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
- `/confraternizacao-fim-de-ano/`: página da campanha de fim de ano. O formulário grava `confra-2026` no começo da coluna **Origem** da planilha (ex.: `confra-2026 · Google Ads`) e a mensagem do WhatsApp já diz que é confraternização.
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

## Leads de eventos (planilha)

Cada envio do formulário de eventos vira uma linha numa Google Sheet antes de abrir o WhatsApp. Se o envio falhar, o WhatsApp abre do mesmo jeito. O caminho é formulário → Worker (`/api/leads`) → Apps Script → planilha. Nada fica guardado no Cloudflare.

- **`worker/`:** valida o pedido, barra robôs (campo escondido e no máximo 5 envios por minuto por IP) e repassa para a planilha.
- **`apps-script/planilha-leads.gs`:** o script da planilha. Monta a aba `Leads`, grava cada pedido e põe o WhatsApp como link que abre a conversa com uma mensagem pronta.
- **Na planilha:** a equipe muda o **Status** (Novo, Em conversa, Orçado, Fechado, Perdido), anota o **Valor fechado** e escreve em **Anotações**. Para atender a um pedido de exclusão, apague a linha.

### Configuração (uma vez só)

1. **Crie a planilha.** No Google Drive da conta do Kangaça, crie uma planilha chamada `Leads Kangaça` e compartilhe com quem vai atender.
2. **Cole o script.** Na planilha, abra **Extensões > Apps Script**. Apague o conteúdo do `Código.gs`, cole o conteúdo de `apps-script/planilha-leads.gs` e salve.
3. **Crie o token.** Gere um código aleatório com `openssl rand -hex 24`. No Apps Script, vá em **Configurações do projeto** (engrenagem) **> Propriedades do script > Adicionar propriedade**, com o nome `TOKEN` e o código como valor.
4. **Monte a aba.** No editor, escolha a função `prepararPlanilha` e clique em **Executar**. O Google pede autorização: entre com a conta do Kangaça e, se aparecer "app não verificado", clique em **Avançado > Acessar**.
5. **Publique o script.** Clique em **Implantar > Nova implantação > Tipo: App da Web** e configure:
   - **Executar como:** Eu
   - **Quem pode acessar:** Qualquer pessoa

   Copie a **URL do app da Web**, que termina em `/exec`.
6. **Ligue o Worker à planilha.** No Cloudflare, vá em **Workers & Pages > kangaca > Settings > Variables and Secrets** e adicione dois itens do tipo **Secret**:
   - `PLANILHA_URL`: a URL do passo 5
   - `PLANILHA_TOKEN`: o mesmo código do passo 3

   Se preferir o terminal, use `npx wrangler secret put PLANILHA_URL` e `npx wrangler secret put PLANILHA_TOKEN`.
7. **Teste.** Envie um pedido pelo formulário do site. A linha deve aparecer na planilha em alguns segundos.

Se mudar o script depois, publique de novo em **Implantar > Gerenciar implantações > editar (lápis) > Versão: Nova versão**. Assim a URL continua a mesma.

### Conversões off-line no Google Ads

As colunas `gclid` e **Valor fechado** permitem informar ao Google Ads quais cliques viraram evento fechado.

1. No Google Ads, crie a ação em **Metas > Conversões > Nova ação de conversão > Importar > Cliques de CRMs, arquivos ou outras fontes**, com a categoria **Lead convertido** e o nome `Evento fechado`.
2. Para enviar, filtre a planilha por Status = Fechado com `gclid` preenchido e monte o arquivo no modelo do próprio Google Ads.
3. Envie o arquivo em **Metas > Conversões > Uploads**.

### Desenvolvimento

```bash
npm run build
npx wrangler dev
```

Para testar o envio localmente, crie um arquivo `.dev.vars` com `PLANILHA_URL=...` e `PLANILHA_TOKEN=...`. Ele já fica fora do git. Depois de mudar o `wrangler.jsonc`, rode `npm run worker:tipos` e `npm run worker:check`.
