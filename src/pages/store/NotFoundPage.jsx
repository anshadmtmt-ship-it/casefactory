import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#0a0a0a] text-white px-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] bg-violet-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] right-[20%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="z-10 text-center max-w-lg"
      >
        <motion.h1 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-8xl md:text-9xl font-serif font-bold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50"
        >
          404
        </motion.h1>
        <h2 className="text-2xl md:text-3xl font-serif font-semibold tracking-tight mb-6">Page Not Found</h2>
        <p className="text-white/60 text-sm md:text-base mb-10 leading-relaxed font-light">
          The page you are looking for has vanished into the void. It might have been moved, deleted, or perhaps it never existed in our collection.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 backdrop-blur-md"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
          <button 
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-black hover:bg-gray-200 font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            <Home size={16} /> Return Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}
