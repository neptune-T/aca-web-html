"use client";

import React, { ReactNode, useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import IntroAnimation from './IntroAnimation';
import { AnimatePresence } from 'framer-motion';
import { theme } from '@/styles/theme';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const backgroundImageUrl = `${basePath}/img/1.jpg`;

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [showIntro, setShowIntro] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true); // 默认暗模式

  useEffect(() => {
    if (sessionStorage.getItem('introPlayed')) {
      setShowIntro(false);
    }
  }, []);

  useEffect(() => {
    const savedMode = localStorage.getItem('theme');
    setIsDarkMode(savedMode === 'dark' || savedMode === null);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleAnimationComplete = () => {
    setShowIntro(false);
    sessionStorage.setItem('introPlayed', 'true');
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`} style={{ background: theme.colors.background, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      {/* 添加切换按钮 */}
      <button onClick={toggleDarkMode} className="fixed top-4 right-4 p-2 bg-gray-800 text-white rounded">
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </button>
      {/* Blurred Background */}
      <div
        className="fixed inset-0 z-[-1] bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-md"></div>
      </div>
      
      {/* Page Content */}
      <main className="relative z-10">
        <AnimatePresence>
          {showIntro && <IntroAnimation onAnimationComplete={handleAnimationComplete} />}
        </AnimatePresence>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
      </main>
    </div>
  );
};

export default Layout; 