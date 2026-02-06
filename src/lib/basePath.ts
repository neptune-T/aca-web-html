let cachedRuntimeBasePath: string | null = null;

function normalizeBasePath(input: string): string {
  if (!input) return '';
  if (input === '/') return '';
  return input.endsWith('/') ? input.slice(0, -1) : input;
}

/**
 * 在浏览器端尽量“自愈”地推断 basePath：
 * 从页面里某个 `/_next/static/...` script/link 的路径前缀提取出来。
 * 这样就算 CI 环境变量没对齐，也不会把资源路径拼错。
 */
export function getBasePath(): string {
  if (cachedRuntimeBasePath !== null) return cachedRuntimeBasePath;

  const envBasePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH || '');
  if (typeof document === 'undefined') {
    cachedRuntimeBasePath = envBasePath;
    return cachedRuntimeBasePath;
  }

  try {
    const scripts = Array.from(document.querySelectorAll('script[src]')) as HTMLScriptElement[];
    const links = Array.from(document.querySelectorAll('link[href]')) as HTMLLinkElement[];
    const candidates = [
      ...scripts.map((s) => s.src).filter(Boolean),
      ...links.map((l) => l.href).filter(Boolean),
    ];

    for (const urlStr of candidates) {
      const u = new URL(urlStr, window.location.origin);
      const marker = '/_next/static/';
      const idx = u.pathname.indexOf(marker);
      if (idx >= 0) {
        cachedRuntimeBasePath = normalizeBasePath(u.pathname.slice(0, idx));
        return cachedRuntimeBasePath;
      }
    }
  } catch {
    // ignore
  }

  cachedRuntimeBasePath = envBasePath;
  return cachedRuntimeBasePath;
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





