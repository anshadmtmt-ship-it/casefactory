import React from 'react';
import { motion } from 'framer-motion';
import CategoryCard from './CategoryCard';

export default function CategoriesSection({ hookRef, onNavigate }) {
  const { activeCategories } = hookRef;

  return (
    <section
      id="categories-section"
      className="relative w-full overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #050505 0%, #060408 100%)' }}
    >
      {/* Top violet glow divider */}
      <div className="absolute top-0 inset-x-0 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(124,58,237,0.45), rgba(168,85,247,0.65), rgba(124,58,237,0.45), transparent)' }} />

      {/* Ambient violet radial glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 75% 55% at 50% 0%, rgba(124,58,237,0.09) 0%, transparent 65%)' }} />

      <div className="relative z-10 max-w-[90rem] mx-auto px-6 sm:px-10 lg:px-16 py-20 sm:py-28">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14 sm:mb-18"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-10" style={{ background: 'linear-gradient(to right, transparent, rgba(168,85,247,0.65))' }} />
            <p className="font-medium uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.28em', color: 'rgba(192,132,252,0.55)' }}>
              COLLECTION
            </p>
          </div>
          <h2 className="font-serif text-white leading-none tracking-tight text-glow" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)', fontWeight: 600 }}>
            Shop by{' '}
            <em className="font-serif italic font-light" style={{ color: 'rgba(192,132,252,0.55)', fontStyle: 'italic' }}>
              Categories
            </em>
          </h2>
        </motion.div>

        {/* Grid */}
        {activeCategories.length === 0 ? (
          <div className="py-24 text-center text-sm tracking-widest uppercase" style={{ color: 'rgba(192,132,252,0.20)' }}>
            No categories configured
          </div>
        ) : (
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-5 sm:gap-6 pb-12 -mx-6 px-6 sm:-mx-10 sm:px-10 lg:-mx-16 lg:px-16" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style>{`.flex::-webkit-scrollbar { display: none; }`}</style>
            {activeCategories.map((cat, index) => (
              <div key={cat.id || cat.slug} className="min-w-[85%] sm:min-w-[calc(50%-12px)] md:min-w-[calc(33.333%-16px)] lg:min-w-[calc(25%-18px)] flex-shrink-0 snap-start">
                <CategoryCard category={cat} index={index} total={activeCategories.length} onNavigate={onNavigate} />
              </div>
            ))}
          </div>
        )}

        {activeCategories.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-10 tracking-[0.3em] uppercase"
            style={{ fontSize: '11px', color: 'rgba(192,132,252,0.22)' }}
          >
            {activeCategories.length} COLLECTIONS — EXPLORE NOW
          </motion.p>
        )}
      </div>

      {/* Bottom violet glow divider */}
      <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(124,58,237,0.40), rgba(168,85,247,0.55), rgba(124,58,237,0.40), transparent)' }} />
    </section>
  );
}
