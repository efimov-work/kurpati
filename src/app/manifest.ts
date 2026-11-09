import type { MetadataRoute } from 'next';
import { asset } from '@/lib/asset';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
    return { name: 'Курпаты', short_name: 'Курпаты', description: 'Море, архитектура и ваше время', start_url: asset('/'), display: 'browser', background_color: '#f5f2eb', theme_color: '#173e4a', lang: 'ru', icons: [{ src: asset('/assets/brand/icon.svg'), sizes: 'any', type: 'image/svg+xml' }] };
}
