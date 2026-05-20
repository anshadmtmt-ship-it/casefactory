import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useRef, useEffect } from 'react';
import { Menu, X, ChevronRight, Phone } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';

const Instagram = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const Facebook = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

import ReelsSection      from '../../components/Reels/ReelsSection';
import HotPicksSection   from '../../components/HotPicks/HotPicksSection';
import CategoriesSection from '../../components/Categories/CategoriesSection';
import CinematicBackground from '../../components/CinematicBackground';
import ContactSection      from '../../components/Contact/ContactSection';

import { useStoreSettings } from '../../context/SettingsContext';

function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const { reelsHook, hotPicksHook, categoriesHook } = useOutletContext();
  const { settings }   = useStoreSettings();

  const navigateToCategory = (slug) => { navigate(`/categories/${slug}`); };
  const navigateHome       = () =>     { window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const navLinks = ['Home', 'Categories', 'Contact'];

  const homeVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } },
    exit:    { opacity: 0, transition: { duration: 0.15 } },
  };

  return (
    <motion.div variants={homeVariants} initial="initial" animate="animate" exit="exit">
      <div className="min-h-screen text-white font-sans" style={{ background: '#050505' }}>



        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <main className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-0">

          {/* Hero container — position:relative so we can pin the button */}
          <div
            className="relative overflow-hidden w-full h-[65vh] min-h-[450px] md:h-[82vh] md:min-h-[540px] max-h-[880px] bg-[#0a0a0a]"
            style={{
              borderRadius: 'clamp(1.2rem, 2.5vw, 2rem)',
              border: '1px solid rgba(124,58,237,0.14)',
              boxShadow: '0 0 0 1px rgba(124,58,237,0.06), 0 24px 80px rgba(0,0,0,0.70)',
            }}
          >
            {/* Video + cinematic overlays */}
            <CinematicBackground />

            {/* ── Browse Cases — pinned bottom-centre ───────────────────── */}
            <div
              className="absolute left-0 right-0 justify-center z-50 bottom-8 md:bottom-12 hidden md:flex"
            >
              <motion.button
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="group relative overflow-hidden"
                style={{
                  /* Glass surface */
                  padding: '0.95rem 3.2rem',
                  borderRadius: '9999px',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
                  backdropFilter: 'blur(24px) saturate(1.8)',
                  WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
                  /* Border: top highlight + violet glow */
                  border: '1px solid rgba(192,132,252,0.30)',
                  /* Box shadow: outer violet glow + inner top highlight */
                  boxShadow: [
                    '0 0 0 1px rgba(124,58,237,0.18)',
                    '0 0 28px rgba(124,58,237,0.22)',
                    '0 12px 40px rgba(0,0,0,0.60)',
                    'inset 0 1px 0 rgba(255,255,255,0.12)',
                    'inset 0 -1px 0 rgba(0,0,0,0.30)',
                  ].join(', '),
                  /* Typography */
                  color: 'rgba(255,255,255,0.88)',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  /* Transition for glow on hover */
                  transition: 'box-shadow 0.45s ease, border-color 0.45s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = [
                    '0 0 0 1px rgba(168,85,247,0.35)',
                    '0 0 50px rgba(168,85,247,0.40)',
                    '0 16px 48px rgba(0,0,0,0.65)',
                    'inset 0 1px 0 rgba(255,255,255,0.16)',
                    'inset 0 -1px 0 rgba(0,0,0,0.30)',
                  ].join(', ');
                  e.currentTarget.style.borderColor = 'rgba(192,132,252,0.55)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = [
                    '0 0 0 1px rgba(124,58,237,0.18)',
                    '0 0 28px rgba(124,58,237,0.22)',
                    '0 12px 40px rgba(0,0,0,0.60)',
                    'inset 0 1px 0 rgba(255,255,255,0.12)',
                    'inset 0 -1px 0 rgba(0,0,0,0.30)',
                  ].join(', ');
                  e.currentTarget.style.borderColor = 'rgba(192,132,252,0.30)';
                }}
              >
                {/* Diagonal glass-shine sweep */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"
                  style={{
                    background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%)',
                  }}
                />
                {/* Frosted inner tint */}
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'inherit',
                    background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(192,132,252,0.08) 0%, transparent 80%)',
                    pointerEvents: 'none',
                  }}
                />
                <span className="relative z-10 flex items-center gap-3">
                  Browse Cases
                  {/* Subtle arrow */}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ opacity: 0.6 }}>
                    <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </motion.button>
            </div>

          </div>
        </main>

        {/* ── Sections ──────────────────────────────────────────────────── */}
        <HotPicksSection hookRef={hotPicksHook} />
        <CategoriesSection hookRef={categoriesHook} onNavigate={navigateToCategory} />
        <ReelsSection hookRef={reelsHook} />
        <ContactSection />

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <footer
          className="text-white py-12"
          style={{
            background: '#000',
            borderTop: '1px solid rgba(124,58,237,0.20)',
            boxShadow: '0 -1px 0 rgba(124,58,237,0.08)',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Violet glow top line */}
            <div
              className="h-px w-full mb-10"
              style={{ background: 'linear-gradient(to right, transparent, rgba(124,58,237,0.50), rgba(168,85,247,0.70), rgba(124,58,237,0.50), transparent)' }}
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center">
                <span className="font-sans text-base font-bold uppercase" style={{ letterSpacing: '0.26em', color: 'rgba(255,255,255,0.70)' }}>
                  CASE <span style={{ color: '#A855F7' }}>FACTORY</span>
                </span>
              </div>

              <p className="text-[11px] tracking-widest uppercase" style={{ letterSpacing: '0.22em', color: 'rgba(255,255,255,0.18)' }}>
                © 2026 Case Factory. All rights reserved.
              </p>

              <div className="flex items-center gap-6">
                {settings?.instagram && (
                  <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="text-xs tracking-wide flex items-center gap-1.5 transition-all duration-300" style={{ color: 'rgba(255,255,255,0.25)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#C084FC'; e.currentTarget.style.textShadow = '0 0 12px rgba(192,132,252,0.50)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; e.currentTarget.style.textShadow = 'none'; }}
                  >
                    <Instagram size={13} /> Instagram
                  </a>
                )}
                {settings?.facebook && (
                  <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="text-xs tracking-wide flex items-center gap-1.5 transition-all duration-300" style={{ color: 'rgba(255,255,255,0.25)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#C084FC'; e.currentTarget.style.textShadow = '0 0 12px rgba(192,132,252,0.50)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; e.currentTarget.style.textShadow = 'none'; }}
                  >
                    <Facebook size={13} /> Facebook
                  </a>
                )}
                {settings?.phone && (
                  <a href={`tel:${settings.phone.replace(/[^0-9]/g, '')}`} className="text-xs tracking-wide flex items-center gap-1.5 transition-all duration-300" style={{ color: 'rgba(255,255,255,0.25)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#C084FC'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; }}
                  >
                    <Phone size={13} /> {settings.phone}
                  </a>
                )}
                <a href="#contact-section" onClick={(e) => { e.preventDefault(); document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-xs tracking-wide transition-all duration-300" style={{ color: 'rgba(255,255,255,0.25)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#C084FC'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; }}
                >
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </motion.div>
  );
}

export default HomePage;
