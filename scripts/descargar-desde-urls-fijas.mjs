/**
 * Descarga fotografías reales (URLs fijas Unsplash) y genera public/categorias/{CLAVE}.png
 * Sin API key. Ejecutar desde esta carpeta: node descargar-desde-urls-fijas.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const MAP_PATH = path.join(__dirname, 'categoria-fotos-urls-fijas.json');
const OUT_DIR = path.join(ROOT, 'public', 'categorias');
const ATTRIB = path.join(OUT_DIR, 'ATRIBUCION-UNSPLASH.txt');
const SIZE = 512;

const raw = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
const entries = Object.entries(raw).filter(([k]) => !k.startsWith('_'));

fs.mkdirSync(OUT_DIR, { recursive: true });
const lines = [
  'Fotografías desde Unsplash (https://unsplash.com/license).',
  'Se recomienda crédito a Unsplash y a los fotógrafos en el sitio.',
  'IDs de foto en el mapa: scripts/categoria-fotos-urls-fijas.json',
  '',
];

for (const [clave, url] of entries) {
  try {
    console.log(`→ ${clave}`);
    const res = await fetch(url, {
      headers: { 'User-Agent': 'SubastasCorp-category-icons/1.0' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const outFile = path.join(OUT_DIR, `${clave}.png`);
    await sharp(buf)
      .resize(SIZE, SIZE, { fit: 'cover', position: 'attention' })
      .png({ quality: 92, compressionLevel: 8 })
      .toFile(outFile);
    lines.push(`${clave}.png ← ${url.split('?')[0]}`);
    console.log(`  OK ${outFile}`);
  } catch (e) {
    console.error(`  ERROR ${clave}:`, e.message || e);
  }
}

fs.writeFileSync(ATTRIB, lines.join('\n') + '\n', 'utf8');
console.log('\nListo. PNG en public/categorias/ — revisá ATRIBUCION-UNSPLASH.txt');
