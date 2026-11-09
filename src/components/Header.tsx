'use client';

import { useEffect, useState } from 'react';
import Brand from './Brand';
import Icon from './Icon';

const LINKS = [['#place', 'О месте'], ['#experience', 'Впечатления'], ['#rooms', 'Номера'], ['#gallery', 'Галерея']];

export default function Header() {
    const [open, setOpen] = useState(false);
    useEffect(() => {
        document.body.classList.toggle('menu-open', open);
        const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
        document.addEventListener('keydown', close);
        return () => { document.body.classList.remove('menu-open'); document.removeEventListener('keydown', close); };
    }, [open]);
    return (
        <header className="header">
            <div className="header-inner">
                <Brand light />
                <nav className="desktop-nav" aria-label="Основная навигация">{LINKS.map(([href, text]) => <a href={href} key={href}>{text}</a>)}</nav>
                <button className="button button-header" data-request="Обратный звонок из шапки">Перезвоните мне <Icon /></button>
                <button className="menu-toggle" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? 'Закрыть меню' : 'Открыть меню'} onClick={() => setOpen(!open)}><Icon name={open ? 'close' : 'menu'} /></button>
            </div>
            {open && <nav className="mobile-nav" id="mobile-navigation" aria-label="Навигация на телефоне">{LINKS.map(([href, text], index) => <a href={href} key={href} onClick={() => setOpen(false)}><span>0{index + 1}</span>{text}<Icon /></a>)}<button className="button button-blue" data-request="Обратный звонок из меню" onClick={() => setOpen(false)}>Перезвоните мне <Icon /></button></nav>}
        </header>
    );
}
