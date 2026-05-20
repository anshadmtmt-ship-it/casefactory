import React, { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

function PhonePlaceholder() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <svg width="72" height="92" viewBox="0 0 72 92" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="68" height="88" rx="13" stroke="rgba(168,85,247,0.20)" strokeWidth="2.5" fill="none"/>
        <rect x="24" y="5.5" width="24" height="5" rx="2.5" fill="rgba(124,58,237,0.15)"/>
        <circle cx="36" cy="83" r="4" stroke="rgba(168,85,247,0.20)" strokeWidth="2" fill="none"/>
      </svg>
    </div>
  );
}

export default function CategoryCard({ category, index, onNavigate }) {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const mX = useMotionValue(0.5);
  const mY = useMotionValue(0.5);
  const springTilt  = { stiffness: 200, damping: 28, mass: 0.7 };
  const springLight = { stiffness: 60, damping: 20 };

  const rotX = useSpring(useTransform(mY, [0, 1], [ 3.5, -3.5]), springTilt);
  const rotY = useSpring(useTransform(mX, [0, 1], [-4.5,  4.5]), springTilt);
  const imgX = useSpring(useTransform(mX, [0, 1], ['4%', '-4%']), springLight);
  const imgY = useSpring(useTransform(mY, [0, 1], ['4%', '-4%']), springLight);
  const spotX = useMotionValue('50%');
  const spotY = useMotionValue('50%');

  const handleMouseMove = useCallback((e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top)  / rect.height;
    mX.set(x); mY.set(y);
    spotX.set(`${x * 100}%`);
    spotY.set(`${y * 100}%`);
  }, [mX, mY, spotX, spotY]);

  const onEnter = () => setIsHovered(true);
  const onLeave = () => {
    setIsHovered(false);
    mX.set(0.5); mY.set(0.5);
    spotX.set('50%'); spotY.set('50%');
  };

  const handleClick = (e) => {
    e.preventDefault();
    if (onNavigate) onNavigate(category.slug);
  };

  const variants = {
    hidden:  { opacity: 0, y: 48, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { delay: index * 0.14, duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  };

  const hasImage = Boolean(category.image?.length);

  return (
    <motion.div variants={variants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} style={{ perspective: '1200px' }} className="w-full">
      <motion.a
        ref={cardRef}
        href={category.redirect_url || '#'}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        aria-label={`Browse ${category.name}`}
        className="block relative overflow-hidden cursor-pointer"
        style={{
          aspectRatio: '4/5',
          borderRadius: '24px',
          rotateX: isHovered ? rotX : 0,
          rotateY: isHovered ? rotY : 0,
          y: isHovered ? -14 : 0,
          scale: isHovered ? 1.02 : 1,
          border: isHovered
            ? '1px solid rgba(168,85,247,0.55)'
            : '1px solid rgba(124,58,237,0.20)',
          boxShadow: isHovered
            ? '0 48px 100px rgba(0,0,0,0.85), 0 0 60px rgba(124,58,237,0.35), 0 0 120px rgba(124,58,237,0.15)'
            : '0 8px 40px rgba(0,0,0,0.60), 0 0 0 1px rgba(124,58,237,0.08)',
          textDecoration: 'none',
          transition: 'box-shadow 0.55s ease, border 0.4s ease',
          background: '#080510',
        }}
      >
        {/* Background */}
        <motion.div
          className="absolute inset-[-10%]"
          style={{
            x: isHovered ? imgX : '0%',
            y: isHovered ? imgY : '0%',
            scale: isHovered ? 1.05 : 1,
            transition: 'scale 0.8s cubic-bezier(0.16,1,0.3,1)',
            background: hasImage ? undefined : 'linear-gradient(145deg, #0a0518 0%, #160a2e 50%, #0c0620 100%)',
          }}
        >
          {hasImage ? (
            <img src={category.image} alt={category.name} loading="lazy" className="w-full h-full object-cover" style={{ filter: isHovered ? 'brightness(0.72)' : 'brightness(0.60)' }} />
          ) : (
            <PhonePlaceholder />
          )}
        </motion.div>

        {/* Violet top gloss */}
        <div className="absolute inset-x-0 top-0 pointer-events-none" style={{
          height: '40%',
          background: 'linear-gradient(to bottom, rgba(168,85,247,0.12) 0%, transparent 100%)',
          opacity: isHovered ? 1 : 0.45,
          transition: 'opacity 0.4s ease',
          zIndex: 2,
        }} />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: isHovered
            ? 'linear-gradient(to top, rgba(4,0,12,0.93) 0%, rgba(4,0,12,0.42) 50%, rgba(4,0,12,0.08) 100%)'
            : 'linear-gradient(to top, rgba(4,0,12,0.82) 0%, rgba(4,0,12,0.24) 55%, rgba(4,0,12,0.04) 100%)',
          transition: 'background 0.5s ease',
          zIndex: 3,
        }} />

        {/* Mouse-follow violet spotlight */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: isHovered ? 1 : 0,
            background: useTransform([spotX, spotY], ([sx, sy]) =>
              `radial-gradient(350px circle at ${sx} ${sy}, rgba(124,58,237,0.18) 0%, transparent 65%)`),
            transition: 'opacity 0.4s ease',
            zIndex: 4,
          }}
        />

        {/* Violet shimmer sweep on hover */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 5 }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, transparent 0%, rgba(168,85,247,0.10) 50%, transparent 100%)',
            transform: isHovered ? 'translate(120%, -120%)' : 'translate(-120%, 120%)',
            transition: 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)',
            opacity: isHovered ? 1 : 0,
          }} />
        </div>

        {/* Violet ambient bottom bloom */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 90% 40% at 50% 100%, rgba(124,58,237,0.22) 0%, transparent 65%)',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.5s ease',
          zIndex: 4,
        }} />

        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8" style={{ zIndex: 6 }}>
          <motion.p className="font-mono text-[10px] uppercase mb-3" style={{ letterSpacing: '0.28em', color: 'rgba(192,132,252,0.40)' }} animate={{ opacity: isHovered ? 0.80 : 0.40 }} transition={{ duration: 0.3 }}>
            {String(index + 1).padStart(2, '0')} / 03
          </motion.p>

          <motion.h3 className="font-serif text-white leading-none tracking-tight mb-5" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }} animate={{ y: isHovered ? -5 : 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
            {category.name}
          </motion.h3>

          <motion.div className="flex items-center gap-2.5" animate={{ opacity: isHovered ? 1 : 0.45, x: isHovered ? 0 : -5 }} transition={{ duration: 0.35, ease: 'easeOut' }}>
            <span className="text-white/80 text-xs font-semibold uppercase" style={{ letterSpacing: '0.22em' }}>Explore</span>
            <motion.div
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{
                background: isHovered ? 'rgba(124,58,237,0.30)' : 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(8px)',
                border: isHovered ? '1px solid rgba(168,85,247,0.55)' : '1px solid rgba(255,255,255,0.15)',
                boxShadow: isHovered ? '0 0 16px rgba(124,58,237,0.40)' : 'none',
                transition: 'background 0.3s ease, border 0.3s ease, box-shadow 0.3s ease',
              }}
              animate={{ rotate: isHovered ? 45 : 0, scale: isHovered ? 1.15 : 1 }}
              transition={{ duration: 0.35 }}
            >
              <ArrowUpRight size={13} style={{ color: isHovered ? '#C084FC' : 'rgba(255,255,255,0.85)' }} />
            </motion.div>
          </motion.div>
        </div>
      </motion.a>
    </motion.div>
  );
}
