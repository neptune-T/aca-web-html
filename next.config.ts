import type { NextConfig } from 'next';

/**
 * GitHub Pages 部署说明：
 * - 如果仓库是 `username.github.io`（用户主页仓库），站点部署在根路径 -> basePath 为空。
 * - 如果未来改回项目仓库（project pages），可在 CI 里设置 NEXT_PUBLIC_BASE_PATH=/repoName
 */
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const basePath = rawBasePath === '/' ? '' : rawBasePath.replace(/\/$/, '');

const nextConfig: NextConfig = {
  output: 'export',
  assetPrefix: basePath ? `${basePath}/` : '',
  basePath,
  trailingSlash: true,  // Add this to handle paths correctly
  env: {
    // 让运行时代码（withBasePath / three.js 资源路径等）拿到同一份前缀
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
};

export default nextConfig;
