export default function Brand({ light = false }: { light?: boolean }) {
    return (
        <a className={`brand ${light ? 'brand-light' : ''}`} href="#top" aria-label="Курпаты, в начало страницы">
            <svg viewBox="0 0 52 52" fill="none" aria-hidden="true"><circle cx="26" cy="26" r="22" stroke="currentColor" strokeWidth="1.1" /><circle cx="26" cy="26" r="15" stroke="currentColor" strokeWidth="1.1" /><path d="m26 4 8 13 14 9-14 9-8 13-8-13L4 26l14-9L26 4Z" stroke="currentColor" strokeWidth="1.1" /><circle cx="26" cy="26" r="4" stroke="currentColor" strokeWidth="1.1" /></svg>
            <span>Курпаты<small>Место с особенным характером</small></span>
        </a>
    );
}
