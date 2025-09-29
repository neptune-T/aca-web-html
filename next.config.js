/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/aca-web-html',
  assetPrefix: '/aca-web-html/',
  output: 'export', // 如果是静态导出，确保启用
  images: { unoptimized: true }, // 新增：禁用图像优化，修复导出错误
};

module.exports = nextConfig;
