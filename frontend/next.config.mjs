import path from 'path';
import { fileURLToPath } from 'url';
import { withSentryConfig } from '@sentry/nextjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    scrollRestoration: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable static generation for Web3 app to avoid prerendering issues
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  transpilePackages: ['@polymathuniversata/echain-wallet', 'firebase', '@firebase'],
  outputFileTracingRoot: path.resolve(__dirname),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' 'wasm-unsafe-eval' 'inline-speculation-rules' chrome-extension: moz-extension: safari-extension:",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https: http: chrome-extension: moz-extension: safari-extension:",
              "font-src 'self' data: https://fonts.gstatic.com https://r2cdn.perplexity.ai",
              "connect-src 'self' https://sepolia.base.org https://base.g.alchemy.com https://base-sepolia.g.alchemy.com https://*.pinata.cloud https://api.pinata.cloud https://gateway.pinata.cloud https://ipfs.io https://api.web3modal.com https://*.web3modal.org https://*.walletconnect.com https://*.coinbase.com https://*.walletconnect.org https://*.bridge.walletconnect.org wss://*.bridge.walletconnect.org wss://*.walletconnect.org wss://*.walletconnect.com wss://base-sepolia.g.alchemy.com https://*.infura.io wss://*.infura.io http://localhost:* https://*.reown.com wss://*.reown.com",
              "frame-src 'self' https://*.coinbase.com https://*.walletconnect.com https://*.walletconnect.org https://*.reown.com",
              "worker-src 'self' blob: chrome-extension: moz-extension: safari-extension:",
              "child-src 'self' blob: chrome-extension: moz-extension: safari-extension:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    // Alias react-native async-storage to a small web shim to avoid pulling RN deps
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.modules = config.resolve.modules || [];
    config.resolve.modules.push(path.resolve(__dirname, '../../node_modules'));
    config.resolve.alias['@react-native-async-storage/async-storage'] = path.resolve(__dirname, './lib/shims/async-storage.js');
    config.resolve.alias['@firebase/app'] = path.resolve(__dirname, 'node_modules/@firebase/app');
    config.resolve.alias['@firebase/util'] = path.resolve(__dirname, 'node_modules/@firebase/util');
    return config;
  }
};

export default process.env.SENTRY_DSN && process.env.SENTRY_DSN !== 'https://your-sentry-dsn@sentry.io/project-id'
  ? withSentryConfig(nextConfig, {
      silent: true,
      org: 'echain',
      project: 'echain-frontend',
      widenClientFileUpload: true,
      transpileClientSDK: true,
      tunnelRoute: '/monitoring',
      hideSourceMaps: true,
      disableLogger: true,
    })
  : nextConfig;
