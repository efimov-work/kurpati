import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MAP_HEIGHT, MAP_WIDTH, projectMap } from '../src/lib/map.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(await readFile(path.join(root, 'research/map/geometry.json'), 'utf8'));
const features = data.elements.map(feature => ({ ...feature, points: feature.geometry.map(point => projectMap(point.lat, point.lon)) }));
const visible = points => points.some(point => point.x > -100 && point.x < MAP_WIDTH + 100 && point.y > -100 && point.y < MAP_HEIGHT + 100);
const draw = points => points.map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join('');
const escape = value => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character]);
const length = points => points.slice(1).reduce((sum, point, index) => sum + Math.hypot(point.x - points[index].x, point.y - points[index].y), 0);
const paths = (items, close = false) => items.map(item => draw(item.points) + (close ? 'Z' : '')).join('');
const coast = features.filter(feature => feature.tags.natural === 'coastline').map(feature => ({ nodes: [...feature.nodes], points: [...feature.points] }));
let merged = true;
while (merged) {
    merged = false;
    for (let first = 0; first < coast.length && !merged; first++) {
        for (let second = 0; second < coast.length; second++) {
            if (first === second || coast[first].nodes.at(-1) !== coast[second].nodes[0]) continue;
            coast[first].nodes.push(...coast[second].nodes.slice(1));
            coast[first].points.push(...coast[second].points.slice(1));
            coast.splice(second, 1);
            merged = true;
            break;
        }
    }
}
const shoreline = coast.sort((first, second) => length(second.points) - length(first.points))[0]?.points;
if (!shoreline || length(shoreline) < 1200) throw new Error('Continuous coastline is missing');
if (shoreline[0].x > shoreline.at(-1).x) shoreline.reverse();
const roads = features.filter(feature => feature.tags.highway && visible(feature.points));
const major = roads.filter(feature => /^(primary|secondary|tertiary|trunk)(_link)?$/.test(feature.tags.highway));
const minor = roads.filter(feature => /^(residential|unclassified|living_street|pedestrian|service)$/.test(feature.tags.highway));
const trails = roads.filter(feature => /^(footway|path|steps|track)$/.test(feature.tags.highway));
const buildings = features.filter(feature => feature.tags.building && visible(feature.points));
const parks = features.filter(feature => (feature.tags.leisure === 'park' || /forest|orchard|vineyard/.test(feature.tags.landuse || '') || feature.tags.natural === 'wood') && visible(feature.points));
const rivers = features.filter(feature => /river|stream/.test(feature.tags.waterway || '') && visible(feature.points));
const names = new Map();
for (const road of major) {
    const name = road.tags['name:ru'] || road.tags.name;
    const points = road.points.filter(point => point.x > 80 && point.x < 1320 && point.y > 50 && point.y < 650);
    if (!name || points.length < 3 || length(points) < 180) continue;
    if (!names.has(name) || length(points) > length(names.get(name))) names.set(name, points);
}
const labels = [...names].slice(0, 9).map(([name, points], index) => {
    if (points[0].x > points.at(-1).x) points.reverse();
    return `<path id="road-${index}" d="${draw(points)}" fill="none" stroke="none"/><text font-size="12" fill="#78807b" text-anchor="middle" stroke="#f4f3ef" stroke-width="4" paint-order="stroke"><textPath href="#road-${index}" startOffset="50%">${escape(name.replace('улица ', 'ул. '))}</textPath></text>`;
}).join('');
const towns = [[44.4463, 34.1029, 'Гаспра'], [44.474, 34.1406, 'Ливадия'], [44.496, 34.165, 'Ялта']].map(([latitude, longitude, name]) => {
    const point = projectMap(latitude, longitude);
    return `<text x="${point.x.toFixed(1)}" y="${point.y.toFixed(1)}" fill="#6e7772" font-size="21" stroke="#f4f3ef" stroke-width="5" paint-order="stroke">${name}</text>`;
}).join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${MAP_WIDTH}" height="${MAP_HEIGHT}" viewBox="0 0 ${MAP_WIDTH} ${MAP_HEIGHT}"><title>Побережье от Гаспры до Ялты</title><desc>Авторское оформление реальных береговой линии, дорог, зданий и парков. Геоданные OpenStreetMap, загружены ${data.downloaded}. © OpenStreetMap contributors, ODbL 1.0. https://www.openstreetmap.org/copyright</desc><defs><clipPath id="frame"><path d="M0 0H1400V820H0Z"/></clipPath></defs><g clip-path="url(#frame)" font-family="Arial,sans-serif"><path fill="#efefeb" d="M0 0H1400V820H0Z"/><path fill="#e3e7de" d="${paths(parks, true)}"/><path fill="#8fadb4" d="${draw(shoreline)}L3000 2500H-2000Z"/><path stroke="#71969f" stroke-width="1.2" fill="none" d="${paths(coast)}"/><path stroke="#91afb3" stroke-width="1.2" fill="none" d="${paths(rivers)}"/><path fill="#d5d1ba" d="${paths(buildings, true)}"/><g fill="none" stroke-linejoin="round" stroke-linecap="round"><path stroke="#d0d3c7" stroke-width=".65" stroke-dasharray="2 3" d="${paths(trails)}"/><path stroke="#fffefa" stroke-width="2" d="${paths(minor)}"/><path stroke="#fdfcf8" stroke-width="6" d="${paths(major)}"/><path stroke="#b9bdb6" stroke-width="2.8" d="${paths(major)}"/></g>${labels}${towns}</g></svg>`;
const destination = path.join(root, 'public/assets/maps');
await mkdir(destination, { recursive: true });
await writeFile(path.join(destination, 'kurpati-coast.svg'), svg);
console.log(JSON.stringify({ buildings: buildings.length, roads: roads.length, coastline: shoreline.length, bytes: Buffer.byteLength(svg) }));
