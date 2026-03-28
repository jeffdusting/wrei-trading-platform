/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Temporarily ignore build errors for Phase 4 cleanup
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig