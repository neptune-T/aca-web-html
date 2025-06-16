"use client";

import Link from 'next/link';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';

const Header = () => {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (previous !== undefined && latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm shadow-sm"
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" id="plote-logo" className="text-2xl font-bold">
          Plote
        </Link>
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-gray-600 hover:text-klein-blue transition-colors relative group py-2">
            <span>Home</span>
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-klein-blue scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out"></span>
          </Link>
          <Link href="/notes" className="text-gray-600 hover:text-klein-blue transition-colors relative group py-2">
            <span>Notes</span>
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-klein-blue scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out"></span>
          </Link>
          <Link href="/papers" className="text-gray-600 hover:text-klein-blue transition-colors relative group py-2">
            <span>Papers</span>
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-klein-blue scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out"></span>
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-klein-blue transition-colors relative group py-2">
            <span>About</span>
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-klein-blue scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out"></span>
          </Link>
        </nav>
      </div>
    </motion.header>
  );
};

export default Header; 