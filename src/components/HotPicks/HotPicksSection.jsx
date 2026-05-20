import React from 'react';
import { motion } from 'framer-motion';
import { Flame, ArrowRight } from 'lucide-react';
import HotPickCard, { cardVariant } from './HotPickCard';

const gridContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

export default function HotPicksSection({ hookRef }) {
  const { homepageProducts } = hookRef;

  return (
    <section
      id="hot-picks-section"
      className="relative w-full overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #050505 0%, #080508 50%, #050505 100%)' }}
    >
      {/* Top violet glow divider */}
      <div
        className="absolute top-0 inset-x-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(124,58,237,0.40), rgba(168,85,247,0.60), rgba(124,58,237,0.40), transparent)' }}
      />

      {/* Ambient violet radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 65% 55% at 50% 25%, rgba(124,58,237,0.10) 0%, transparent 70%)' }}
      />

      {/* Soft noise texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      <div className="relative z-10 max-w-[90rem] mx-auto px-6 sm:px-10 lg:px-16 py-20 sm:py-28">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-end justify-between mb-14"
        >
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-10" style={{ background: 'linear-gradient(to right, transparent, rgba(168,85,247,0.60))' }} />
              <p className="text-[10px] font-semibold uppercase" style={{ letterSpacing: '0.35em', color: 'rgba(192,132,252,0.60)' }}>
                Curated Selection
              </p>
            </div>

            <h2 className="font-serif tracking-tight leading-none">
              <span className="block text-white font-bold text-glow" style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)' }}>
                HOT{' '}
                <span className="inline-flex items-baseline gap-2">
                  PICKS
                  <motion.span
                    animate={{ rotate: [0, 10, -5, 8, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }}
                    className="inline-block"
                    style={{ originX: '50%', originY: '90%' }}
                  >
                    <Flame size={36} className="-mb-1" strokeWidth={1.5} style={{ color: '#A855F7', filter: 'drop-shadow(0 0 10px rgba(168,85,247,0.60))' }} />
                  </motion.span>
                </span>
              </span>
            </h2>

            <p className="mt-4 font-light text-sm sm:text-base tracking-wide max-w-xs" style={{ color: 'rgba(255,255,255,0.28)' }}>
              Curated premium accessories for modern devices.
            </p>

            <button 
              onClick={() => document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="mt-6 md:hidden flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-[11px] font-semibold tracking-widest uppercase transition-all duration-300"
              style={{
                background: 'rgba(124,58,237,0.1)',
                border: '1px solid rgba(168,85,247,0.3)',
                color: 'rgba(255,255,255,0.9)',
                boxShadow: '0 4px 12px rgba(124,58,237,0.1)'
              }}
            >
              Browse Cases
              <ArrowRight size={12} />
            </button>
          </div>
        </motion.div>

        {/* Grid */}
        {homepageProducts.length === 0 ? (
          <div className="py-24 text-center text-sm tracking-widest uppercase" style={{ color: 'rgba(192,132,252,0.25)' }}>
            No featured products — star a product in the admin panel
          </div>
        ) : (
          <>
            <motion.div
              className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 pb-8"
              variants={gridContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
            >
              {homepageProducts.map((product) => (
                <div key={product.id} className="w-full">
                  <HotPickCard product={product} />
                </div>
              ))}
            </motion.div>
          </>
        )}
      </div>

      {/* Bottom violet glow divider */}
      <div
        className="absolute bottom-0 inset-x-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(124,58,237,0.40), rgba(168,85,247,0.60), rgba(124,58,237,0.40), transparent)' }}
      />
    </section>
  );
}
