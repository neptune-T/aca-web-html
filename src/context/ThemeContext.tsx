import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // 默认 dark：与你当前站点的视觉基调一致，也能减少“跨页回黑”的体感
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme === 'light' || storedTheme === 'dark') {
      setTheme(storedTheme);
      return;
    }

    // 首次访问：跟随系统偏好（没有就保持默认 dark）
    if (typeof window !== 'undefined' && 'matchMedia' in window) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    // Tailwind darkMode: 'class' -> 需要 html 上有 'dark'
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.dataset.theme = theme;

    // 同步背景，避免页面边缘/滚动区域闪白
    const bg = theme === 'dark' ? '#050505' : '#F9F9F9';
    document.body.style.backgroundColor = bg;
    document.documentElement.style.backgroundColor = bg;

    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode: theme === 'dark', toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (undefined === context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
