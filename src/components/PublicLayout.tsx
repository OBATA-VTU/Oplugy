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
    { name: 'Home', to: '/' },
    { name: 'Services', to: '/#services' },
    { name: 'Pricing', to: '/pricing' },
    { name: 'Quick Buy', to: '/quick-purchase' },
    { name: 'FAQ', to: '/faq' },
    { name: 'Support', to: '/support' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-gray-900 dark:text-white font-sans selection:bg-emerald-600 selection:text-white flex flex-col">
      {/* Navigation */}
      <nav className={`fixed w-full z-[100] transition-all duration-300 ${scrolled ? 'bg-white dark:bg-gray-900 py-3 border-b border-gray-200 dark:border-gray-800 shadow-md' : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
          <Logo />
          
          {/* Desktop Links */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.to} className="text-sm font-semibold text-gray-700 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400 transition-colors">
                {link.name}
              </Link>
            ))}
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2"></div>
            <Link to="/login" className="text-sm font-semibold text-gray-900 dark:text-white hover:text-emerald-600 transition-colors">Login</Link>
            <Link to="/signup" className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">Register</Link>
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
              
              <div className="flex flex-col space-y-6">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    to={link.to} 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-lg font-semibold text-gray-800 dark:text-gray-200 hover:text-emerald-600 transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              <div className="mt-auto space-y-4">
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block w-full py-4 text-center font-bold text-sm border border-gray-200 dark:border-gray-700 rounded-xl">Login</Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="block w-full py-4 text-center font-bold text-sm bg-emerald-600 text-white rounded-xl">Register Now</Link>
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
