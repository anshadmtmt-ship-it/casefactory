import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const hexToRgba = (hex, alpha) => {
  if (!hex) return `rgba(124, 58, 237, ${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16) || 124;
  const g = parseInt(hex.slice(3, 5), 16) || 58;
  const b = parseInt(hex.slice(5, 7), 16) || 237;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

function Placeholder() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ background: 'linear-gradient(145deg, #0a0518, #160a28)' }}
    >
      <svg width="60" height="78" viewBox="0 0 60 78" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="56" height="74" rx="10" stroke="rgba(168,85,247,0.18)" strokeWidth="2.5" fill="none"/>
        <rect x="20" y="5" width="20" height="5" rx="2.5" fill="rgba(124,58,237,0.15)"/>
        <circle cx="30" cy="70" r="3.5" stroke="rgba(168,85,247,0.18)" strokeWidth="2" fill="none"/>
      </svg>
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const cardVariant = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
};

export default function HotPickCard({ product }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  const hasImg   = Boolean(product.images?.length);
  const hasBadge = Boolean(product.badge_text?.trim());
  const hasDisc  = Boolean(product.discount_price?.trim());
  const themeColor = product.theme_color || '#7C3AED';

  const getBadgeStyle = () => {
    const type = product.badge_text?.toUpperCase();
    if (type === 'HOT') return { background: 'rgba(220,50,50,0.15)', border: '1px solid rgba(255,80,80,0.30)', color: '#ffaaaa' };
    if (type === 'SOLD OUT' || type === 'SALE') return { background: 'rgba(200,150,20,0.15)', border: '1px solid rgba(255,190,50,0.28)', color: '#ffd080' };
    return { 
      background: hexToRgba(themeColor, 0.18), 
      border: `1px solid ${hexToRgba(themeColor, 0.35)}`, 
      color: themeColor 
    };
  };
  
  const badgeStyle = getBadgeStyle();
  const mainImage  = product.images?.find(i => i.is_main)?.image || product.images?.[0]?.image;

  return (
    <motion.article
      variants={cardVariant}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/product_details/${product.slug}`)}
      className="relative overflow-hidden cursor-pointer group"
      style={{
        aspectRatio: '4/5',
        borderRadius: '14px',
        border: hovered
          ? `1px solid ${hexToRgba(themeColor, 0.5)}`
          : `1px solid ${hexToRgba(themeColor, 0.25)}`,
        boxShadow: hovered
          ? `0 40px 100px rgba(0,0,0,0.9), 0 0 60px ${hexToRgba(themeColor, 0.25)}`
          : '0 20px 50px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.05)',
        transform: hovered ? 'scale(1.04) translateY(-10px)' : 'scale(1) translateY(0)',
        transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)',
        background: 'linear-gradient(135deg, rgba(20,10,30,0.8) 0%, rgba(5,2,10,0.95) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        willChange: 'transform, box-shadow',
      }}
    >
      {/* ── Background Core Glow ───────────────────────────────────────── */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{ background: `radial-gradient(ellipse 80% 80% at 50% 20%, ${hexToRgba(themeColor, 0.15)} 0%, transparent 60%)` }}
      />

      {/* ── Full-card image ───────────────────────────────────────────── */}
      {hasImg ? (
        <motion.img
          layoutId={`product-image-${product.id}`}
          src={mainImage}
          alt={product.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full"
          style={{
            objectFit: 'contain',
            objectPosition: 'center',
            padding: '4%',
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
            transition: 'transform 0.8s cubic-bezier(0.16,1,0.3,1)',
            filter: hovered ? 'contrast(1.1) brightness(1.1) drop-shadow(0 20px 30px rgba(0,0,0,0.8))' : 'contrast(1.05) drop-shadow(0 10px 20px rgba(0,0,0,0.6))',
            willChange: 'transform',
          }}
        />
      ) : (
        <Placeholder />
      )}

      {/* ── Top Gloss ─────────────────────────────────────────────────── */}
      <div
        className="absolute inset-x-0 top-0 h-1/2 pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity duration-700"
        style={{
          background: `linear-gradient(to bottom, ${hexToRgba(themeColor, 0.15)} 0%, transparent 100%)`,
        }}
      />

      {/* ── Cinematic bottom gradient ──────────────────────────────────── */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: '60%',
          background: hovered
            ? 'linear-gradient(to top, rgba(5,2,10,0.98) 0%, rgba(5,2,10,0.8) 40%, transparent 100%)'
            : 'linear-gradient(to top, rgba(5,2,10,0.9) 0%, rgba(5,2,10,0.5) 40%, transparent 100%)',
          transition: 'background 0.5s ease',
        }}
      />

      {/* ── Ambient bloom ───────────────────────────────────────── */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 100% 50% at 50% 100%, ${hexToRgba(themeColor, 0.2)} 0%, transparent 70%)`,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }}
      />

      {/* ── Badge ──────────────────────────────────────────────────────── */}
      {hasBadge && (
        <div
          className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[0.16em] uppercase"
          style={{ backdropFilter: 'blur(8px)', ...badgeStyle }}
        >
          {product.badge_text}
        </div>
      )}

      {/* ── Shimmer sweep ───────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ borderRadius: 'inherit' }}>
        <div
          style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(135deg, transparent 0%, ${hexToRgba(themeColor, 0.09)} 50%, transparent 100%)`,
            transform: hovered ? 'translate(120%, -120%)' : 'translate(-120%, 120%)',
            transition: 'transform 0.9s ease-in-out',
            opacity: hovered ? 1 : 0,
          }}
        />
      </div>

      {/* ── Product info overlay ───────────────────────────────────────── */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 px-5 pb-5 pt-2"
        style={{ pointerEvents: 'none' }}
      >
        {/* Title */}
        <p
          className="font-semibold leading-snug mb-2.5 line-clamp-2"
          style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.93)',
            letterSpacing: '-0.01em',
          }}
        >
          {product.title}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          {hasDisc ? (
            <>
              <span className="font-bold text-white" style={{ fontSize: '14px' }}>
                {product.discount_price}
              </span>
              <span className="line-through" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.30)' }}>
                {product.price}
              </span>
            </>
          ) : (
            <span className="font-bold text-white" style={{ fontSize: '14px' }}>
              {product.price}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
