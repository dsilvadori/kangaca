// Gera favicons e a imagem de compartilhamento em public/. Rode com `npm run icons`.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

// O K do logo, vetorizado a partir de logo/kangaca-logo-sobre-turquesa.jpg.
const icone = readFileSync('src/assets/logo/favicon-k.svg', 'utf8');

mkdirSync('public/icons', { recursive: true });
writeFileSync('public/favicon.svg', icone);

for (const [nome, tamanho] of [
  ['icons/favicon-32.png', 32],
  ['icons/apple-touch-icon.png', 180],
  ['icons/icon-192.png', 192],
  ['icons/icon-512.png', 512],
]) {
  await sharp(Buffer.from(icone), { density: 400 }).resize(tamanho, tamanho).png().toFile(`public/${nome}`);
}

// favicon.ico: um PNG de 32 px dentro do contêiner ICO.
const png = await sharp(Buffer.from(icone), { density: 400 }).resize(32, 32).png().toBuffer();
const cabecalho = Buffer.alloc(22);
cabecalho.writeUInt16LE(1, 2); // tipo: ícone
cabecalho.writeUInt16LE(1, 4); // uma imagem
cabecalho.writeUInt8(32, 6);
cabecalho.writeUInt8(32, 7);
cabecalho.writeUInt16LE(1, 10);
cabecalho.writeUInt16LE(32, 12);
cabecalho.writeUInt32LE(png.length, 14);
cabecalho.writeUInt32LE(22, 18);
writeFileSync('public/favicon.ico', Buffer.concat([cabecalho, png]));

copyFileSync('src/assets/logo/kangaca-logo-bege.png', 'public/icons/logo-kangaca.png');

// Recorte central 1200×630 do logo sobre turquesa.
await sharp('src/assets/logo/kangaca-logo-sobre-turquesa.jpg')
  .extract({ left: 0, top: 342, width: 1440, height: 756 })
  .resize(1200, 630)
  .jpeg({ quality: 85 })
  .toFile('public/og-image.jpg');
