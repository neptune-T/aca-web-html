/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';
const repoName = '/aca-web-html';

const nextConfig = {
  output: 'export',
  // Set basePath and assetPrefix only for production builds
  basePath: isProd ? repoName : '',
  assetPrefix: isProd ? `${repoName}/` : '',
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? repoName : '',
  },
};

module.exports = {
  basePath: '/aca-web-html',
  assetPrefix: '/aca-web-html/',
  images: {
    unoptimized: true,
  },
  output: 'export',
};

export default nextConfig; 