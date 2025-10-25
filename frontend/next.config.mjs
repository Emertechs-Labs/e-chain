import path from 'path';
import { fileURLToPath } from 'url';

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
  transpilePackages: ['@polymathuniversata/echain-wallet', 'firebase', '@firebase'],
  outputFileTracingRoot: path.resolve(__dirname),
  images: {
    domains: ['localhost', 'gateway.pinata.cloud', 'ipfs.io'],
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
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' 'wasm-unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' data:",
              "connect-src 'self' https://sepolia.base.org https://base.g.alchemy.com https://base-sepolia.g.alchemy.com https://*.pinata.cloud https://api.pinata.cloud https://gateway.pinata.cloud https://ipfs.io https://api.web3modal.com https://*.web3modal.org https://*.walletconnect.com https://*.coinbase.com https://*.walletconnect.org https://*.bridge.walletconnect.org wss://*.bridge.walletconnect.org wss://*.walletconnect.org wss://*.walletconnect.com wss://base-sepolia.g.alchemy.com https://*.infura.io wss://*.infura.io http://localhost:*",
              "frame-src 'self' https://*.coinbase.com https://*.walletconnect.com https://*.walletconnect.org",
              "worker-src 'self' blob:",
              "child-src 'self' blob:",
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

export default nextConfig;
