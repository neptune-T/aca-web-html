/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  // Set basePath and assetPrefix only for production builds
  basePath: isProd ? '/aca-web-html' : '',
  assetPrefix: isProd ? '/aca-web-html/' : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig; 