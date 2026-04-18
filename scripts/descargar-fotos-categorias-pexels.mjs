/**
 * Descarga una foto real por categoría (Pexels API) y la guarda como PNG cuadrado en public/categorias/{CLAVE}.png
 *
 * Requisitos:
 *   cd scripts && npm install
 *   Crear scripts/.env con: PEXELS_API_KEY=tu_api_key  (gratis en https://www.pexels.com/api/)
 *
 * Uso:
 *   cd scripts
 *   node descargar-fotos-categorias-pexels.mjs
 *
 * Licencia Pexels: uso gratuito; conviene atribuir a los fotógrafos (este script escribe ATRIBUCION-PEXELS.txt).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'categorias');
const QUERIES_PATH = path.join(__dirname, 'categoria-fotos-queries.json');
const ATTRIB_PATH = path.join(OUT_DIR, 'ATRIBUCION-PEXELS.txt');

function loadDotEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, 'utf8');
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!process.env[k]) process.env[k] = v;
  }
}

loadDotEnv();

const API_KEY = process.env.PEXELS_API_KEY;
if (!API_KEY) {
  console.error('Falta PEXELS_API_KEY. Creá scripts/.env con una línea: PEXELS_API_KEY=tu_clave');
  process.exit(1);
}

const queries = JSON.parse(fs.readFileSync(QUERIES_PATH, 'utf8'));
const SIZE = 512;

async function pexelsSearch(query) {
  const u = new URL('https://api.pexels.com/v1/search');
  u.searchParams.set('query', query);
  u.searchParams.set('per_page', '1');
  const res = await fetch(u, { headers: { Authorization: API_KEY } });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Pexels ${res.status}: ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  const p = data.photos?.[0];
  if (!p) throw new Error('Sin resultados');
  const url = p.src?.large2x || p.src?.large || p.src?.medium;
  if (!url) throw new Error('URL de imagen vacía');
  return {
    url,
    photographer: p.photographer,
    photographerUrl: p.photographer_url,
    pexelsPage: p.url,
  };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

fs.mkdirSync(OUT_DIR, { recursive: true });
const attributions = [];

for (const [clave, query] of Object.entries(queries)) {
  try {
    console.log(`→ ${clave}: "${query}"`);
    const meta = await pexelsSearch(query);
    const imgRes = await fetch(meta.url);
    if (!imgRes.ok) throw new Error(`Descarga ${imgRes.status}`);
    const buf = Buffer.from(await imgRes.arrayBuffer());
    const outFile = path.join(OUT_DIR, `${clave}.png`);
    await sharp(buf)
      .resize(SIZE, SIZE, { fit: 'cover', position: 'attention' })
      .png({ quality: 90, compressionLevel: 8 })
      .toFile(outFile);
    attributions.push(
      `${clave}.png — ${meta.photographer} — ${meta.pexelsPage} — ${meta.photographerUrl}`
    );
    console.log(`  OK ${outFile}`);
  } catch (e) {
    console.error(`  ERROR ${clave}:`, e.message || e);
  }
  await sleep(400);
}

const header =
  'Fotos vía Pexels (https://www.pexels.com/license/).\n' +
  'Atribución recomendada: enlazar al fotógrafo y/o a Pexels en créditos del sitio.\n\n';
fs.writeFileSync(ATTRIB_PATH, header + attributions.join('\n') + '\n', 'utf8');
console.log('\nListo. Revisá imágenes en public/categorias/ y el archivo ATRIBUCION-PEXELS.txt');
