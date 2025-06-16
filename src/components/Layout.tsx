import React, { ReactNode, useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import IntroAnimation from './IntroAnimation';
import { AnimatePresence } from 'framer-motion';

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
    <>
      <AnimatePresence>
        {showIntro && <IntroAnimation onAnimationComplete={handleAnimationComplete} />}
      </AnimatePresence>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
    </>
  );
};

export default Layout; 