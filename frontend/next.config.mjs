import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    scrollRestoration: true,
  },
  images: {
    domains: ['localhost'],
  },
  webpack: (config, { isServer }) => {
    // Alias react-native async-storage to a small web shim to avoid pulling RN deps
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias['@react-native-async-storage/async-storage'] = path.resolve(__dirname, './lib/shims/async-storage.js');
    return config;
  }
};

export default nextConfig;
