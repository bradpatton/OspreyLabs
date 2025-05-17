'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="container py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image 
            src="/images/logo.svg" 
            alt="Osprey Labs Logo" 
            width={30} 
            height={30}
            className="h-8 w-auto"
            priority
          />
          <span className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 text-transparent bg-clip-text">
            Osprey Labs
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/#features" className="text-gray-600 hover:text-primary-600 transition-colors">
            Features
          </Link>
          <Link href="/#services" className="text-gray-600 hover:text-primary-600 transition-colors">
            Services
          </Link>
          {/*<Link href="#case-studies" className="text-gray-600 hover:text-primary-600 transition-colors">
            Case Studies
          </Link>
          <Link href="#pricing" className="text-gray-600 hover:text-primary-600 transition-colors">
            Pricing
          </Link>*/}
          <Link href="/careers" className="text-gray-600 hover:text-primary-600 transition-colors">
            Careers
          </Link>
          <Link href="#contact" className="btn btn-primary">
            Get Started
          </Link>
        </nav>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-100 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden container py-4 border-t border-gray-200"
        >
          <nav className="flex flex-col space-y-4">
            <Link 
              href="#features" 
              className="text-gray-600 hover:text-primary-600 transition-colors px-2 py-1"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              href="#services" 
              className="text-gray-600 hover:text-primary-600 transition-colors px-2 py-1"
              onClick={() => setIsMenuOpen(false)}
            >
              Services
            </Link>
            {/*<Link 
              href="#case-studies" 
              className="text-gray-600 hover:text-primary-600 transition-colors px-2 py-1"
              onClick={() => setIsMenuOpen(false)}
            >
              Case Studies
            </Link>
            <Link 
              href="#pricing" 
              className="text-gray-600 hover:text-primary-600 transition-colors px-2 py-1"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>*/}
            <Link 
              href="/careers" 
              className="text-gray-600 hover:text-primary-600 transition-colors px-2 py-1"
              onClick={() => setIsMenuOpen(false)}
            >
              Careers
            </Link>
            <Link 
              href="#contact" 
              className="btn btn-primary w-full justify-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Get Started
            </Link>
          </nav>
        </motion.div>
      )}
    </header>
  );
} 