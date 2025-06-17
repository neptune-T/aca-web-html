/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  // Set basePath and assetPrefix only for production builds
  basePath: isProd ? '/plote-homepage' : '',
  assetPrefix: isProd ? '/plote-homepage/' : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig; 