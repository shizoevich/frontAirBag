/**
 * Вырезание светлого мраморного фона у фотографий товаров для баннера главной.
 *
 * Вход  — JPEG со склада (светлый серый мрамор, объект тёмный),
 * выход — PNG с прозрачностью в public/banner/cut/.
 *
 * Запуск:  node scripts/cut-banner-images.mjs [--sheet]
 *   --sheet  дополнительно собрать контактный лист вырезок на фирменном оранжевом,
 *            чтобы глазами проверить отсутствие серых ореолов.
 *
 * Источники перечислены в SOURCES: файл в scripts/banner-src/ -> имя вырезки.
 * Скачать исходники: node scripts/cut-banner-images.mjs --fetch
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC_DIR = path.join(ROOT, 'scripts/banner-src');
const OUT_DIR = path.join(ROOT, 'public/banner/cut');

// id товара в API -> имя файла вырезки. Светлые товары на светлом мраморе
// (парашюты, металлические пиропатроны) сюда не берём — автовырезка их съедает.
const SOURCES = [
  { id: 370, name: 'airbag-mitsubishi' },
  { id: 376, name: 'airbag-nissan' },
  { id: 562, name: 'belt-bmw-m' },
  { id: 350, name: 'airbag-audi' },
  { id: 663, name: 'pyro-l-shaped' },
  { id: 613, name: 'pyro-modules' },
  { id: 571, name: 'belt-bmw-m-narrow' },
  { id: 586, name: 'airbag-chevrolet' },
  { id: 665, name: 'knee-honda' },
];

const API = 'https://api.airbagad.com/api/v2/goods/';
const MAX_SIDE = 900;
const OUT_SIDE = 600;

const lum = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;

async function fetchSources() {
  fs.mkdirSync(SRC_DIR, { recursive: true });
  const goods = [];
  for (let offset = 0; ; offset += 100) {
    const res = await fetch(`${API}?limit=100&offset=${offset}`);
    const page = await res.json();
    goods.push(...page.results);
    if (!page.next) break;
  }
  for (const { id, name } of SOURCES) {
    const product = goods.find((g) => g.id === id);
    if (!product?.images?.length) throw new Error(`нет изображения у товара ${id}`);
    const buf = Buffer.from(await (await fetch(product.images[0])).arrayBuffer());
    fs.writeFileSync(path.join(SRC_DIR, `${name}.jpg`), buf);
    console.log(`скачано ${name}.jpg  (${product.title})`);
  }
}

/**
 * Маска фона: заливка от границы + две волны релаксации.
 * Возвращает Uint8Array, 1 = фон.
 */
function backgroundMask(data, w, h) {
  const px = w * h;
  const L = new Float32Array(px);
  const sat = new Float32Array(px);
  for (let i = 0; i < px; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    L[i] = lum(r, g, b);
    sat[i] = Math.max(r, g, b) - Math.min(r, g, b);
  }

  // Порог по медианной яркости рамки.
  const border = [];
  for (let x = 0; x < w; x++) { border.push(L[x], L[(h - 1) * w + x]); }
  for (let y = 0; y < h; y++) { border.push(L[y * w], L[y * w + w - 1]); }
  border.sort((a, b) => a - b);
  const med = border[border.length >> 1];
  const T = Math.max(110, med - 52);

  const bg = new Uint8Array(px);
  const stack = [];
  const push = (i) => {
    if (bg[i] || L[i] < T || sat[i] >= 48) return;
    bg[i] = 1;
    stack.push(i);
  };
  for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); }
  while (stack.length) {
    const i = stack.pop();
    const x = i % w, y = (i / w) | 0;
    if (x > 0) push(i - 1);
    if (x < w - 1) push(i + 1);
    if (y > 0) push(i - w);
    if (y < h - 1) push(i + w);
  }

  // Релаксация: дотягиваем полутени вокруг уже найденного фона.
  const relax = (passes, dL, maxSat) => {
    for (let p = 0; p < passes; p++) {
      let changed = 0;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = y * w + x;
          if (bg[i] || L[i] < T - dL || sat[i] >= maxSat) continue;
          const near =
            (x > 0 && bg[i - 1]) || (x < w - 1 && bg[i + 1]) ||
            (y > 0 && bg[i - w]) || (y < h - 1 && bg[i + w]);
          if (near) { bg[i] = 1; changed++; }
        }
      }
      if (!changed) break;
    }
  };
  relax(14, 30, 30);
  relax(26, 75, 20); // съедает серую тень под деталью

  return bg;
}

/** Мелкие «острова» переднего плана (< 0.4% площади) считаем фоном. */
function dropSmallIslands(bg, w, h) {
  const px = w * h;
  const minArea = px * 0.004;
  const seen = new Uint8Array(px);
  for (let start = 0; start < px; start++) {
    if (bg[start] || seen[start]) continue;
    const comp = [start];
    seen[start] = 1;
    for (let k = 0; k < comp.length; k++) {
      const i = comp[k];
      const x = i % w, y = (i / w) | 0;
      const step = (j) => { if (!bg[j] && !seen[j]) { seen[j] = 1; comp.push(j); } };
      if (x > 0) step(i - 1);
      if (x < w - 1) step(i + 1);
      if (y > 0) step(i - w);
      if (y < h - 1) step(i + w);
    }
    if (comp.length < minArea) for (const i of comp) bg[i] = 1;
  }
}

/** Боксовый блюр радиуса r по альфе + кривая alpha * 1.18 - 24. */
function smoothAlpha(alpha, w, h, r = 2) {
  const tmp = new Float32Array(w * h);
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0, n = 0;
      for (let dx = -r; dx <= r; dx++) {
        const nx = x + dx;
        if (nx < 0 || nx >= w) continue;
        sum += alpha[y * w + nx]; n++;
      }
      tmp[y * w + x] = sum / n;
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0, n = 0;
      for (let dy = -r; dy <= r; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= h) continue;
        sum += tmp[ny * w + x]; n++;
      }
      out[y * w + x] = Math.min(255, Math.max(0, (sum / n) * 1.18 - 24));
    }
  }
  return out;
}

async function cut(name) {
  const src = path.join(SRC_DIR, `${name}.jpg`);
  const base = sharp(src).resize({
    width: MAX_SIDE, height: MAX_SIDE, fit: 'inside', withoutEnlargement: true,
  });
  const { data, info } = await base.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;

  const bg = backgroundMask(data, w, h);
  dropSmallIslands(bg, w, h);

  const alpha = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) alpha[i] = bg[i] ? 0 : 255;
  const soft = smoothAlpha(alpha, w, h);

  const out = Buffer.from(data);
  for (let i = 0; i < w * h; i++) out[i * 4 + 3] = Math.round(soft[i]);

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const dst = path.join(OUT_DIR, `${name}.png`);
  await sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .trim({ threshold: 1 }) // обрезаем прозрачные поля, чтобы позиционировать по самой детали
    // В баннере деталь не шире ~300 CSS-px, 600px хватает и для 2x-экранов.
    .resize({ width: OUT_SIDE, height: OUT_SIDE, fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true, quality: 82 })
    .toFile(dst);

  const meta = await sharp(dst).metadata();
  console.log(`${name}.png — ${meta.width}x${meta.height}`);
}

/** Контактный лист вырезок на фирменном оранжевом — визуальная приёмка. */
async function contactSheet() {
  const cell = 300;
  const files = SOURCES.map((s) => path.join(OUT_DIR, `${s.name}.png`));
  const cols = 3;
  const rows = Math.ceil(files.length / cols);
  const layers = [];
  for (const [i, file] of files.entries()) {
    const buf = await sharp(file)
      .resize({ width: cell - 20, height: cell - 20, fit: 'inside' })
      .toBuffer();
    const { width, height } = await sharp(buf).metadata();
    layers.push({
      input: buf,
      left: (i % cols) * cell + ((cell - width) >> 1),
      top: Math.floor(i / cols) * cell + ((cell - height) >> 1),
    });
  }
  const sheet = path.join(SRC_DIR, '_contact-sheet.png');
  await sharp({
    create: {
      width: cols * cell, height: rows * cell, channels: 4,
      background: { r: 0xe0, g: 0x79, b: 0x3c, alpha: 1 },
    },
  }).composite(layers).png().toFile(sheet);
  console.log(`контактный лист: ${sheet}`);
}

const args = process.argv.slice(2);
if (args.includes('--fetch')) await fetchSources();
for (const { name } of SOURCES) await cut(name);
if (args.includes('--sheet')) await contactSheet();
