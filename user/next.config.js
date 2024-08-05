/** @type {import('next').NextConfig} */
const path = require('path');
const { i18n } = require('./next-i18next.config');
const nextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')]
  }, 
  i18n,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors. in development we need to run yarn lint
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  poweredByHeader: false,
  swcMinify: true,
  publicRuntimeConfig: {
    // Will be available on both server and client
    API_ENDPOINT: process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://api.girls2dream.com/v1',
    SOCKET_ENDPOINT: process.env.NEXT_PUBLIC_SOCKET_ENDPOINT || 'https://api.girls2dream.com/v1',
  },
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/auth/home',
      },
      {
        source: '/favorites',
        destination: '/models?friendOnly=1',
      },
      {
        source: '/login',
        destination: '/auth/login',
      },
      {
        source: '/register',
        destination: '/auth/register',
      },
      {
        source: '/forgot',
        destination: '/auth/forgot',
      },
      {
        source: '/token-history',
        destination: '/tokens/history',
      },
      {
        source: '/bookmarked-messages',
        destination: '/profile/bookmarked-messages',
      },
      {
        source: '/purchased-media',
        destination: '/profile/purchased-media',
      },
      {
        source: '/payout-request',
        destination: '/profile/payout-request',
      },
      {
        source: '/media-content',
        destination: '/profile/media-content',
      },
      {
        source: '/payout-account',
        destination: '/profile/setting/payout-account',
      },
    ];
  },
};

module.exports = nextConfig;
