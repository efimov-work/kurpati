'use client';

import { useEffect } from 'react';

export default function Motion() {
    useEffect(() => {
        const reduced = matchMedia('(prefers-reduced-motion: reduce)');
        const elements = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
        const observer = new IntersectionObserver(entries => entries.forEach(entry => {
            if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
        }), { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
        elements.forEach(element => { if (reduced.matches || element.getBoundingClientRect().top < innerHeight * 0.9) element.classList.add('is-visible'); else observer.observe(element); });
        const images = [...document.querySelectorAll<HTMLElement>('[data-parallax]')];
        const header = document.querySelector('.header');
        let frame = 0;
        const update = () => {
            if (frame) return;
            frame = requestAnimationFrame(() => {
                frame = 0;
                header?.classList.toggle('is-scrolled', scrollY > 80);
                const distance = document.documentElement.scrollHeight - innerHeight;
                document.documentElement.style.setProperty('--progress', String(distance ? scrollY / distance : 0));
                if (!reduced.matches && innerWidth > 760) images.forEach(image => {
                    const rect = image.parentElement?.getBoundingClientRect();
                    if (!rect || rect.top > innerHeight || rect.bottom < 0) return;
                    const shift = Math.max(-35, Math.min(35, (rect.top + rect.height / 2 - innerHeight / 2) * -Number(image.dataset.parallax || 0.04)));
                    image.style.setProperty('--parallax', `${shift}px`);
                });
            });
        };
        const change = () => {
            if (reduced.matches) { elements.forEach(element => element.classList.add('is-visible')); images.forEach(image => image.style.setProperty('--parallax', '0px')); }
            update();
        };
        addEventListener('scroll', update, { passive: true });
        addEventListener('resize', update, { passive: true });
        reduced.addEventListener('change', change);
        update();
        document.documentElement.classList.add('motion-ready');
        return () => { observer.disconnect(); removeEventListener('scroll', update); removeEventListener('resize', update); reduced.removeEventListener('change', change); cancelAnimationFrame(frame); };
    }, []);
    return null;
}
