import type { MetadataRoute } from 'next';
import { absolute, siteUrl } from '@/lib/seo';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
    return [{ url: `${siteUrl()}/`, changeFrequency: 'monthly', priority: 1, images: [absolute('/assets/images/hero.webp'), absolute('/assets/images/architecture.webp')] }];
}
