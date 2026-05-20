import React from 'react';
import { motion } from 'framer-motion';

const HeroComparisonSlider = () => {
  return (
    <div className="relative w-full h-[400px] lg:h-[600px] flex items-center justify-center overflow-visible perspective-[2500px]">
      
      {/* Cinematic Abstract Light Composition */}
      <div className="relative w-[300px] sm:w-[400px] lg:w-[500px] aspect-square flex items-center justify-center">
        
        {/* Deep ambient core */}
        <div className="absolute inset-0 bg-purple-700/20 blur-[100px] rounded-full animate-pulse-slow mix-blend-screen" />
        
        {/* Rotating ethereal rings */}
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.05, 1] }}
          transition={{ rotate: { duration: 40, repeat: Infinity, ease: "linear" }, scale: { duration: 8, repeat: Infinity, ease: "easeInOut" } }}
          className="absolute inset-[10%] border-[1px] border-purple-400/20 rounded-full" 
        />
        <motion.div 
          animate={{ rotate: -360, scale: [1, 1.1, 1] }}
          transition={{ rotate: { duration: 50, repeat: Infinity, ease: "linear" }, scale: { duration: 10, repeat: Infinity, ease: "easeInOut" } }}
          className="absolute inset-[25%] border-[1px] border-purple-300/10 rounded-full" 
        />

        {/* Floating Glassmorphism Orbs for Premium Tech Feel */}
        <motion.div 
          animate={{ y: [-20, 20, -20], x: [-10, 10, -10], rotate: [0, 45, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] right-[15%] w-32 h-32 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(168,85,247,0.2)]"
        />
        <motion.div 
          animate={{ y: [20, -20, 20], x: [10, -10, 10], rotate: [0, -45, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] left-[20%] w-24 h-24 rounded-full bg-purple-500/10 backdrop-blur-lg border border-purple-400/20 shadow-[0_0_30px_rgba(124,58,237,0.3)]"
        />

        {/* Central light bloom */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-purple-400/20 blur-[60px] rounded-full mix-blend-screen pointer-events-none" />
        
      </div>
    </div>
  );
};

export default React.memo(HeroComparisonSlider);
