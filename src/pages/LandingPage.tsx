
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import Footer from '../components/Footer';
import { PhoneIcon, SignalIcon, BoltIcon, TvIcon, MenuIcon } from '../components/Icons';

const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="bg-white overflow-hidden font-sans">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Logo />
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 font-semibold transition-colors">Features</a>
              <a href="#partners" className="text-gray-600 hover:text-blue-600 font-semibold transition-colors">Partners</a>
              <a href="#testimonials" className="text-gray-600 hover:text-blue-600 font-semibold transition-colors">Trust</a>
              <div className="h-6 w-px bg-gray-200 mx-2"></div>
              <Link to="/login" className="text-gray-600 hover:text-blue-600 font-semibold transition-colors">Login</Link>
              <Link to="/signup" className="bg-blue-600 text-white px-7 py-3 rounded-full font-bold hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0">
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-600 hover:text-blue-600 focus:outline-none"
              >
                <MenuIcon />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 py-4 px-6 space-y-4 shadow-xl">
            <a href="#features" onClick={() => setIsMenuOpen(false)} className="block text-gray-600 font-semibold">Features</a>
            <a href="#partners" onClick={() => setIsMenuOpen(false)} className="block text-gray-600 font-semibold">Partners</a>
            <a href="#testimonials" onClick={() => setIsMenuOpen(false)} className="block text-gray-600 font-semibold">Trust</a>
            <Link to="/login" className="block text-gray-600 font-semibold">Login</Link>
            <Link to="/signup" className="block bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-center">Get Started</Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-52 lg:pb-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex items-center gap-16">
            <div className="lg:w-3/5 text-center lg:text-left">
              <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold mb-6 border border-blue-100">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
                Now Live: 5% Discount on Airtime
              </div>
              <h1 className="text-6xl lg:text-8xl font-black text-gray-900 leading-[1.1] mb-8 tracking-tight">
                The Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Plug</span> You Deserve.
              </h1>
              <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Experience the fastest way to top-up airtime, buy data, and pay bills in Nigeria. Secure, instant, and incredibly reliable.
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-5">
                <Link to="/signup" className="bg-blue-600 text-white px-10 py-5 rounded-2xl text-lg font-bold hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 flex items-center justify-center transform hover:-translate-y-1">
                  Start Topping Up Free
                </Link>
                <Link to="/login" className="bg-white text-gray-900 border-2 border-gray-100 px-10 py-5 rounded-2xl text-lg font-bold hover:bg-gray-50 transition-all flex items-center justify-center transform hover:-translate-y-1">
                  View Dashboard
                </Link>
              </div>
              
              <div className="mt-14 flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-8">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <img key={i} className="w-12 h-12 rounded-full border-4 border-white shadow-sm" src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="user" />
                  ))}
                </div>
                <div className="text-sm font-medium">
                  <span className="block text-gray-900 font-bold text-base">Over 50,000+ Happy Nigerians</span>
                  <span className="text-gray-500">Processing ₦100M+ monthly transactions</span>
                </div>
              </div>
            </div>
            
            <div className="lg:w-2/5 mt-20 lg:mt-0 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] animate-pulse"></div>
              <div className="relative z-10 p-4 bg-gradient-to-tr from-gray-100 to-white rounded-[2.5rem] shadow-2xl border border-white/50">
                <img 
                  src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800" 
                  alt="Oplug Mobile Interface" 
                  className="rounded-[2rem] shadow-inner w-full object-cover aspect-[9/16]" 
                />
                <div className="absolute -right-8 top-1/4 bg-white p-4 rounded-2xl shadow-2xl border border-gray-100 animate-bounce duration-[3000ms]">
                   <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-400">Success</div>
                        <div className="text-sm font-black text-gray-800">₦2,500 Airtime Sent</div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section id="partners" className="py-24 bg-gray-50/50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-blue-600 font-bold uppercase tracking-widest text-sm mb-3">Partnering with the best</p>
            <h2 className="text-3xl font-black text-gray-900">Seamless Integration with All Networks</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 items-center opacity-60 hover:opacity-100 transition-opacity">
            <img src="https://upload.wikimedia.org/wikipedia/commons/a/af/MTN_Logo.svg" alt="MTN" className="h-14 mx-auto object-contain grayscale hover:grayscale-0