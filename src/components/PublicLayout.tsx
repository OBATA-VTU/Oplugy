import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import Logo from './Logo';
import Footer from './Footer';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';

const PublicLayout: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Pricing', to: '/pricing' },
    { name: 'Quick Buy', to: '/quick-purchase' },
    { name: 'Blog', to: '/blog' },
    { name: 'About Us', to: '/about' },
    { name: 'Privacy', to: '/privacy' },
    { name: 'Terms', to: '/terms' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-gray-900 dark:text-white font-sans selection:bg-blue-600 selection:text-white flex flex-col">
      {/* Navigation */}
      <nav className={`fixed w-full z-[100] transition-all duration-700 ${scrolled ? 'bg-white/90 dark:bg-[#050505]/90 backdrop-blur-2xl py-4 border-b border-gray-100 dark:border-white/5 shadow-sm' : 'bg-transparent py-10'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Logo />
          
          {/* Desktop Links */}
          <div className="hidden lg:flex items-center space-x-10">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.to} className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white transition-all">
                {link.name}
              </Link>
            ))}
            <div className="w-px h-6 bg-gray-100 dark:bg-white/10 mx-2"></div>
            <Link to="/login" className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white hover:text-blue-600 transition-colors">Login</Link>
            <Link to="/signup" className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-gray-950 transition-all shadow-2xl shadow-blue-600/20">Sign Up</Link>
          </div>

          {/* Mobile Menu Trigger */}
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="lg:hidden w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-gray-900 dark:text-white"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[150]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-[#050505] z-[151] p-10 flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center mb-16">
                <Logo />
                <button onClick={() => setIsMenuOpen(false)} className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center">
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex flex-col space-y-8">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    to={link.to} 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-2xl font-black tracking-tighter uppercase hover:text-blue-600 transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              <div className="mt-auto space-y-4">
                <Link to="/login" className="block w-full py-5 text-center font-black uppercase tracking-widest text-xs border border-gray-100 dark:border-white/10 rounded-2xl">Login</Link>
                <Link to="/signup" className="block w-full py-5 text-center font-black uppercase tracking-widest text-xs bg-blue-600 text-white rounded-2xl">Create Account</Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-grow pt-32">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default PublicLayout;
