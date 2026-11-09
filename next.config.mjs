const STATIC_EXPORT = process.env.STATIC_EXPORT === '1';
const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/+$/, '');

const nextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    devIndicators: false,
    ...(STATIC_EXPORT
        ? { output: 'export', basePath: BASE_PATH || undefined, trailingSlash: true, images: { unoptimized: true } }
        : {
              output: 'standalone',
              async headers() {
                  return [{
                      source: '/:path*',
                      headers: [
                          { key: 'X-Content-Type-Options', value: 'nosniff' },
                          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
                          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' }
                      ]
                  }];
              }
          })
};

export default nextConfig;
