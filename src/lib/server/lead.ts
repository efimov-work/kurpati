import { randomUUID } from 'node:crypto';
import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const buckets = new Map<string, number[]>();

export function validPhone(value: unknown): value is string {
    return typeof value === 'string' && value.length <= 25 && /^\+?[\d\s().-]+$/.test(value) && /^\d{10,15}$/.test(value.replace(/\D/g, ''));
}

export function oneLine(value: unknown, limit: number): string {
    return typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]+/g, ' ').trim().slice(0, limit) : '';
}

export function allow(phone: string): boolean {
    const now = Date.now();
    if (buckets.size > 5000) for (const [key, hits] of buckets) if (!hits.some(hit => now - hit < 3600000)) buckets.delete(key);
    if (buckets.size >= 10000 && !buckets.has(phone)) return false;
    const hits = (buckets.get(phone) || []).filter(hit => now - hit < 3600000);
    if (hits.length >= 3) return false;
    buckets.set(phone, [...hits, now]);
    return true;
}

export async function readBody(request: Request): Promise<unknown> {
    if (Number(request.headers.get('content-length')) > 16384) throw new Error('too_large');
    const reader = request.body?.getReader();
    if (!reader) throw new Error('bad_json');
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
        for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            size += value.byteLength;
            if (size > 16384) { await reader.cancel(); throw new Error('too_large'); }
            chunks.push(value);
        }
        return JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } finally { reader.releaseLock(); }
}

export async function recordLead(data: Record<string, unknown>) {
    const lead = { id: randomUUID(), at: new Date().toISOString(), ...data };
    const directory = path.resolve(process.env.LEADS_DATA_DIR || '.data');
    await mkdir(directory, { recursive: true, mode: 0o700 });
    await appendFile(path.join(directory, 'callbacks.jsonl'), `${JSON.stringify(lead)}\n`, { mode: 0o600 });
    return lead;
}

export async function notifyOwner(lead: Record<string, unknown>): Promise<boolean> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chat = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chat) return false;
    try {
        const result = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chat, message_thread_id: process.env.TELEGRAM_THREAD_ID ? Number(process.env.TELEGRAM_THREAD_ID) : undefined, text: ['Заявка на обратный звонок: Курпаты', `Имя: ${lead.name}`, `Телефон: ${lead.phone}`, `Запрос: ${lead.interest}`, `Номер заявки: ${lead.id}`].join('\n') }),
            signal: AbortSignal.timeout(8000)
        });
        const body = await result.json();
        return result.ok && body.ok === true;
    } catch { return false; }
}
