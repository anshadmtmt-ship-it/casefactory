import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/* ── Helper ─────────────────────────────────────────────────────────── */
const hexToRgba = (hex, alpha) => {
  if (!hex) return `rgba(124, 58, 237, ${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16) || 124;
  const g = parseInt(hex.slice(3, 5), 16) || 58;
  const b = parseInt(hex.slice(5, 7), 16) || 237;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

function ProductPlaceholder() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ background: 'linear-gradient(145deg, #0a0518, #160a28)' }}
    >
      <svg width="52" height="68" viewBox="0 0 52 68" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="48" height="64" rx="9" stroke="rgba(168,85,247,0.18)" strokeWidth="2" fill="none"/>
        <rect x="17" y="4.5" width="18" height="4" rx="2" fill="rgba(124,58,237,0.15)"/>
        <circle cx="26" cy="61" r="3" stroke="rgba(168,85,247,0.18)" strokeWidth="1.75" fill="none"/>
      </svg>
    </div>
  );
}

const cardVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function ProductCard({ product, index = 0 }) {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const hasImage    = Boolean(product.images?.length);
  const hasBadge    = Boolean(product.badge_text?.trim());
  const hasDiscount = Boolean(product.discount_price?.trim());
  
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

  const mainImage = product.images?.find(i => i.is_main)?.image || product.images?.[0]?.image;

  return (
    <motion.article
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/product_details/${product.slug}`)}
      className="relative overflow-hidden cursor-pointer"
      style={{
        /* ── Portrait ratio — slightly tighter for 2-col mobile ── */
        aspectRatio: '4/5',
        borderRadius: '14px',
        border: isHovered
          ? `1px solid ${hexToRgba(themeColor, 0.45)}`
          : `1px solid ${hexToRgba(themeColor, 0.18)}`,
        boxShadow: isHovered
          ? `0 24px 64px rgba(0,0,0,0.80), 0 0 40px ${hexToRgba(themeColor, 0.25)}, 0 0 80px ${hexToRgba(themeColor, 0.10)}`
          : `0 4px 24px rgba(0,0,0,0.50), 0 0 0 1px ${hexToRgba(themeColor, 0.06)}`,
        transform: isHovered ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
        transition: 'border 0.4s ease, box-shadow 0.4s ease, transform 0.45s cubic-bezier(0.16,1,0.3,1)',
        touchAction: 'pan-y',
        background: '#060310',
      }}
    >
      {/* ── Full-card image (object-contain so nothing is cropped) ─────── */}
      {hasImage ? (
        <motion.img
          layoutId={`product-image-${product.id}`}
          src={mainImage}
          alt={product.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full img-crisp"
          style={{
            objectFit: 'contain',
            objectPosition: 'center',
            padding: '4%',           /* tighter padding */
            transform: isHovered ? 'scale(1.04)' : 'scale(1)',
            transition: 'transform 0.65s cubic-bezier(0.16,1,0.3,1)',
            willChange: 'transform',
          }}
        />
      ) : (
        <ProductPlaceholder />
      )}

      {/* ── Top-fade so badge doesn't compete with image ───────────────── */}
      <div
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{
          height: '28%',
          background: 'linear-gradient(to bottom, rgba(4,1,14,0.55) 0%, transparent 100%)',
        }}
      />

      {/* ── Cinematic bottom gradient — info lives here ────────────────── */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: '52%',
          background: isHovered
            ? 'linear-gradient(to top, rgba(4,1,14,0.97) 0%, rgba(4,1,14,0.80) 38%, rgba(4,1,14,0.20) 72%, transparent 100%)'
            : 'linear-gradient(to top, rgba(4,1,14,0.92) 0%, rgba(4,1,14,0.65) 35%, rgba(4,1,14,0.10) 68%, transparent 100%)',
          transition: 'background 0.45s ease',
        }}
      />

      {/* ── Ambient bloom on hover ──────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 90% 35% at 50% 100%, ${hexToRgba(themeColor, 0.22)} 0%, transparent 70%)`,
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
      />

      {/* ── Badge ──────────────────────────────────────────────────────── */}
      {hasBadge && (
        <div
          className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase"
          style={{ backdropFilter: 'blur(8px)', ...badgeStyle }}
        >
          {product.badge_text}
        </div>
      )}

      {/* ── Shimmer sweep on hover ──────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ borderRadius: 'inherit' }}>
        <div
          style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(135deg, transparent 0%, ${hexToRgba(themeColor, 0.08)} 50%, transparent 100%)`,
            transform: isHovered ? 'translate(120%, -120%)' : 'translate(-120%, 120%)',
            transition: 'transform 0.9s ease-in-out',
            opacity: isHovered ? 1 : 0,
          }}
        />
      </div>

      {/* ── Product info overlay (on top of gradient) ──────────────────── */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 px-4 pb-4 pt-2"
        style={{ pointerEvents: 'none' }}
      >
        {/* Title */}
        <h3
          className="font-semibold leading-tight mb-2 line-clamp-2"
          style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.92)',
            letterSpacing: '-0.01em',
          }}
        >
          {product.title}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          {hasDiscount ? (
            <>
              <span className="font-bold text-white" style={{ fontSize: '13px' }}>
                {product.discount_price}
              </span>
              <span
                className="line-through"
                style={{ fontSize: '11px', color: 'rgba(255,255,255,0.30)' }}
              >
                {product.price}
              </span>
            </>
          ) : (
            <span className="font-bold text-white" style={{ fontSize: '13px' }}>
              {product.price}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
