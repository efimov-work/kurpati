'use client';

import { useEffect, useRef, useState } from 'react';
import { asset } from '@/lib/asset';
import { CONTACT_PHONE, LEAD_ENDPOINT, LEADS_ENABLED } from '@/lib/content';
import Icon from './Icon';

type Status = 'idle' | 'sending' | 'success' | 'demo' | 'error';

export default function RequestDialog() {
    const dialog = useRef<HTMLDialogElement>(null);
    const trigger = useRef<HTMLElement | null>(null);
    const pending = useRef(false);
    const [interest, setInterest] = useState('Обратный звонок');
    const [status, setStatus] = useState<Status>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const element = dialog.current;
        const open = (event: MouseEvent) => {
            if (!(event.target instanceof Element)) return;
            const button = event.target.closest<HTMLElement>('[data-request]');
            if (!button || !element) return;
            trigger.current = button;
            setInterest(button.dataset.request || 'Обратный звонок');
            setStatus('idle');
            setMessage('');
            element.showModal();
            document.body.classList.add('dialog-open');
        };
        const close = () => {
            document.body.classList.remove('dialog-open');
            if (trigger.current?.isConnected) trigger.current.focus();
            else document.querySelector<HTMLButtonElement>('.menu-toggle')?.focus();
        };
        document.addEventListener('click', open);
        element?.addEventListener('close', close);
        return () => { document.removeEventListener('click', open); element?.removeEventListener('close', close); document.body.classList.remove('dialog-open'); };
    }, []);

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (pending.current) return;
        const form = event.currentTarget;
        const data = new FormData(form);
        const phone = String(data.get('phone') || '').trim();
        const name = String(data.get('name') || '').trim();
        const nameInput = form.elements.namedItem('name') as HTMLInputElement;
        const phoneInput = form.elements.namedItem('phone') as HTMLInputElement;
        nameInput.setCustomValidity(name ? '' : 'Укажите ваше имя.');
        phoneInput.setCustomValidity(/^\+?[\d\s().-]+$/.test(phone) && /^\d{10,15}$/.test(phone.replace(/\D/g, '')) ? '' : 'Укажите номер телефона полностью.');
        if (!form.reportValidity()) return;
        if (!LEADS_ENABLED) {
            setStatus('demo');
            setMessage('Предварительная версия. Заявка не отправлена.');
            return;
        }
        pending.current = true;
        setStatus('sending');
        setMessage('Отправляем заявку…');
        try {
            const params = new URLSearchParams(location.search);
            const utm = Object.fromEntries(['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].map(key => [key, (params.get(key) || '').slice(0, 160)]));
            const response = await fetch(LEAD_ENDPOINT || asset('/api/lead'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ kind: 'callback', name, phone, consent: data.get('consent') === 'on', website: data.get('website'), interest, source: location.pathname, utm }),
                signal: AbortSignal.timeout(15000)
            });
            const result = await response.json().catch(() => null);
            if (!response.ok || result?.ok !== true) throw new Error(response.status === 429 ? 'Слишком много заявок. Попробуйте позже.' : 'Не удалось отправить заявку. Попробуйте ещё раз.');
            setStatus('success');
            setMessage('Заявка получена. Мы свяжемся с вами.');
            form.reset();
        } catch (error) {
            setStatus('error');
            setMessage(error instanceof Error && error.name !== 'TimeoutError' ? error.message : 'Не удалось отправить заявку. Попробуйте ещё раз.');
        } finally {
            pending.current = false;
        }
    }

    return (
        <dialog className="request-dialog" ref={dialog} aria-labelledby="request-title" onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); dialog.current?.close(); } }} onClick={event => { if (event.target === event.currentTarget) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.current?.close(); } }}>
            <button className="dialog-close circle-button" aria-label="Закрыть форму" onClick={() => dialog.current?.close()}><Icon name="close" /></button>
            <div className="dialog-ornament" aria-hidden="true"><span /><span /><span /></div>
            <p className="eyebrow">Заказать обратный звонок</p>
            <h2 id="request-title">Ваше время<br /><em>у моря</em></h2>
            <p className="dialog-description">Оставьте имя и телефон. Мы свяжемся с вами и ответим на вопросы об отдыхе.</p>
            <form onSubmit={submit} aria-describedby="request-status">
                <label>Как к вам обращаться<input name="name" placeholder="Ваше имя" autoComplete="given-name" required maxLength={80} onInput={event => event.currentTarget.setCustomValidity('')} /></label>
                <label>Номер телефона<input name="phone" type="tel" inputMode="tel" placeholder="+7 (___) ___-__-__" autoComplete="tel" required maxLength={25} onInput={event => event.currentTarget.setCustomValidity('')} /></label>
                <label className="honeypot" aria-hidden="true">Сайт<input name="website" tabIndex={-1} autoComplete="off" /></label>
                <label className="consent"><input name="consent" type="checkbox" required /><span>Согласен на обработку персональных данных. <a href={asset('/privacy/')} target="_blank" rel="noreferrer">Подробнее</a></span></label>
                <button className="button button-blue" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Отправляем…' : 'Перезвоните мне'}<Icon /></button>
                {!LEADS_ENABLED && <p className="demo-note">Предварительный просмотр. Отправка заявок пока не подключена.</p>}
                <p className={`form-status status-${status}`} id="request-status" role="status" aria-live="polite">{message}</p>
            </form>
            {CONTACT_PHONE && <a className="dialog-phone" href={`tel:${CONTACT_PHONE.replace(/[^\d+]/g, '')}`}>Или позвоните: {CONTACT_PHONE}</a>}
        </dialog>
    );
}
