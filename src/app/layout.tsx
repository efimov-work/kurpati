import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { absolute, buildJsonLd, DESCRIPTION, KEYWORDS, NOINDEX, SITE_NAME, siteOrigin, siteUrl, TITLE } from '@/lib/seo';
import './globals.css';
import './responsive.css';

const body = localFont({ src: [{ path: '../fonts/circe.woff2', weight: '400' }, { path: '../fonts/circe_bold.woff2', weight: '700' }], variable: '--font-body', display: 'swap' });
const display = localFont({ src: [{ path: '../fonts/Stapel-Light.ttf', weight: '300' }, { path: '../fonts/Stapel-Medium.ttf', weight: '500' }], variable: '--font-display', display: 'swap' });

export const metadata: Metadata = {
    metadataBase: new URL(siteOrigin()),
    title: { default: TITLE, template: `%s | ${SITE_NAME}` },
    description: DESCRIPTION,
    keywords: KEYWORDS,
    applicationName: SITE_NAME,
    alternates: { canonical: `${siteUrl()}/` },
    formatDetection: { telephone: false },
    openGraph: { type: 'website', locale: 'ru_RU', siteName: SITE_NAME, url: `${siteUrl()}/`, title: TITLE, description: DESCRIPTION, images: [{ url: absolute('/assets/images/og.webp'), width: 1200, height: 630, alt: 'Корпус Дружба в Курпатах над Чёрным морем' }] },
    twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [absolute('/assets/images/og.webp')] },
    robots: NOINDEX ? { index: false, follow: false } : { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
    verification: { google: process.env.GOOGLE_SITE_VERIFICATION || undefined, yandex: process.env.YANDEX_VERIFICATION || undefined }
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#173e4a' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return <html lang="ru" className={`${body.variable} ${display.variable}`}><body>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd()).replace(/</g, '\\u003c') }} /></body></html>;
}
