/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: require('path').join(__dirname),
  experimental: {
    scrollRestoration: true,
    // Enable performance optimizations (compatible with Next.js 15)
    optimizePackageImports: ['@rainbow-me/rainbowkit', 'wagmi', 'viem', 'lucide-react'],
  },
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules/**', '**/.git/**'],
      };
    }

    // Optimize bundle splitting and caching
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              enforce: true,
            },
            rainbow: {
              test: /[\\/]node_modules[\\/]@rainbow-me[\\/]/,
              name: 'rainbow',
              chunks: 'all',
              priority: 10,
            },
            wagmi: {
              test: /[\\/]node_modules[\\/](wagmi|viem)[\\/]/,
              name: 'wagmi',
              chunks: 'all',
              priority: 10,
            },
          },
        },
      };
    }

    // Fallbacks for browser compatibility
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false,
      '@react-native-async-storage/async-storage': false,
      'react-native': false,
      'pino-pretty': false,
    };

    // Ignore problematic modules during build
    if (!isServer) {
      config.externals = {
        ...config.externals,
        'react-native': 'react-native',
        '@react-native-async-storage/async-storage': '@react-native-async-storage/async-storage',
      };
    }

    return config;
  },
  images: {
    domains: ['localhost'],
  },
  // Optimize static imports
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}',
    },
  },
};

module.exports = nextConfig;
