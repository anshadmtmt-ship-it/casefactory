import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ReelCard from './ReelCard';

const SCROLL_AMT = 250;

function useDragScroll(ref) {
  const isDragging  = useRef(false);
  const startX      = useRef(0);
  const scrollLeft  = useRef(0);

  const onMouseDown  = useCallback((e) => {
    isDragging.current = true;
    startX.current = e.pageX - ref.current.offsetLeft;
    scrollLeft.current = ref.current.scrollLeft;
    ref.current.style.cursor = 'grabbing';
    ref.current.style.userSelect = 'none';
  }, [ref]);

  const onMouseLeave = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    ref.current.style.cursor = 'grab';
    ref.current.style.userSelect = '';
  }, [ref]);

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
    if (ref.current) { ref.current.style.cursor = 'grab'; ref.current.style.userSelect = ''; }
  }, [ref]);

  const onMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    ref.current.scrollLeft = scrollLeft.current - walk;
  }, [ref]);

  return { onMouseDown, onMouseLeave, onMouseUp, onMouseMove };
}

export default function ReelsSection({ hookRef }) {
  const { activeReels } = hookRef;
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft]   = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const dragHandlers = useDragScroll(scrollRef);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => { el.removeEventListener('scroll', updateScrollState); window.removeEventListener('resize', updateScrollState); };
  }, [updateScrollState, activeReels]);

  const scrollLeftFn  = () => scrollRef.current?.scrollBy({ left: -SCROLL_AMT * 2, behavior: 'smooth' });
  const scrollRightFn = () => scrollRef.current?.scrollBy({ left:  SCROLL_AMT * 2, behavior: 'smooth' });

  return (
    <section
      id="reels-section"
      className="relative w-full overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #050505 0%, #060408 50%, #050505 100%)' }}
    >
      <div className="absolute top-0 inset-x-0 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(124,58,237,0.45), rgba(168,85,247,0.65), rgba(124,58,237,0.45), transparent)' }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(124,58,237,0.07) 0%, transparent 70%)' }} />
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]" style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(124,58,237,0.8) 39px, rgba(124,58,237,0.8) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(124,58,237,0.8) 39px, rgba(124,58,237,0.8) 40px)`,
      }} />

      <div className="relative z-10 py-20 sm:py-24">
        <div className="max-w-[90rem] mx-auto px-6 sm:px-10 lg:px-16 mb-12 sm:mb-14">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="flex items-end justify-between">
            <div>
              <p className="font-semibold uppercase mb-3" style={{ fontSize: '10px', letterSpacing: '0.35em', color: 'rgba(192,132,252,0.50)' }}>Style Showcase</p>
              <h2 className="font-serif leading-none tracking-tight" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}>
                <span className="text-white font-semibold text-glow">FIND YOUR </span>
                <span className="italic font-light" style={{ WebkitTextStroke: '1px rgba(168,85,247,0.55)', color: 'transparent', textShadow: 'none' }}>FIT</span>
              </h2>
              <p className="mt-3 font-light tracking-widest text-sm uppercase" style={{ color: 'rgba(192,132,252,0.32)' }}>Choose the Best.</p>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              {[{ fn: scrollLeftFn, can: canScrollLeft, icon: <ChevronLeft size={18} strokeWidth={1.75} />, label: 'Scroll left' },
                { fn: scrollRightFn, can: canScrollRight, icon: <ChevronRight size={18} strokeWidth={1.75} />, label: 'Scroll right' }].map(({ fn, can, icon, label }, i) => (
                <button key={i} onClick={fn} disabled={!can} aria-label={label} className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
                  style={can
                    ? { background: 'rgba(124,58,237,0.10)', border: '1px solid rgba(124,58,237,0.35)', color: '#C084FC', backdropFilter: 'blur(12px)', boxShadow: '0 0 16px rgba(124,58,237,0.15)' }
                    : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(124,58,237,0.10)', color: 'rgba(255,255,255,0.18)', cursor: 'not-allowed' }
                  }
                >{icon}</button>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="relative">
          <div className="absolute left-0 top-0 bottom-6 w-20 sm:w-32 z-10 pointer-events-none transition-opacity duration-300" style={{ background: 'linear-gradient(to right, #050505 0%, transparent 100%)', opacity: canScrollLeft ? 1 : 0 }} />
          <div className="absolute right-0 top-0 bottom-6 w-20 sm:w-32 z-10 pointer-events-none transition-opacity duration-300" style={{ background: 'linear-gradient(to left, #050505 0%, transparent 100%)', opacity: canScrollRight ? 1 : 0 }} />
          <div ref={scrollRef} {...dragHandlers} className="flex gap-4 overflow-x-auto pb-4 no-scrollbar" style={{ WebkitOverflowScrolling: 'touch', cursor: 'grab', paddingLeft: 'max(1.5rem, calc(50vw - 45rem))', paddingRight: 'max(1.5rem, calc(50vw - 45rem))' }}>
            {activeReels.length === 0 ? (
              <div className="flex items-center justify-center w-full py-32 text-sm tracking-[0.3em] uppercase" style={{ color: 'rgba(192,132,252,0.18)' }}>No reels configured</div>
            ) : (
              activeReels.map((reel, index) => <ReelCard key={reel.id} reel={reel} index={index} />)
            )}
          </div>
        </div>

        <div className="max-w-[90rem] mx-auto px-6 sm:px-10 lg:px-16 mt-12">
          <div className="h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(124,58,237,0.40), rgba(168,85,247,0.55), rgba(124,58,237,0.40), transparent)' }} />
        </div>
      </div>
    </section>
  );
}
