import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { setTimeout as pause } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const directory = await mkdtemp(path.join(tmpdir(), 'kurpati-callback-qa-'));
const origin = 'http://127.0.0.1:3011';
const server = spawn(process.execPath, ['scripts/start.mjs'], { cwd: root, stdio: 'ignore', env: { ...process.env, PORT: '3011', KURPATI_HOST: '127.0.0.1', NEXT_PUBLIC_SITE_URL: origin, LEADS_ENABLED: '1', LEADS_DATA_DIR: directory, TELEGRAM_BOT_TOKEN: '', TELEGRAM_CHAT_ID: '', TELEGRAM_THREAD_ID: '' } });
const checks = [];
function check(value, label) { assert.ok(value, label); checks.push(label); }
const valid = { kind: 'callback', name: 'Тестовая заявка', phone: '+7 (978) 000-00-01', consent: true, website: '', interest: 'Проверка локального приёма', source: '/' };
async function submit(body, extra = {}) {
    return fetch(`${origin}/api/lead`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin, ...extra }, body: JSON.stringify(body) });
}
try {
    let ready = false;
    for (let attempt = 0; attempt < 80; attempt++) {
        try { if ((await fetch(origin)).ok) { ready = true; break; } }
        catch { await pause(150); }
    }
    check(ready, 'standalone server responds');
    check((await submit({ ...valid, kind: 'booking' })).status === 400, 'booking payload rejected');
    check((await submit({ ...valid, consent: false })).status === 400, 'consent required');
    check((await submit({ ...valid, phone: '123' })).status === 400, 'incomplete phone rejected');
    check((await submit(valid, { Origin: 'https://unrelated.example' })).status === 403, 'cross-origin post rejected');
    check((await submit({ ...valid, extra: 'x'.repeat(20000) })).status === 413, 'large request rejected');
    check((await submit({ ...valid, website: 'spam' })).status === 200, 'honeypot does not produce a lead');
    const response = await submit(valid);
    const result = await response.json();
    check(response.status === 202 && result.ok === true && result.id, 'callback accepted and identified');
    check(result.notification === 'stored', 'no external notification is sent without configured recipient');
    await submit(valid);
    await submit(valid);
    check((await submit(valid)).status === 429, 'repeated submissions rate limited');
    const records = (await readFile(path.join(directory, 'callbacks.jsonl'), 'utf8')).trim().split('\n').map(row => JSON.parse(row));
    check(records.length === 3 && records.every(row => row.kind === 'callback' && row.consent === true), 'only valid callbacks saved');
    await mkdir(path.join(root, 'artifacts'), { recursive: true });
    await writeFile(path.join(root, 'artifacts/lead-qa.json'), JSON.stringify({ passed: true, checks, external_delivery_tested: false }, null, 2));
    console.log(JSON.stringify({ passed: true, checks: checks.length, externalDelivery: 'not configured' }));
} finally {
    server.kill('SIGTERM');
    await pause(400);
    await rm(directory, { recursive: true, force: true });
}
