"use client";

import React, { ReactNode } from 'react';
import Link from 'next/link';

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="container flex items-center justify-between py-4">
          <Link href="/" className="text-2xl font-bold text-black">
            Plote Motion Field
          </Link>
          <nav className="flex space-x-6">
            <Link href="/" className="text-gray-600 hover:text-black transition-colors">
              Home
            </Link>
            <Link href="/notes" className="text-gray-600 hover:text-black transition-colors">
              Notes
            </Link>
            <Link href="/papers" className="text-gray-600 hover:text-black transition-colors">
              Papers
            </Link>
            <Link href="/travel" className="text-gray-600 hover:text-black transition-colors">
              Travel
            </Link>
          </nav>
        </div>
      </header>
      <main className="pt-20">
        {children}
      </main>
    </>
  );
};

export default Layout; 