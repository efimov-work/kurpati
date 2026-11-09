import { asset, BASE_PATH } from './asset';

export const SITE_NAME = 'Курпаты';
export const TITLE = 'Курпаты: море, архитектура и ваше время на Южном берегу Крыма';
export const DESCRIPTION = 'Знакомство с Курпатами на Южном берегу Крыма. Архитектура корпуса Дружба, морские панорамы, фотографии и заявка на обратный звонок.';
export const KEYWORDS = ['Курпаты', 'санаторий Курпаты', 'Дружба Курпаты', 'Южный берег Крыма', 'отдых у моря', 'Курпаты Ялта'];

function configuredOrigin(): string | null {
    try {
        const url = new URL((process.env.NEXT_PUBLIC_SITE_URL || '').trim());
        return ['https:', 'http:'].includes(url.protocol) ? url.origin : null;
    } catch { return null; }
}

export const NOINDEX = process.env.SITE_NOINDEX !== '0' || !configuredOrigin();
export const siteOrigin = () => configuredOrigin() || 'http://localhost:3010';
export const siteUrl = () => `${siteOrigin()}${BASE_PATH}`;
export const absolute = (path: string) => `${siteOrigin()}${asset(path)}`;

export function buildJsonLd() {
    const url = `${siteUrl()}/`;
    return {
        '@context': 'https://schema.org',
        '@graph': [
            { '@type': 'WebSite', '@id': `${url}#website`, name: SITE_NAME, url, inLanguage: 'ru-RU' },
            { '@type': 'WebPage', '@id': `${url}#webpage`, name: TITLE, description: DESCRIPTION, url, inLanguage: 'ru-RU', isPartOf: { '@id': `${url}#website` }, about: { '@id': `${url}#place` }, primaryImageOfPage: { '@type': 'ImageObject', url: absolute('/assets/images/hero.webp') } },
            { '@type': 'Place', '@id': `${url}#place`, name: 'Курпаты, корпус Дружба', description: 'Кольцевое здание корпуса Дружба на Южном берегу Крыма, открытое в 1985 году.', geo: { '@type': 'GeoCoordinates', latitude: 44.445482, longitude: 34.133665 }, address: { '@type': 'PostalAddress', streetAddress: 'Алупкинское шоссе, 12', addressLocality: 'Курпаты', addressRegion: 'Крым' }, image: [absolute('/assets/images/hero.webp'), absolute('/assets/images/architecture.webp')] }
        ]
    };
}
