type Props = { name?: 'arrow' | 'close' | 'chevron' | 'pin' | 'plus' | 'menu'; className?: string };

export default function Icon({ name = 'arrow', className = '' }: Props) {
    const paths = {
        arrow: <><path d="M4 12h15M12 5l7 7-7 7" /></>,
        close: <><path d="m6 6 12 12M18 6 6 18" /></>,
        chevron: <path d="m6 9 6 6 6-6" />,
        pin: <><path d="M19 10c0 5-7 10-7 10S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2" /></>,
        plus: <path d="M5 12h14M12 5v14" />,
        menu: <path d="M4 8h16M4 16h16" />
    };
    return <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
