export const theme = {
  colors: {
    primary: '#ffffff', // 白
    secondary: '#1a1a1a', // 深灰
    accent: '#3498db', // 蓝色强调
    text: '#e0e0e0', // 浅灰文本
    background: 'url(\'/img/1.png\')', // 背景图像
    glass: 'rgba(255, 255, 255, 0.1)', // 毛玻璃效果
  },
  fonts: {
    body: 'system-ui, sans-serif',
    heading: 'Georgia, serif',
    mono: 'Menlo, monospace',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
  },
};

export const darkModeTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    primary: '#000000', // 暗模式调整如果需要
    // 可以根据需要扩展
  },
};

export const lightTheme = {
  colors: {
    primary: '#000000', // 黑文本
    secondary: '#f0f0f0', // 浅灰背景
    accent: '#007bff', // 蓝色强调
    text: '#333333', // 深灰文本
    background: 'url(\'/img/1.png\')', // 白背景
    glass: 'rgba(0, 0, 0, 0.1)', // 浅毛玻璃
  },
  fonts: {
    body: 'system-ui, sans-serif',
    heading: 'Georgia, serif',
    mono: 'Menlo, monospace',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
  },
};

export const darkTheme = {
  colors: {
    primary: '#ffffff', // 白文本
    secondary: '#1a1a1a', // 深灰
    accent: '#3498db', // 蓝色强调
    text: '#e0e0e0', // 浅灰文本
    background: 'url(\'/img/2.png\')', // 夜晚背景
    glass: 'rgba(255, 255, 255, 0.1)', // 暗毛玻璃
  },
  fonts: {
    body: 'system-ui, sans-serif',
    heading: 'Georgia, serif',
    mono: 'Menlo, monospace',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
  },
};
