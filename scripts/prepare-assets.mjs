import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const library = JSON.parse(await readFile(path.join(root, 'research/data/media_manifest.json'), 'utf8'));
const sources = Object.fromEntries(library.map(item => [item.id, item]));
const selection = { hero: 'K678', 'hero-mobile': 'K681', place: 'K674', detail: 'K707', coast: 'K529', panorama: 'K799', atrium: 'K705', pool: 'K517', architecture: 'K676', overhead: 'K675', entrance: 'K685', 'room-standard': 'K026', 'room-suite': 'K735', sea: 'K798', contact: 'K677' };
const destination = path.join(root, 'public/assets/images');
await mkdir(destination, { recursive: true });
const credits = [];
for (const [name, id] of Object.entries(selection)) {
    const source = sources[id];
    const input = path.join(root, 'research', source.clean_file || source.file);
    const output = path.join(destination, `${name}.webp`);
    await sharp(input).rotate().resize({ width: name === 'hero-mobile' ? 1100 : 2100, withoutEnlargement: true }).webp({ quality: 86, effort: 5 }).toFile(output);
    const metadata = await sharp(output).metadata();
    credits.push({ name, id, image: `/assets/images/${name}.webp`, width: metadata.width, height: metadata.height, author: source.author || 'Автор на странице источника не указан', license: source.license || 'Требуется согласование использования', licenseUrl: source.license_url || '', source: source.source_pages[0], changes: source.caption_removed ? 'Удалена рекламная подпись сайта. Размер адаптирован для веба.' : 'Размер адаптирован для веба.', archive: true });
}
await sharp(path.join(destination, 'hero.webp')).resize(1200, 630, { fit: 'cover', position: 'centre' }).webp({ quality: 88 }).toFile(path.join(destination, 'og.webp'));
await copyFile(path.join(root, 'src/app/icon.svg'), path.join(root, 'public/assets/brand/icon.svg'));
await writeFile(path.join(root, 'src/lib/media.json'), JSON.stringify(credits, null, 2));
console.log(`Prepared ${credits.length} images and Open Graph image`);
