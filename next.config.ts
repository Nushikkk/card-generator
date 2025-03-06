import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack(config, { isServer }) {
    // Add .node extension
    config.resolve.extensions.push('.node');

    // Ignore the 'canvas' module on the client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,  // Ignore canvas on the client-side
      };
    }

    return config;
  },
};

export default nextConfig;
