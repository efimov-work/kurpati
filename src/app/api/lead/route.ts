import { NextResponse } from 'next/server';
import { allow, notifyOwner, oneLine, readBody, recordLead, validPhone } from '@/lib/server/lead';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    if (process.env.LEADS_ENABLED !== '1') return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503 });
    const origin = request.headers.get('origin');
    let expected: string;
    try { expected = new URL(process.env.NEXT_PUBLIC_SITE_URL || request.url).origin; }
    catch { return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503 }); }
    if (origin && origin !== expected) return NextResponse.json({ ok: false, error: 'bad_origin' }, { status: 403 });
    let body: unknown;
    try { body = await readBody(request); }
    catch (error) { return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'bad_json' }, { status: error instanceof Error && error.message === 'too_large' ? 413 : 400 }); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ ok: false, error: 'bad_fields' }, { status: 400 });
    const fields = body as Record<string, unknown>;
    if (oneLine(fields.website, 100)) return NextResponse.json({ ok: true });
    if (fields.kind !== 'callback' || typeof fields.name !== 'string' || !fields.name.trim() || fields.name.trim().length > 80 || !validPhone(fields.phone) || fields.consent !== true) return NextResponse.json({ ok: false, error: 'bad_fields' }, { status: 400 });
    if (!allow(fields.phone.replace(/\D/g, ''))) return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
    try {
        const utm = fields.utm && typeof fields.utm === 'object' && !Array.isArray(fields.utm) ? Object.fromEntries(Object.entries(fields.utm).filter(([key]) => /^utm_(source|medium|campaign|content|term)$/.test(key)).map(([key, value]) => [key, oneLine(value, 160)])) : {};
        const lead = await recordLead({ kind: 'callback', name: oneLine(fields.name, 80), phone: oneLine(fields.phone, 25), consent: true, interest: oneLine(fields.interest, 200), source: oneLine(fields.source, 300), utm });
        const notified = await notifyOwner(lead);
        return NextResponse.json({ ok: true, id: lead.id, notification: notified ? 'sent' : 'stored' }, { status: 202 });
    } catch { return NextResponse.json({ ok: false, error: 'storage_unavailable' }, { status: 503 }); }
}
