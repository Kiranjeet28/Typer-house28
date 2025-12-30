import type { NextConfig } from 'next';
import type { Configuration } from 'webpack';

const nextConfig: NextConfig = {
  transpilePackages: ['three'],

  webpack: (config: Configuration) => {
    if (!config.externals) config.externals = [];
    if (Array.isArray(config.externals)) {
      config.externals.push({
        'utf-8-validate': 'commonjs utf-8-validate',
        bufferutil: 'commonjs bufferutil',
      });
    }
    return config;
  },

  images: {
    domains: ['lh3.googleusercontent.com'],
  },
};

export default nextConfig;
