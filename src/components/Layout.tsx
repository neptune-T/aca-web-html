"use client";

import React, { ReactNode, useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import IntroAnimation from './IntroAnimation';
import { AnimatePresence } from 'framer-motion';
import nextConfig from '../../next.config.mjs';

const backgroundImageUrl = `${nextConfig.basePath}/img/1.jpg`;

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem('introPlayed')) {
      setShowIntro(false);
    }
  }, []);

  const handleAnimationComplete = () => {
    setShowIntro(false);
    sessionStorage.setItem('introPlayed', 'true');
  };

  return (
    <div className="relative min-h-screen">
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