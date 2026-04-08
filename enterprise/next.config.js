/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    externalDir: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@shared/lib': path.resolve(__dirname, '../lib'),
      '@shared/components': path.resolve(__dirname, '../components'),
      '@shared/design-system': path.resolve(__dirname, '../design-system'),
    }
    return config
  },
  transpilePackages: ['../lib', '../components', '../design-system'],
}

module.exports = nextConfig
