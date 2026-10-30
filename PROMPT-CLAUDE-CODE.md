# Prompt: site do Kangaça (landing page para Google Ads)

> Cole todo o texto abaixo da linha no Claude Code, rodando numa pasta vazia que já tenha a pasta `assets/` deste kit ao lado.

---

Você vai criar o site oficial do **Kangaça · Cozinha de Encontros**, um restaurante autoral na Vila Mariana, em São Paulo. O site é estático, será hospedado no **Cloudflare Pages** e vai receber tráfego pago do **Google Ads**. Ele precisa ser bonito, impactante e rápido, e o objetivo principal é levar a pessoa a **conversar com o Kangaça pelo WhatsApp** para reservar mesa, vir ao almoço ou orçar um evento.

Escreva todo o conteúdo do site em português do Brasil. Antes de começar a programar, leia este prompt inteiro, olhe todas as imagens da pasta `assets/` e me mostre um plano curto (estrutura de páginas, seções e animações). Depois execute sem esperar confirmação, a menos que encontre algum bloqueio.

## 1. Stack e hospedagem

- **Astro** (última versão estável) com saída 100% estática (`output: 'static'`), TypeScript e CSS próprio com variáveis (sem framework de UI pesado). Tailwind é opcional; prefira CSS bem organizado.
- **Imagens:** copie `assets/` para `src/assets/` e use `astro:assets` (`<Image>` / `<Picture>`) para gerar AVIF/WebP em vários tamanhos, com `width`/`height` definidos, `loading="lazy"` abaixo da dobra e `fetchpriority="high"` só na imagem do hero.
- **Animações:** GSAP + ScrollTrigger (pacote `gsap` do npm) e Lenis para rolagem suave. Nada de jQuery ou bibliotecas de carrossel pesadas.
- **Fontes:** auto-hospedadas via `@fontsource` com `font-display: swap`: **DM Serif Display** (títulos), **DM Sans** (texto) e **Dancing Script** só para detalhes manuscritos. Faça preload só da fonte de título.
- **Cloudflare Pages:**
  - `npm run build` gerando a pasta `dist/`. Fixe Node 20+ em `.nvmrc` e no campo `engines` do `package.json`.
  - `public/_headers` com cache longo e imutável para `/_astro/*`, cache curto para HTML e cabeçalhos de segurança (`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`). Não coloque uma CSP que bloqueie o Google Tag Manager/gtag ou o iframe do Google Maps.
  - `public/_redirects` redirecionando `/whatsapp` para o link do WhatsApp (bom para usar em bio e QR code).
  - Página `404.astro` no estilo da marca.
  - `@astrojs/sitemap` e `public/robots.txt`. Deixe o domínio em `site` no `astro.config.mjs` como `https://kangaca.com.br` com um comentário `// TODO: confirmar domínio`.
  - Um `README.md` explicando, em português, como rodar localmente (`npm install`, `npm run dev`) e como publicar: conectando o repositório do GitHub no painel do Cloudflare Pages (framework preset Astro, build `npm run build`, output `dist`) ou com `npx wrangler pages deploy dist`.

## 2. A marca

**Nome:** KANGAÇA. **Assinatura:** "Cozinha de encontros". **Frase-conceito:** "Tradição em movimento." **Descritor usado pela casa:** "Cozinha afro-brasileira com umami asiático."

**Conceito (use este texto como base, pode editar para web):**
O Kangaça é um projeto gastronômico autoral que nasce do encontro entre Brasil, África e Ásia, valorizando a ancestralidade, a comida popular e as trocas culturais que, ao longo dos séculos, transformaram a maneira como o mundo se alimenta. Mais do que uma cozinha de fusão, é uma cozinha de encontros e travessias, que resgata técnicas, ingredientes e saberes tradicionais para criar uma gastronomia contemporânea, acessível, criativa e cheia de identidade. Os protagonistas são os arrozes, vegetais, proteínas, angus, pastas de temperos, molhos encorpados, pestos, azeites artesanais e conservas, com inspiração nas cozinhas de rua, nas tradições africanas e brasileiras e em culturas asiáticas que vão além de Japão, China e Coreia.

**Símbolo:** três círculos, um para cada mundo (Ásia, África e Brasil). Crie esse símbolo em SVG inline (três círculos que se tocam ou se sobrepõem levemente, só com traço) e use como elemento gráfico recorrente: divisores de seção, marcadores de lista, loader e animações.

**Cores (cada uma tem um significado; use os significados no texto da seção de identidade):**

| Token | Hex | Uso |
|---|---|---|
| `--turquesa-profundo` | `#0E464D` | Fundo principal escuro, cor do logo e da porta da casa |
| `--turquesa` | `#2B8A8C` | Os mares e as travessias de povos e especiarias |
| `--bege` | `#D9BC93` | A terra à vista, os portos de chegada e partida; cor do logo |
| `--bege-claro` | `#F4ECDF` | Fundo claro das seções |
| `--terracota` | `#A84A2A` | A terra, o fogo e a ancestralidade; destaques e CTAs |
| `--tinta` | `#1E2B2C` | Texto sobre fundo claro |

Alterne seções em bege-claro e turquesa-profundo. Use a terracota com moderação, principalmente nos botões de ação. Garanta contraste AA nos textos. Os botões do WhatsApp podem usar a terracota da marca (não precisa ser o verde do WhatsApp), mas devem ter o ícone do WhatsApp.

**Logo:** `assets/logo/kangaca-logo-bege.png` (bege sobre transparente, para fundos escuros). `assets/logo/cozinha-de-encontros-bege.png` e `...-branco.png` são a assinatura manuscrita. Para fundos claros, aplique o logo em turquesa-profundo com `mask-image` ou filtro CSS, sem distorcer. O logo é pequeno (cerca de 400 px de largura), então não use maior do que isso na tela.

## 3. Informações reais (não invente além disso)

- **WhatsApp:** (11) 91208-2104 → link `https://wa.me/5511912082104`
- **Endereço:** R. Guimarães Passos, 17, Vila Mariana, São Paulo, SP
- **Instagram:** @kangacacozinha → `https://www.instagram.com/kangacacozinha/`
- **Idealizadora e chef:** Beatriz Souza, a Bia
- **Almoço executivo:** terça a sexta, das 11h30 às 15h. Entrada, prato principal, sobremesa e suco cozido (feito de compota caseira). "Comida caseira sem fronteiras. Gostinho de casa e aconchego, mas viaja o mundo."
- **Jantares especiais e menus temáticos:** sob reserva, com datas divulgadas no Instagram. Exemplo real: o menu especial **Mar e Terra** (Dia dos Namorados) a R$ 165 por pessoa, das 18h às 23h, com croqueta aberta de salmão curado ou de costela ao vinho, fettuccine ao pesto de coentro e nori ou risoto de linguiça defumada da casa, e escondidinho de morango e coco.
- **Eventos e buffet:** "Kangaça cozinha no seu evento, ou seu evento aqui em nossa casa." Buffet, finger foods, drinks e doces. Inclui cardápio personalizado, drinks e bebidas, montagem da mesa, produção e serviço.
- **Avaliação 5 estrelas no Google:** "Chef Bia Souza, ela não tem medo de errar, ou ela tem a certeza que não está errando e nos entrega pratos carregados de sabor, sabendo que mesmo assim são harmoniosos."

**Pratos reais (use nos cards do cardápio):**
- **Goxinha:** coxinha de gohan recheada de pernil desfiado agridoce e gergelim tostado, com catchup de missô e maionese de wasabi. "Um encontro do Brasil com o Japão."
- **Gravlax na focaccia:** salmão curado com sal, açúcar, ervas, coentro, gin e cachacinha mineira, servido em sanduíche de focaccia feita na casa, com salada do dia, maionese temperada e sour cream. "O tempo também é ingrediente."
- **Creme de arroz com especiarias:** a leitura do Kangaça para o Khao Niao Mamuang tailandês. Gohan premium de grão curto, especiarias, leite de coco, coulis de manga com pêssego e coco ralado. "Viajou da Tailândia pra nossa cozinha, mas pegou um pouquinho de Japão, Índia e do nosso toque abrasileirado."
- **Prato do dia:** "Aqui você escolhe seu prato, cada dia um jeitinho diferente, sabores que conectam Brasil, África e Ásia." (Na foto: frango assado, arroz, legumes tostados e pasta.)
- **Da casa:** azeites artesanais, pestos e conservas.

**Bia Souza (texto base, adapte para web):** Desde 2016 a Bia faz eventos gastronômicos com uma missão: levar às pessoas uma culinária que valoriza a ancestralidade, a cultura e o amor de uma cozinha de herança, passada de mãe para filha. Com a mãe aprendeu o amor pelo acarajé e pela cultura baiana, e daí nasceu o Acarajazz. O Kangaça amplia essa travessia: do Brasil e da África até as cozinhas de rua da Ásia. Frase que ela carrega: "Não mexe comigo, que não ando só." (Maria Bethânia).

**O espaço:** casa na Vila Mariana com jardim pensado como um canto de quintal e praia, com cortinas claras, plantas e mesas ao ar livre. A porta de aço turquesa com o logo pintado é a marca registrada da fachada.

**Não sabemos e não devem ser inventados:** preços do almoço e dos pratos do dia a dia, horários de jantar fixos, funcionamento aos sábados, domingos e segundas, número de lugares e delivery. Onde isso faria falta, escreva "Consulte pelo WhatsApp" e centralize esses dados num arquivo de configuração (veja a seção 7) com `TODO` para confirmar.

## 4. Imagens disponíveis (`assets/`)

| Arquivo | O que é | Onde usar |
|---|---|---|
| `fotos/porta-turquesa-logo.jpg` | Porta de aço turquesa com o logo e "Cozinha de encontros" pintados, à noite | Hero ou seção "Visite" |
| `fotos/fachada-com-clientes.jpg` | Fachada com placa redonda do Kangaça e pessoas nas mesas sob as plantas | Hero (alternativa) ou "A casa". Resolução baixa (469×600): use em tamanho médio ou com overlay |
| `fotos/jardim-cortinas.jpg` | Jardim com cortinas claras, samambaias e mesas | "A casa" |
| `fotos/jardim-quintal.jpg` | Jardim com mesinhas brancas, plantas penduradas e piso de tijolo | "A casa" |
| `fotos/bia-souza.jpg` | Bia sorrindo, de lenço e avental colorido, segurando um peixe | Seção da Bia. Resolução baixa (295×610): use num quadro vertical médio |
| `pratos/goxinha.jpg` e `goxinha-close.jpg` | Goxinhas sobre nori com catchup de missô e maionese de wasabi | Cardápio |
| `pratos/creme-de-arroz-khao-niao-mamuang.jpg` | Creme de arroz com manga e coco numa cumbuca de coco, com samambaias atrás | Cardápio (foto muito forte, boa para destaque) |
| `pratos/gravlax-salmao-curado.jpg` | Close do salmão curado sendo fatiado | Cardápio |
| `pratos/prato-do-dia-frango.jpg` | Frango assado com arroz e legumes num prato dourado | Almoço executivo |
| `pratos/almoco-executivo.jpg` | Prato do almoço com arroz | Almoço executivo (secundária) |
| `pratos/evento-buffet-finger-food.jpg` | Equipe montando mesa de finger foods num evento | Eventos |
| `pratos/menu-mar-e-terra.jpg` | Arte do menu especial Mar e Terra | Jantares especiais (como exemplo de menu temático) |
| `pratos/avaliacao-google-card.jpg` | Arte do Instagram com a avaliação do Google | Só como referência; recrie o depoimento em HTML, não use a arte |
| `instagram-baixa-resolucao/*` | Recortes pequenos (cerca de 240 px) do feed: buffet no jardim, mesa de evento, sobremesa no coco, preparo no balcão turquesa, salão | Só em mosaicos pequenos, tipo uma faixa "Siga @kangacacozinha" |
| `logo/*` | Logo e assinatura (ver seção 2) | Header, hero, rodapé |

Regras para as imagens: várias são recortes de prints do Instagram e têm resolução baixa. Nunca as estique além do tamanho original em telas grandes (use `max-width`, molduras, mosaicos ou overlays de cor). Escreva textos alternativos descritivos em português. Deixe um comentário no código indicando quais imagens devem ser trocadas por fotos profissionais quando houver.

## 5. Estrutura do site

Uma landing page principal (`/`) com âncoras, mais `/politica-de-privacidade` e a 404.

1. **Header fixo:** logo à esquerda, links (A casa, Cardápio, Almoço, Eventos, Bia, Visite) e o botão "Reservar" (WhatsApp) à direita. Fica transparente sobre o hero e ganha fundo turquesa-profundo com blur ao rolar. No celular, um menu hambúrguer em tela cheia com animação.
2. **Hero (primeira dobra):** imagem de fundo (porta turquesa ou fachada) com overlay turquesa, logo grande, a assinatura "Cozinha de encontros" e um título que fale com quem chega do anúncio, como **"Brasil, África e Ásia no mesmo prato, na Vila Mariana"**. Abaixo, "Cozinha afro-brasileira com umami asiático. Almoço executivo de terça a sexta, jantares sob reserva e eventos." Dois CTAs: **"Reservar pelo WhatsApp"** (principal, terracota) e **"Orçar um evento"** (secundário, contorno bege). O CTA precisa estar visível sem rolar, em 360 px de largura.
3. **Faixa de ingredientes (marquee):** texto correndo em loop com os três círculos como separador: arroz · dendê · gohan · missô · coco · manga · coentro · pernil · tamarindo · azeites da casa · conservas.
4. **O conceito, "Cozinha de encontros":** os três círculos se desenham e se aproximam com a rolagem, cada um ganhando um rótulo (Brasil, África, Ásia) e uma frase curta. Em seguida, o texto do conceito e as três cores com o significado de cada uma (turquesa = os mares, bege = a terra à vista, terracota = o fogo e a ancestralidade).
5. **Cardápio, "Pratos que contam travessias":** cards grandes com foto, nome, descrição e a "rota" do prato (ex.: Goxinha · Brasil × Japão). Goxinha, Gravlax na focaccia, Creme de arroz (Khao Niao Mamuang) e Prato do dia. No desktop, pode ser uma galeria horizontal presa (pin) com ScrollTrigger; no celular, uma lista vertical normal. Termine com "Cardápio do dia e preços pelo WhatsApp" e um CTA.
6. **Almoço executivo:** destaque de horário (terça a sexta, 11h30–15h) e o que inclui (entrada, prato, sobremesa e suco cozido). CTA "Chamar no WhatsApp" com mensagem pronta para o almoço.
7. **Jantares especiais:** texto sobre menus temáticos sob reserva, usando o Mar e Terra como exemplo real (com a arte ou um resumo em HTML) e convite para acompanhar as datas no Instagram. CTA "Reservar um jantar".
8. **Eventos e buffet:** "O Kangaça cozinha no seu evento, ou seu evento acontece aqui em casa." Lista com ícones: cardápio personalizado, drinks e bebidas, montagem da mesa, produção e serviço. Foto do evento. Logo abaixo, um **formulário de orçamento que monta a mensagem do WhatsApp** (sem backend): nome, tipo de evento (aniversário, corporativo, casamento, outro), data, número de convidados, na casa ou no local do cliente, e observações. Ao enviar, valide os campos e abra o `wa.me` com o texto formatado.
9. **A casa:** fotos do jardim e da fachada em composição assimétrica com parallax suave. Texto sobre o jardim como canto de quintal e praia.
10. **Bia Souza:** foto da Bia, o texto dela e a citação da Maria Bethânia em destaque, com a assinatura manuscrita.
11. **Depoimento:** a avaliação 5 estrelas do Google em tipografia grande, com estrelas animadas, e um botão discreto "Ver no Google" (link `#` com `TODO`).
12. **Instagram:** mosaico pequeno com as imagens de `instagram-baixa-resolucao/` e o botão "Siga @kangacacozinha".
13. **Visite:** endereço, horários (almoço ter–sex 11h30–15h; jantares e eventos sob reserva; demais dias "Consulte pelo WhatsApp"), mapa do Google Maps em iframe carregado só quando entra na tela (`loading="lazy"`), e botões "Como chegar" (link do Google Maps) e "Chamar no WhatsApp".
14. **Rodapé:** logo, assinatura, endereço, WhatsApp, Instagram, link para a política de privacidade e "Tradição em movimento".
15. **Botão flutuante do WhatsApp:** fixo no canto inferior direito, com um pulso sutil a cada poucos segundos. No celular, troque por uma **barra fixa no rodapé** com dois botões: "Reservar" e "Eventos". Ela aparece depois do hero e some quando o rodapé entra na tela.

## 6. Links do WhatsApp

Crie um helper `whatsappLink(motivo)` que gere `https://wa.me/5511912082104?text=...` com `encodeURIComponent`, e use em todos os CTAs:

- reserva: "Olá, Kangaça! Vim pelo site e gostaria de reservar uma mesa."
- almoço: "Olá, Kangaça! Vim pelo site e queria saber o cardápio do almoço de hoje."
- jantar: "Olá, Kangaça! Vim pelo site e quero saber dos próximos jantares especiais."
- evento: mensagem montada pelo formulário, começando com "Olá, Kangaça! Vim pelo site e quero um orçamento de evento:" seguida dos campos.
- geral: "Olá, Kangaça! Vim pelo site."

Todos os links abrem em nova aba com `rel="noopener"`. Cada CTA leva um atributo `data-cta="reserva|almoco|jantar|evento|geral"` e `data-local="hero|cardapio|flutuante|..."` para o rastreamento.

## 7. Configuração central

Crie `src/config/site.ts` com tudo que pode mudar: número do WhatsApp, mensagens, endereço, link do Google Maps, horários, Instagram, domínio, IDs de rastreamento e os `TODO`s de informações a confirmar. Nenhum desses dados deve ficar repetido no meio dos componentes.

## 8. Google Ads, rastreamento e LGPD

- Instale o **gtag.js** com IDs vindos do config: `GOOGLE_ADS_ID = 'AW-XXXXXXXXXX'`, `GOOGLE_ADS_CONVERSION_LABEL = 'XXXXXXXXXXX'` e `GA4_ID = 'G-XXXXXXXXXX'`, todos marcados com `TODO`. Se os IDs ainda estiverem com X, o script não deve carregar.
- **Conversão:** todo clique em link do WhatsApp dispara `gtag('event', 'conversion', { send_to: 'AW-.../label' })` e um evento GA4 `whatsapp_click` com os parâmetros `cta` e `local`. Use `transport_type: 'beacon'` para não perder o evento quando a nova aba abre. O envio do formulário de eventos dispara também `generate_lead`.
- **Consentimento (LGPD):** banner de cookies discreto e no estilo da marca, com "Aceitar" e "Recusar", e **Google Consent Mode v2**: padrão `denied` para `ad_storage`, `ad_user_data`, `ad_personalization` e `analytics_storage`, atualizado para `granted` quando a pessoa aceitar. Guarde a escolha em `localStorage`.
- **Página `/politica-de-privacidade`:** texto simples explicando o uso de cookies de medição e anúncios, o contato pelo WhatsApp e os direitos do titular segundo a LGPD. Marque com `TODO` para revisão.
- **Qualidade da página de destino:** a mensagem do hero conversa com anúncios de "restaurante na Vila Mariana", "almoço executivo Vila Mariana", "buffet para eventos em São Paulo" e "comida afro-brasileira e asiática". Use esses termos de forma natural nos títulos e textos, sem encher.

## 9. SEO

- `<title>` e meta description em português, com Vila Mariana e São Paulo. Canonical, Open Graph e Twitter Card com uma imagem 1200×630 gerada a partir do logo sobre turquesa (`logo/kangaca-logo-sobre-turquesa.jpg`) ou da porta turquesa.
- JSON-LD `Restaurant` com nome, endereço, telefone, `servesCuisine` (afro-brasileira, asiática, autoral), `openingHoursSpecification` (só o almoço ter–sex 11:30–15:00), `sameAs` com o Instagram, `acceptsReservations: true` e `priceRange` com `TODO`.
- Favicon e ícones gerados a partir do símbolo dos três círculos ou do "K" do logo, em turquesa e bege, mais `site.webmanifest`.
- Estrutura semântica (um `h1`, seções com `h2`), `lang="pt-BR"`.

## 10. Animações (o diferencial do site)

As animações precisam ser bonitas, elegantes e ter a ver com o tema: travessia, mar, fogo e encontro. Nada de efeito gratuito ou que atrapalhe a leitura ou o clique.

- **Entrada da página:** um loader curto (no máximo cerca de 1 s, e só na primeira visita da sessão) em que os três círculos se desenham (stroke-dashoffset) e se juntam, e então o hero aparece.
- **Hero:** a imagem de fundo começa levemente ampliada e se ajusta (efeito Ken Burns lento). O logo e o título aparecem em sequência, linha a linha, com máscara. Ao rolar, parallax suave no fundo.
- **Ondas:** divisores de seção em SVG com uma ondulação lenta em turquesa, lembrando os mares e as travessias.
- **Textos:** títulos revelados por linha ou por palavra quando entram na tela (SplitText do GSAP ou divisão manual), com stagger curto.
- **Imagens:** revelação com `clip-path` (como uma cortina abrindo, que conversa com as cortinas do jardim) e leve zoom de saída. Cards de prato com hover que aproxima a foto e mostra a "rota" do prato.
- **Três círculos:** na seção do conceito, os círculos se aproximam conforme a rolagem (scrub) até formar o símbolo.
- **Marquee:** a faixa de ingredientes acelera um pouco e inverte o sentido conforme a direção da rolagem.
- **Microinterações:** botões com efeito magnético leve no desktop, ícone do WhatsApp com pulso, estrelas do depoimento acendendo uma a uma.
- **Desempenho e acessibilidade:** anime só `transform` e `opacity` (e `clip-path` com moderação). Respeite `prefers-reduced-motion` desativando loader, parallax, Lenis e scrub, e mostrando tudo estático. Nenhum conteúdo pode ficar invisível se o JavaScript falhar (use uma classe `js` no `<html>` antes de esconder elementos para animar). Não use animações que causem layout shift.

## 11. Critérios de aceite

- Mobile first, perfeito em 360 px, 768 px, 1280 px e 1920 px, sem rolagem horizontal.
- Lighthouse no celular (build de produção): Performance 90+, Acessibilidade 95+, Boas práticas 95+, SEO 100. LCP abaixo de 2,5 s e CLS abaixo de 0,1.
- Todos os CTAs abrem o WhatsApp com a mensagem certa, e o formulário de eventos monta a mensagem corretamente.
- O gtag só carrega com IDs reais, o Consent Mode começa negado e a conversão dispara no clique.
- `npm run build` roda sem erros e o `dist/` funciona servido estaticamente (teste com `npx wrangler pages dev dist` ou `npx serve dist`).
- Navegação por teclado, foco visível, contraste AA e textos alternativos em todas as imagens.
- No fim, rode o build, abra o site localmente, tire screenshots no celular e no desktop (pode usar Playwright) e me mostre um resumo: o que foi feito, a lista de `TODO`s para eu confirmar (IDs do Google Ads, domínio, preços, horários de jantar, link do Google) e os passos para publicar no Cloudflare Pages.
