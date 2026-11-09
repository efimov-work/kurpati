import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const directory = path.join(root, 'out');
const prefix = '/kurpati';
const checks = [];
function check(value, label) { assert.ok(value, label); checks.push(label); }
const server = createServer(async (request, response) => {
    try {
        const url = new URL(request.url, 'http://localhost');
        if (!url.pathname.startsWith(`${prefix}/`)) throw new Error('Outside prefix');
        let file = path.resolve(directory, `.${decodeURIComponent(url.pathname.slice(prefix.length))}`);
        if (file !== directory && !file.startsWith(`${directory}${path.sep}`)) throw new Error('Outside directory');
        if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
        response.end(await readFile(file));
    } catch { response.writeHead(404).end(); }
});

try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const origin = `http://127.0.0.1:${server.address().port}`;
    const response = await fetch(`${origin}${prefix}/`);
    check(response.ok, 'project path serves index');
    const html = await response.text();
    check(html.includes('https://efimov-work.github.io/kurpati/'), 'project canonical is included');
    check(!/(?:src|href)="\/(?:_next|assets)\//.test(html), 'assets include project prefix');
    const resources = [...new Set([...html.matchAll(/(?:src|href)="(\/kurpati\/[^"?#]+)(?:[?#][^"]*)?"/g)].map(match => match[1]))];
    check(resources.length > 10, 'page references compiled assets');
    const results = await Promise.all(resources.map(async resource => ({ resource, status: (await fetch(`${origin}${resource}`)).status })));
    check(results.every(result => result.status === 200), `all ${results.length} referenced resources resolve`);
    for (const file of ['sitemap.xml', 'robots.txt', 'manifest.webmanifest', 'privacy/', 'materials/', 'assets/images/og.webp']) {
        check((await fetch(`${origin}${prefix}/${file}`)).ok, `${file} resolves`);
    }
    const sitemap = await (await fetch(`${origin}${prefix}/sitemap.xml`)).text();
    check(sitemap.includes('https://efimov-work.github.io/kurpati/'), 'sitemap uses project origin and path');
    check(html.includes('Отправка заявок пока не подключена'), 'static form shows demo status');
    check((await fetch(`${origin}${prefix}/api/lead`)).status === 404, 'static site has no server callback endpoint');
    await stat(path.join(directory, '.nojekyll'));
    check(true, 'Jekyll processing disabled');
    await mkdir(path.join(root, 'artifacts'), { recursive: true });
    await writeFile(path.join(root, 'artifacts/export-qa.json'), JSON.stringify({ passed: true, prefix, checks }, null, 2));
    console.log(JSON.stringify({ passed: true, checks: checks.length, assets: resources.length }));
} finally { await new Promise(resolve => server.close(resolve)); }
