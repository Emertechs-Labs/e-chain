/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Exclude Node.js modules from client-side bundle
    if (!isServer) {
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
        http2: false,
        dns: false,
        assert: false,
        os: false,
        path: false,
        util: false,
        events: false,
        buffer: false,
        querystring: false,
        punycode: false,
        process: false,
      };
    }

    return config;
  },
}

export default nextConfig