/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';
const repoName = '/aca-web-html';

const nextConfig = {
  output: 'export',
  basePath: isProd ? repoName : '',
  assetPrefix: isProd ? `${repoName}/` : '',
  images: {
    unoptimized: true, // 必须设置为 true 以支持静态导出
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? repoName : '',
  },
  // 添加以下配置解决 GitHub Pages 路由问题
  trailingSlash: true,
};

export default nextConfig;