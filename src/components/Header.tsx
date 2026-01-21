"use client";

import React, { useState } from 'react';
import { Sun, Moon, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

interface HeaderProps {
  // 兼容旧用法：如果页面仍传入 isDarkMode/setIsDarkMode，就使用它
  isDarkMode?: boolean;
  setIsDarkMode?: (value: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode: isDarkModeProp, setIsDarkMode }) => {
  const { isDarkMode: isDarkModeCtx, toggleTheme } = useTheme();
  const isDarkMode = isDarkModeProp ?? isDarkModeCtx;
  const onToggleTheme = () => {
    if (setIsDarkMode) setIsDarkMode(!isDarkMode);
    else toggleTheme();
  };

  const [mobileOpen, setMobileOpen] = useState(false);

  // 定义仅用于 Header 的样式逻辑
  const glassNavClass = isDarkMode 
    ? 'bg-black/70 border-white/5 text-white shadow-lg shadow-black/20' 
    : 'bg-white/70 border-black/5 text-black shadow-sm';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4 transition-all duration-500 border-b backdrop-blur-xl ${glassNavClass}`}>
      <div className="flex justify-between items-center">
      {/* Logo */}
      <Link href="/" className="font-bold text-lg tracking-tight flex items-center gap-2 text-current no-underline">
        Plote Motion Field
      </Link>

      {/* Navigation Links */}
      <div className="flex items-center gap-3 md:gap-6 text-sm font-medium">
         {/* 修改点：
            在 className 中添加了 'text-current no-underline'
            text-current: 强制继承父级颜色（即跟随 Header 的黑/白模式）
            no-underline: 防止出现默认下划线
         */}
         <Link href="/" className="hidden md:inline cursor-pointer hover:opacity-70 transition-all text-current no-underline">
            Home
         </Link>
         <Link href="/notes" className="hidden md:inline cursor-pointer hover:opacity-70 transition-all text-current no-underline">
            Notes
         </Link>
         <Link href="/papers" className="hidden md:inline cursor-pointer hover:opacity-70 transition-all text-current no-underline">
            Papers
         </Link>
         <Link href="/about" className="hidden md:inline cursor-pointer hover:opacity-70 transition-all text-current no-underline">
            About
         </Link>
         
         {/* Theme Toggle Button */}
         <button 
           onClick={onToggleTheme}
           className="p-2 rounded-full border border-current hover:opacity-60 transition-all active:scale-95 text-current"
           aria-label="Toggle Dark Mode"
         >
           {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
         </button>

         {/* Mobile Menu Button */}
         <button
           onClick={() => setMobileOpen((v) => !v)}
           className="md:hidden p-2 rounded-full border border-current hover:opacity-60 transition-all active:scale-95 text-current"
           aria-label="Toggle Navigation Menu"
         >
           {mobileOpen ? <X size={18} /> : <Menu size={18} />}
         </button>
      </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden mt-4 rounded-2xl border border-current/10 overflow-hidden">
          <div className={`flex flex-col ${isDarkMode ? 'bg-black/60' : 'bg-white/60'} backdrop-blur-xl`}>
            <Link
              href="/"
              className="px-4 py-3 text-current hover:opacity-80 transition-all"
              onClick={() => setMobileOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/notes"
              className="px-4 py-3 text-current hover:opacity-80 transition-all"
              onClick={() => setMobileOpen(false)}
            >
              Notes
            </Link>
            <Link
              href="/papers"
              className="px-4 py-3 text-current hover:opacity-80 transition-all"
              onClick={() => setMobileOpen(false)}
            >
              Papers
            </Link>
            <Link
              href="/about"
              className="px-4 py-3 text-current hover:opacity-80 transition-all"
              onClick={() => setMobileOpen(false)}
            >
              About
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;