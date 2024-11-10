/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  pageExtensions: ['page.tsx', 'page.ts'],
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'lh3.googleusercontent.com', port: '' }],
  },
};

export default nextConfig;
