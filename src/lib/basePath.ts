export function getBasePath(): string {
  return process.env.NEXT_PUBLIC_BASE_PATH || '';
}

/**
 * 为静态导出 + basePath 场景补齐资源前缀（尤其是 GitHub Pages）。
 * - 保持 http(s)/data: 等绝对 URL 不变
 * - 对以 "/" 开头的站内路径，自动拼接 basePath
 */
export function withBasePath(input: string): string {
  if (!input) return input;
  if (/^(https?:)?\/\//.test(input)) return input;
  if (input.startsWith('data:')) return input;

  const basePath = getBasePath();
  if (!basePath) return input;

  // 已经带 basePath 就不重复拼接
  if (input === basePath || input.startsWith(`${basePath}/`)) return input;

  return input.startsWith('/') ? `${basePath}${input}` : input;
}



