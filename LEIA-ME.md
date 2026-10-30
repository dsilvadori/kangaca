# Kit do site Kangaça

1. Baixe o arquivo `kangaca-site-kit.zip` e descompacte numa pasta nova (ex.: `kangaca-site`).
2. Dentro dela ficam `PROMPT-CLAUDE-CODE.md` e a pasta `assets/` com logo, fotos e pratos.
3. Abra o Claude Code nessa pasta (`cd kangaca-site` e `claude`), copie todo o conteúdo do `PROMPT-CLAUDE-CODE.md` e cole como primeira mensagem.
4. Quando terminar, ele roda o build e mostra a lista de TODOs (IDs do Google Ads, domínio, preços, horários).
5. Para publicar: suba a pasta num repositório do GitHub e conecte no Cloudflare Pages (preset Astro, build `npm run build`, saída `dist`), ou rode `npx wrangler pages deploy dist`.

Observação: várias fotos vieram de prints do Instagram e têm resolução baixa. O prompt já orienta a não esticá-las, mas fotos originais ou profissionais vão deixar o site bem mais impactante. É só trocar os arquivos em `src/assets/` mantendo os nomes.
