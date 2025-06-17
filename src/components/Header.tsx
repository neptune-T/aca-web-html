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
      className="fixed top-0 left-0 right-0 z-50 bg-black/10 backdrop-blur-xl shadow-sm"
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" id="plote-logo" className="text-2xl font-bold text-white">
          Plote
        </Link>
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-gray-200 hover:text-white transition-colors duration-300">
            Home
          </Link>
          <Link href="/notes" className="text-gray-200 hover:text-white transition-colors duration-300">
            Notes
          </Link>
          <Link href="/papers" className="text-gray-200 hover:text-white transition-colors duration-300">
            Papers
          </Link>
          <Link href="/about" className="text-gray-200 hover:text-white transition-colors duration-300">
            About
          </Link>
        </nav>
      </div>
    </motion.header>
  );
};

export default Header; 