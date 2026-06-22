/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['lightningcss', '@tailwindcss/node', '@tailwindcss/postcss'],
}

export default nextConfig
