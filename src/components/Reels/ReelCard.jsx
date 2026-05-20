import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Clapperboard } from 'lucide-react';

const cardVariants = {
  hidden:   { opacity: 0, y: 40, scale: 0.94 },
  visible:  (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.08, duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  }),
};

function VideoMedia({ src, thumbnail, isHovered, isMuted, setIsMuted }) {
  const videoRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = isMuted;
    const playPromise = video.play();
    if (playPromise !== undefined) playPromise.catch(() => {});
  }, [isMuted, src]);

  return (
    <>
      <div className={`absolute inset-0 bg-black transition-opacity duration-1000 ${isLoaded ? 'opacity-0' : 'opacity-100'}`} style={{ zIndex: 1 }} />
      <video ref={videoRef} src={src} poster={thumbnail || undefined} loop muted={isMuted} playsInline autoPlay preload="metadata"
        onLoadedData={() => setIsLoaded(true)}
        className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)', filter: isHovered ? 'brightness(1.08)' : 'brightness(0.90)', willChange: 'transform, filter' }}
      />
      {/* Violet glass mute button */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsMuted(m => !m); }}
        className="absolute bottom-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
        style={{
          background: 'rgba(124,58,237,0.25)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(168,85,247,0.40)',
          color: '#C084FC',
          boxShadow: '0 0 12px rgba(124,58,237,0.30)',
        }}
      >
        {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
      </button>
    </>
  );
}

export default function ReelCard({ reel, index }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const hasVideo = reel.video && reel.video.length > 0;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-30px' }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative flex-shrink-0 overflow-hidden cursor-pointer block group"
      style={{
        width: '240px',
        aspectRatio: '9/16',
        borderRadius: '20px',
        background: '#050310',
        border: isHovered ? '1px solid rgba(168,85,247,0.50)' : '1px solid rgba(124,58,237,0.18)',
        boxShadow: isHovered
          ? '0 40px 80px rgba(0,0,0,0.90), 0 0 60px rgba(124,58,237,0.35), 0 0 120px rgba(124,58,237,0.15)'
          : '0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(124,58,237,0.06)',
        transform: isHovered ? 'scale(1.03) translateY(-8px)' : 'scale(1) translateY(0)',
        transition: 'box-shadow 0.6s cubic-bezier(0.25, 1, 0.5, 1), transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), border 0.4s ease',
        willChange: 'transform, box-shadow',
      }}
    >
      {/* Media */}
      {!hasVideo ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <Clapperboard size={24} style={{ color: 'rgba(168,85,247,0.25)', marginBottom: '8px' }} />
        </div>
      ) : (
        <VideoMedia src={reel.video} thumbnail={reel.thumbnail} isHovered={isHovered} isMuted={isMuted} setIsMuted={setIsMuted} />
      )}

      {/* Violet top gloss */}
      <div className="absolute inset-x-0 top-0 pointer-events-none" style={{
        height: '30%',
        background: 'linear-gradient(to bottom, rgba(168,85,247,0.10) 0%, transparent 100%)',
        opacity: isHovered ? 0.85 : 0.35,
        transition: 'opacity 0.4s ease',
        zIndex: 5,
      }} />

      {/* Cinematic overlay */}
      <div className="absolute inset-0 pointer-events-none transition-opacity duration-700 ease-out" style={{
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.65) 100%)',
        opacity: isHovered ? 0.45 : 0.9,
        zIndex: 4,
      }} />

      {/* Violet bloom at bottom */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 80% 30% at 50% 100%, rgba(124,58,237,0.22) 0%, transparent 70%)',
        opacity: isHovered ? 1 : 0,
        transition: 'opacity 0.5s ease',
        zIndex: 4,
      }} />

      {/* Playing badge */}
      {hasVideo && (
        <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full transition-all duration-700 transform -translate-y-2 group-hover:translate-y-0"
          style={{
            background: 'rgba(124,58,237,0.25)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(168,85,247,0.40)',
            opacity: isHovered ? 1 : 0,
            boxShadow: '0 0 16px rgba(124,58,237,0.25)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#A855F7', boxShadow: '0 0 8px rgba(168,85,247,0.80)' }} />
          <span className="text-[10px] font-semibold uppercase" style={{ color: '#C084FC', letterSpacing: '0.15em' }}>Playing</span>
        </div>
      )}

      {/* Violet edge inset glow on hover */}
      <div className="absolute inset-0 rounded-[20px] pointer-events-none transition-opacity duration-400" style={{
        opacity: isHovered ? 1 : 0,
        background: 'linear-gradient(135deg, rgba(168,85,247,0.07) 0%, transparent 50%, rgba(124,58,237,0.04) 100%)',
        zIndex: 6,
      }} />
    </motion.div>
  );
}
