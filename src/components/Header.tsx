"use client";

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, setIsDarkMode }) => {
  
  // 定义仅用于 Header 的样式逻辑
  const glassNavClass = isDarkMode 
    ? 'bg-black/70 border-white/5 text-white shadow-lg shadow-black/20' 
    : 'bg-white/70 border-black/5 text-black shadow-sm';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-12 py-4 transition-all duration-500 border-b backdrop-blur-xl ${glassNavClass}`}>
      {/* Logo */}
      <div className="font-bold text-lg tracking-tight flex items-center gap-2 cursor-pointer">
         Plote Motion Field
      </div>

      {/* Navigation Links */}
      <div className="flex items-center gap-6 text-sm font-medium">
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
           onClick={() => setIsDarkMode(!isDarkMode)}
           className="p-2 rounded-full border border-current hover:opacity-60 transition-all active:scale-95 text-current"
           aria-label="Toggle Dark Mode"
         >
           {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
         </button>
      </div>
    </nav>
  );
};

export default Header;