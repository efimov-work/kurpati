'use client';

import { useEffect, useRef, useState } from 'react';
import { asset } from '@/lib/asset';
import { GALLERY } from '@/lib/content';
import Icon from './Icon';

export default function Gallery() {
    const track = useRef<HTMLDivElement>(null);
    const dialog = useRef<HTMLDialogElement>(null);
    const [active, setActive] = useState(0);
    const [selected, setSelected] = useState(0);
    const selectedItem = GALLERY[selected];
    function move(direction: number) {
        const next = Math.max(0, Math.min(GALLERY.length - 1, active + direction));
        const target = track.current?.children[next] as HTMLElement | undefined;
        const first = track.current?.children[0] as HTMLElement | undefined;
        if (target && first) track.current?.scrollTo({ left: target.offsetLeft - first.offsetLeft, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
        setActive(next);
    }
    useEffect(() => {
        const element = dialog.current;
        if (!element) return;
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') { event.preventDefault(); element.close(); }
            if (event.key === 'ArrowRight') setSelected(value => (value + 1) % GALLERY.length);
            if (event.key === 'ArrowLeft') setSelected(value => (value - 1 + GALLERY.length) % GALLERY.length);
        };
        element.addEventListener('keydown', onKey);
        return () => element.removeEventListener('keydown', onKey);
    }, []);
    return (
        <section className="gallery section" id="gallery" aria-labelledby="gallery-title">
            <div className="container section-heading" data-reveal><div><p className="eyebrow">Коллекция впечатлений</p><h2 id="gallery-title">У каждого места<br />есть <em>свои ракурсы</em></h2></div><div className="gallery-controls"><span>{String(active + 1).padStart(2, '0')}<i> / {String(GALLERY.length).padStart(2, '0')}</i></span><button className="circle-button previous" aria-label="Предыдущий снимок" onClick={() => move(-1)} disabled={active === 0}><Icon /></button><button className="circle-button" aria-label="Следующий снимок" onClick={() => move(1)} disabled={active === GALLERY.length - 1}><Icon /></button></div></div>
            <div className="gallery-track" ref={track} onScroll={() => { const element = track.current; if (element) { const first = element.children[0] as HTMLElement; const second = element.children[1] as HTMLElement; const width = second.offsetLeft - first.offsetLeft; if (width) setActive(element.scrollWidth - element.clientWidth - element.scrollLeft < 3 ? GALLERY.length - 1 : Math.min(GALLERY.length - 1, Math.round(element.scrollLeft / width))); } }}>
                {GALLERY.map((item, index) => <button className="gallery-card" key={item.image} aria-label={`Открыть фото: ${item.title}`} onClick={() => { setSelected(index); dialog.current?.showModal(); }}><div className="gallery-photo"><img src={asset(`/assets/images/${item.image}.webp`)} alt={item.subtitle} loading="lazy" decoding="async" /><span className="gallery-expand"><Icon name="plus" /></span></div><div className="gallery-caption"><span>{item.title}</span><small>0{index + 1}</small></div></button>)}
            </div>
            <dialog ref={dialog} className="lightbox" aria-label="Просмотр фотографий" onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}><button className="lightbox-close circle-button" aria-label="Закрыть фото" onClick={() => dialog.current?.close()}><Icon name="close" /></button><figure><img src={asset(`/assets/images/${selectedItem.image}.webp`)} alt={selectedItem.subtitle} /><figcaption><span>{selectedItem.title}</span><small>{selectedItem.subtitle}</small></figcaption></figure><button className="lightbox-previous circle-button previous" aria-label="Предыдущее фото" onClick={() => setSelected((selected - 1 + GALLERY.length) % GALLERY.length)}><Icon /></button><button className="lightbox-next circle-button" aria-label="Следующее фото" onClick={() => setSelected((selected + 1) % GALLERY.length)}><Icon /></button></dialog>
        </section>
    );
}
