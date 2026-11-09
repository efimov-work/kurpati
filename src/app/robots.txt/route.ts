import { NOINDEX, siteUrl } from '@/lib/seo';

export const dynamic = 'force-static';

export function GET() {
    const body = ['User-agent: *', NOINDEX ? 'Disallow: /' : 'Allow: /', '', 'User-agent: Yandex', NOINDEX ? 'Disallow: /' : 'Allow: /', 'Clean-param: utm_source&utm_medium&utm_campaign&utm_content&utm_term&yclid&gclid', '', `Sitemap: ${siteUrl()}/sitemap.xml`, ''].join('\n');
    return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
