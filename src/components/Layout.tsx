"use client";

import React, { ReactNode, useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import IntroAnimation from './IntroAnimation';
import { AnimatePresence } from 'framer-motion';
// import { theme } from '@/styles/theme';
import { FaSun, FaMoon } from 'react-icons/fa';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const backgroundImageUrl = `${basePath}/img/1.jpg`;

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [showIntro, setShowIntro] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false); // 默认白天

  useEffect(() => {
    if (sessionStorage.getItem('introPlayed')) {
      setShowIntro(false);
    }
  }, []);

  useEffect(() => {
    const savedMode = localStorage.getItem('theme');
    setIsDarkMode(savedMode === 'dark');
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    console.log('Mode changed to', isDarkMode ? 'dark' : 'light');
    const bgUrl = isDarkMode ? "url('/img/2.png')" : "url('/img/1.jpg')";
    document.body.style.backgroundImage = bgUrl;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
  }, [isDarkMode]);

  const handleAnimationComplete = () => {
    setShowIntro(false);
    sessionStorage.setItem('introPlayed', 'true');
  };

  const toggleDarkMode = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div 
      className={`min-h-screen transition-all duration-500 ${isDarkMode ? 'dark' : 'light'}`} 
    >
      <button 
        onClick={toggleDarkMode} 
        className="fixed top-4 right-4 p-2 rounded-full bg-glass backdrop-blur-md text-accent hover:text-primary transition-colors hover:shadow-md cursor-pointer z-50 pointer-events-auto"
      >
        {isDarkMode ? <FaMoon size={20} /> : <FaSun size={20} />}
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