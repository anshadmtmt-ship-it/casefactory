import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ModelCard from './ModelCard';
import { usePhoneModels } from './usePhoneModels';

const SCROLL_AMOUNT = 220;

export default function ShopByModelSection({ modelsOverride, hookRef }) {
  // If a hookRef is passed (from parent), use it; otherwise create our own
  const ownHook = usePhoneModels();
  const hook = hookRef ?? ownHook;
  const { visibleModels } = hook;

  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState, visibleModels]);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -SCROLL_AMOUNT * 2, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: SCROLL_AMOUNT * 2, behavior: 'smooth' });
  };

  return (
    <section
      id="shop-by-model"
      className="relative w-full bg-white py-16 sm:py-20 overflow-hidden"
    >
      {/* Section Header */}
      <div className="max-w-[90rem] mx-auto px-6 sm:px-10 lg:px-16 mb-10 sm:mb-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-end justify-between"
        >
          <div>
            {/* Overline */}
            <p
              className="text-[10px] font-semibold tracking-[0.3em] uppercase text-gray-400 mb-2"
            >
              Collection
            </p>
            {/* Main Title */}
            <h2 className="font-serif text-4xl sm:text-5xl font-medium text-gray-900 tracking-tight leading-none">
              Shop by{' '}
              <span className="italic font-light text-gray-500">Model</span>
            </h2>
          </div>

          {/* Desktop Nav Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200
                ${canScrollLeft
                  ? 'border-gray-200 text-gray-700 hover:border-gray-900 hover:text-gray-900 hover:shadow-md'
                  : 'border-gray-100 text-gray-300 cursor-not-allowed'
                }`}
            >
              <ChevronLeft size={18} strokeWidth={1.75} />
            </button>
            <button
              onClick={scrollRight}
              disabled={!canScrollRight}
              aria-label="Scroll right"
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200
                ${canScrollRight
                  ? 'border-gray-200 text-gray-700 hover:border-gray-900 hover:text-gray-900 hover:shadow-md'
                  : 'border-gray-100 text-gray-300 cursor-not-allowed'
                }`}
            >
              <ChevronRight size={18} strokeWidth={1.75} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Carousel Wrapper with edge fade masks */}
      <div className="relative">
        {/* Left fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 z-10 pointer-events-none transition-opacity duration-300"
          style={{
            background:
              'linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
            opacity: canScrollLeft ? 1 : 0,
          }}
        />
        {/* Right fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 z-10 pointer-events-none transition-opacity duration-300"
          style={{
            background:
              'linear-gradient(to left, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
            opacity: canScrollRight ? 1 : 0,
          }}
        />

        {/* Scrollable Track */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-6 pt-2"
          style={{
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            paddingLeft: 'max(1.5rem, calc(50vw - 45rem))',
            paddingRight: 'max(1.5rem, calc(50vw - 45rem))',
          }}
        >
          {visibleModels.length === 0 ? (
            <div className="flex items-center justify-center w-full py-20 text-gray-400 text-sm tracking-widest uppercase">
              No models available
            </div>
          ) : (
            visibleModels.map((model, index) => (
              <ModelCard key={model.id} model={model} index={index} />
            ))
          )}
        </div>
      </div>

      {/* Mobile scroll indicator dots */}
      {visibleModels.length > 0 && (
        <div className="sm:hidden flex justify-center gap-1.5 mt-4">
          {visibleModels.map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-gray-200"
            />
          ))}
        </div>
      )}

      {/* Hide scrollbar globally for this element */}
      <style>{`
        #shop-by-model [style*="scrollbarWidth"] ::-webkit-scrollbar { display: none; }
        #shop-by-model div[class*="overflow-x-auto"]::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}
