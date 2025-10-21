import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Keep existing experimental options and enable externalDir so Next
    // can read files from monorepo packages outside the frontend folder.
    scrollRestoration: true,
    optimizePackageImports: ['wagmi', '@rainbow-me/rainbowkit', 'viem', '@coinbase/onchainkit'],
    externalDir: true,
  },
  transpilePackages: [
    '@rainbow-me/rainbowkit',
    'viem',
    '@coinbase/onchainkit',
    '@farcaster/auth-kit',
    '@echain/wallet',
  ],
  // Ensure Next can trace files that live outside the frontend workspace
  // (monorepo packages such as ../packages/wallet). Set the tracing root to
  // the repository root so external packages get included in tracing.
  outputFileTracingRoot: path.resolve(__dirname, '..'),
  images: {
    domains: ['localhost', 'gateway.pinata.cloud', 'ipfs.io'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' 'wasm-unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' data:",
              "connect-src 'self' https://sepolia.base.org https://mainnet.base.org https://base.g.alchemy.com https://base-sepolia.g.alchemy.com https://*.pinata.cloud https://api.pinata.cloud https://gateway.pinata.cloud https://ipfs.io https://api.web3modal.com https://*.web3modal.org https://*.walletconnect.com https://*.coinbase.com https://*.walletconnect.org https://*.bridge.walletconnect.org https://relay.farcaster.xyz wss://*.bridge.walletconnect.org wss://*.walletconnect.org wss://*.walletconnect.com wss://base-sepolia.g.alchemy.com wss://mainnet.base.org https://*.infura.io wss://*.infura.io http://localhost:*",
              "frame-src 'self' https://*.coinbase.com https://*.walletconnect.com https://*.walletconnect.org https://farcaster.com https://*.farcaster.com",
              "frame-ancestors 'self' https://farcaster.com https://*.farcaster.com",
              "worker-src 'self' blob:",
              "child-src 'self' blob:",
            ].join('; '),
          },
          // Prevent clickjacking attacks
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Enable XSS protection
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Referrer policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Strict Transport Security (HTTPS only)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer, webpack }) => {
    // Alias react-native async-storage to a small web shim to avoid pulling RN deps
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias['@react-native-async-storage/async-storage'] = path.resolve(__dirname, './lib/shims/async-storage.js');
    
    // CRITICAL: Completely replace use-sync-external-store with React 18 built-in
    // This prevents ALL dynamic require issues from the use-sync-external-store package
    const useSyncShim = path.resolve(__dirname, './lib/shims/use-sync-external-store-with-selector.js');
    const useSyncShimIndex = path.resolve(__dirname, './lib/shims/use-sync-external-store-shim-index.js');
    
    // Replace the entire use-sync-external-store package and its parts
    config.resolve.alias['use-sync-external-store/shim$'] = useSyncShimIndex;
    config.resolve.alias['use-sync-external-store/shim/with-selector.js$'] = useSyncShim;
    config.resolve.alias['use-sync-external-store/shim/with-selector$'] = useSyncShim;
    config.resolve.alias['use-sync-external-store/with-selector.js$'] = useSyncShim;
    config.resolve.alias['use-sync-external-store/with-selector$'] = useSyncShim;
    config.resolve.alias['use-sync-external-store$'] = 'react';
    
    // Force ESM resolution for problematic packages
    // This fixes the "Dynamic require of react is not supported" error
    config.resolve.conditionNames = ['import', 'module', 'browser', 'default'];
    
    // Ensure fullySpecified is false for node_modules
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    });
    
    // Exclude problematic packages from bundling
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
      'encoding': 'commonjs encoding',
    });
    
    // Ensure react is not dynamically required
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Define process.env to avoid undefined errors
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.NODE_DEBUG': JSON.stringify(process.env.NODE_DEBUG || ''),
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      })
    );
    
    return config;
  }
};

export default nextConfig;
