/** @type {import('next').NextConfig} */
const PYTHON_API = process.env.PYTHON_API_URL || 'http://localhost:8001';
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif']
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // PWA configuration
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  },

  async rewrites() {
    return [
      {
        source: '/api/compress/:path*',
        destination: `${PYTHON_API}/:path*`,
      },
      {
        source: '/api/pdf-to-word/:path*',
        destination: `${PYTHON_API}/pdf-to-word/:path*`,
      },
      {
        source: '/api/word-to-pdf/:path*',
        destination: `${PYTHON_API}/word-to-pdf/:path*`,
      },
      {
        source: '/api/proxy-request',
        destination: `${PYTHON_API}/proxy-request`,
      },
      {
        source: '/api/backlink-check',
        destination: `${PYTHON_API}/backlink-check`,
      },
      {
        source: '/api/pdf-to-image/:path*',
        destination: `${PYTHON_API}/pdf-to-image/:path*`,
      },
      {
        source: '/api/zip-create/:path*',
        destination: `${PYTHON_API}/zip-create/:path*`,
      },
      {
        source: '/api/pdf-merge/:path*',
        destination: `${PYTHON_API}/pdf-merge/:path*`,
      },
    ];
  },



  // Environment variables
  env: {
    CUSTOM_KEY: 'OmniWebKit-webapp',
  },

  // Expose Python API URL to client
  publicRuntimeConfig: {
    PYTHON_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001',
  },
}

export default nextConfig;
