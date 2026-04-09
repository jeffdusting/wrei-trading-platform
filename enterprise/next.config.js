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
      // Shared components use @/ imports from the broker root
      // Map @/ to parent directory so shared component imports resolve
      '@/design-system': path.resolve(__dirname, '../design-system'),
      '@/lib': path.resolve(__dirname, '../lib'),
      '@/components': path.resolve(__dirname, '../components'),
    }
    // Ensure shared files outside enterprise/ resolve packages from enterprise/node_modules
    config.resolve.modules = [
      path.resolve(__dirname, 'node_modules'),
      'node_modules',
    ]
    return config
  },
  transpilePackages: ['../lib', '../components', '../design-system'],
}

module.exports = nextConfig
