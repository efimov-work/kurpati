'use client';

import { useState } from 'react';
import { asset } from '@/lib/asset';
import { EXPERIENCES } from '@/lib/content';
import Icon from './Icon';

export default function Experience() {
    const [active, setActive] = useState(0);
    const item = EXPERIENCES[active];
    return (
        <section className="experience section-dark" id="experience" aria-labelledby="experience-title">
            <div className="container experience-heading" data-reveal><p className="eyebrow">Ощутить Курпаты</p><h2 id="experience-title">Отдых начинается<br />с <em>ощущений</em></h2><p>Увидеть. Услышать. Почувствовать.<br />И наконец никуда не спешить.</p></div>
            <div className="container experience-layout">
                <div className="experience-tabs" role="tablist" aria-label="Впечатления" data-reveal>{EXPERIENCES.map((entry, index) => <button key={entry.short} id={`experience-tab-${index}`} type="button" role="tab" aria-selected={active === index} aria-controls="experience-panel" tabIndex={active === index ? 0 : -1} className={active === index ? 'is-active' : ''} onClick={() => setActive(index)} onKeyDown={(event) => { if (event.key === 'ArrowDown' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowLeft') { event.preventDefault(); const next = (index + (event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1) + EXPERIENCES.length) % EXPERIENCES.length; setActive(next); document.getElementById(`experience-tab-${next}`)?.focus(); } }}><span>0{index + 1}</span>{entry.short}<Icon /></button>)}</div>
                <div className="experience-panel" id="experience-panel" role="tabpanel" aria-labelledby={`experience-tab-${active}`}>
                    <div className="experience-image" key={item.image}><img src={asset(`/assets/images/${item.image}.webp`)} alt={item.alt} loading="lazy" decoding="async" /><span className="photo-caption">{item.detail}</span></div>
                    <div className="experience-description" key={item.title}><h3>{item.title}</h3><p>{item.text}</p></div>
                </div>
            </div>
        </section>
    );
}
