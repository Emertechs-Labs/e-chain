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
    config.resolve.alias['@react-native-async-storage/async-storage'] = require('path').resolve(__dirname, './lib/shims/async-storage.js');
    return config;
  }
};

export default nextConfig;
