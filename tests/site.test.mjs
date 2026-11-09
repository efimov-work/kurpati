import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { validPhone, oneLine, readBody, allow, recordLead } from '../src/lib/server/lead.ts';

test('callback phone accepts complete numbers and rejects malformed input', () => {
    for (const value of ['+7 (978) 123-45-67', '89781234567', '+442012345678']) assert.equal(validPhone(value), true);
    for (const value of ['', '12345', 'call me 89781234567', '+7abc9781234567', '1'.repeat(26), null]) assert.equal(validPhone(value), false);
});

test('lead parser enforces its byte limit for both declared and streamed bodies', async () => {
    await assert.rejects(readBody(new Request('https://example.com', { method: 'POST', headers: { 'Content-Length': '20000' }, body: '{}' })), /too_large/);
    await assert.rejects(readBody(new Request('https://example.com', { method: 'POST', body: 'x'.repeat(17000) })), /too_large/);
    await assert.rejects(readBody(new Request('https://example.com', { method: 'POST', body: '{broken' })), SyntaxError);
    assert.deepEqual(await readBody(new Request('https://example.com', { method: 'POST', body: '{"kind":"callback"}' })), { kind: 'callback' });
});

test('stored callback has an identifier and timestamp without altering the source payload', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'kurpati-lead-'));
    const previous = process.env.LEADS_DATA_DIR;
    process.env.LEADS_DATA_DIR = directory;
    try {
        const source = { kind: 'callback', name: 'Тест', phone: '+79780000000', consent: true };
        const stored = await recordLead(source);
        assert.ok(stored.id && stored.at);
        assert.equal(source.id, undefined);
        const row = JSON.parse((await readFile(path.join(directory, 'callbacks.jsonl'), 'utf8')).trim());
        assert.equal(row.kind, 'callback');
        assert.equal(row.name, 'Тест');
        assert.equal(row.consent, true);
    } finally {
        if (previous === undefined) delete process.env.LEADS_DATA_DIR;
        else process.env.LEADS_DATA_DIR = previous;
        await rm(directory, { recursive: true, force: true });
    }
});

test('repeated callback requests are limited per phone', () => {
    const phone = `test-${Date.now()}`;
    assert.equal(allow(phone), true);
    assert.equal(allow(phone), true);
    assert.equal(allow(phone), true);
    assert.equal(allow(phone), false);
    assert.equal(allow(`${phone}-other`), true);
});

test('notification fields remove control characters and enforce bounds', () => {
    assert.equal(oneLine(' A\nB\u0000C ', 80), 'A B C');
    assert.equal(oneLine('x'.repeat(100), 80).length, 80);
    assert.equal(oneLine({ bad: 'value' }, 80), '');
});

test('media registry contains real sources and existing local files', async () => {
    const records = JSON.parse(await readFile(new URL('../src/lib/media.json', import.meta.url), 'utf8'));
    for (const record of records) {
        assert.match(record.source, /^https:\/\//);
        assert.ok((await readFile(new URL(`../public${record.image}`, import.meta.url))).length > 1000);
    }
});
