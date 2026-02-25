import React from 'react';
import { motion } from 'motion/react';
import Logo from './Logo';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = "Starting Secure System..." }) => {
  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: [0.8, 1.1, 1],
          opacity: 1
        }}
        transition={{ 
          duration: 1.5,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="mb-8"
      >
        <Logo />
      </motion.div>
      
      <div className="space-y-4 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-600 animate-pulse"
        >
          {message}
        </motion.p>
        
        <div className="w-48 h-1 bg-gray-100 rounded-full overflow-hidden mx-auto">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-full h-full bg-blue-600"
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
