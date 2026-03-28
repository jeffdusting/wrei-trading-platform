/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Temporarily ignore build errors for Phase 4 cleanup
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      // Old route redirects to maintain URL compatibility
      {
        source: '/calculator',
        destination: '/analyse',
        permanent: true,
      },
      {
        source: '/scenario',
        destination: '/analyse',
        permanent: true,
      },
      {
        source: '/performance',
        destination: '/system',
        permanent: true,
      },
      {
        source: '/developer',
        destination: '/system',
        permanent: true,
      },
      {
        source: '/demo',
        destination: '/system',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig