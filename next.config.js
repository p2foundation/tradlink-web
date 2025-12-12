/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  // Server Actions are stable in Next.js 15, no need for experimental flag
}

module.exports = nextConfig

