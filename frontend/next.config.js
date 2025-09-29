/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: require('path').join(__dirname),
  experimental: {
    // optimizeCss: true, // Disabled - causing critters module error
    scrollRestoration: true,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 5000, // Increased from 1000 to reduce file system polling frequency
        aggregateTimeout: 300,
      };
    }
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      // Remove the React Native fallback as it might interfere with MetaMask
      // '@react-native-async-storage/async-storage': false,
    };
    return config;
  },
  images: {
    domains: ['localhost'],
  },
};

module.exports = nextConfig;
