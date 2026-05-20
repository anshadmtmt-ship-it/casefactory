import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Phone, MessageCircle, X } from 'lucide-react';
import { useProducts } from '../../components/Products/useProducts';
import HotPickCard from '../../components/HotPicks/HotPickCard';
import { useStoreSettings } from '../../context/SettingsContext';
import { useCart } from '../../context/CartContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import FloatingBackButton from '../../components/common/FloatingBackButton';
import { toast } from 'react-hot-toast';

const hexToRgba = (hex, alpha) => {
  if (!hex) return `rgba(124, 58, 237, ${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16) || 124;
  const g = parseInt(hex.slice(3, 5), 16) || 58;
  const b = parseInt(hex.slice(5, 7), 16) || 237;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct]               = useState(null);
  const [loading, setLoading]               = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor]   = useState(null);
  const [isBookingOpen, setIsBookingOpen]   = useState(false);

  const { addToCart } = useCart();
  const { isAuthenticated } = useCustomerAuth();

  useEffect(() => {

    fetch(`/api/products/${slug}/`)
      .then(res => { if (!res.ok) throw new Error('Not found'); return res.json(); })
      .then(data => { setProduct(data); if (data.colors?.length > 0) setSelectedColor(data.colors[0]); })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  const { products: allProducts } = useProducts();
  const { settings } = useStoreSettings();
  const location = useLocation();

  const [isEnquiring, setIsEnquiring] = useState(false);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to continue your purchase.", { icon: '🔒' });
      navigate('/login', { state: { from: location } });
      return;
    }
    await addToCart(product, selectedColor, 1);
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to continue your purchase.", { icon: '🔒' });
      navigate('/login', { state: { from: location } });
      return;
    }
    // Instant Checkout: bypass cart, go straight to checkout with single item state
    navigate('/checkout', {
      state: {
        instantCheckoutItem: {
          product: product.id,
          selected_color: selectedColor?.name || '',
          quantity: 1,
          product_details: product
        }
      }
    });
  };


  const handleWhatsApp = async () => {
    if (!settings?.whatsapp) return;
    setIsEnquiring(true);
    
    try {
      // Track enquiry count
      await fetch(`/api/products/${product.id}/track_enquiry/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
    } catch (e) {
      console.error("Failed to track enquiry", e);
    }

    const number = settings.whatsapp.replace(/[^0-9]/g, '');
    const priceStr = product.discount_price ? `₹${product.discount_price}` : `₹${product.price}`;
    const link = window.location.href;
    const mainImage = product.images?.find(i => i.is_main)?.image || product.images?.[0]?.image || '';
    
    // Auto generated message format
    let message = `Hello Case Factory 👋

I'm interested in this product:

📦 Product: ${product.title}
💰 Price: ${priceStr}`;

    if (product.badge_text) {
      message += `\n🔥 Status: ${product.badge_text.toUpperCase()}`;
    }
    if (selectedColor) {
      message += `\n🎨 Color: ${selectedColor.name}`;
    }
    if (product.category_slug) {
      message += `\n📱 Category: ${product.category_slug.replace(/-/g, ' ')}`;
    }
    
    message += `

🖼 Product Image:
${mainImage}

🔗 Product Page:
${link}

I would like to know more details.`;

    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, '_blank');
    setIsEnquiring(false);
  };

  const handleCall = () => {
    if (!settings?.phone) return;
    const number = settings.phone.replace(/[^0-9+]/g, '');
    window.location.href = `tel:+${number.replace(/\+/g, '')}`;
  };

  const relatedProducts    = allProducts.filter(p => p.category_slug === product?.category_slug && p.slug !== product?.slug).slice(0, 4);
  const exploreMoreProducts = allProducts.filter(p => p.slug !== product?.slug && !relatedProducts.find(rp => rp.id === p.id)).slice(0, 8);

  if (loading || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#050505' }}>
        <div className="relative w-10 h-10">
          <div className="w-10 h-10 rounded-full animate-spin" style={{ border: '2px solid rgba(124,58,237,0.20)', borderTopColor: '#A855F7' }} />
          <div className="absolute inset-0 rounded-full animate-ping" style={{ border: '1px solid rgba(124,58,237,0.10)', animationDuration: '1.5s' }} />
        </div>
      </div>
    );
  }

  const allImages = product.images?.sort((a, b) => b.is_main - a.is_main || a.display_order - b.display_order) || [];
  const themeColor = product.theme_color || '#7C3AED';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2, ease: "easeOut" }} className="min-h-screen text-white font-sans pb-20" style={{ background: '#050505', selection: hexToRgba(themeColor, 0.35) }}>

      {/* Ambient glow fixed to top-right */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] pointer-events-none" style={{ background: `radial-gradient(circle, ${hexToRgba(themeColor, 0.10)} 0%, transparent 70%)`, zIndex: 0 }} />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] pointer-events-none" style={{ background: `radial-gradient(circle, ${hexToRgba(themeColor, 0.06)} 0%, transparent 70%)`, zIndex: 0 }} />



      <main className="relative z-10 max-w-7xl mx-auto pt-28 pb-10 px-4 sm:px-6 lg:px-8">
        
        <FloatingBackButton themeColor={themeColor} />

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

          {/* LEFT: Image Gallery */}
          <div className="w-full lg:w-1/2 flex flex-col lg:flex-row gap-4 lg:h-[85vh] lg:sticky lg:top-24">

            {/* Thumbnails - Desktop */}
            <div className="hidden lg:flex flex-col gap-3 w-20 overflow-y-auto no-scrollbar py-2">
              {allImages.map((img, idx) => (
                <button key={idx} onClick={() => setActiveImageIndex(idx)}
                  className="w-full aspect-[9/16] rounded-xl overflow-hidden transition-all duration-300"
                  style={{
                    border: activeImageIndex === idx ? `2px solid ${hexToRgba(themeColor, 0.70)}` : '2px solid transparent',
                    opacity: activeImageIndex === idx ? 1 : 0.38,
                    boxShadow: activeImageIndex === idx ? `0 0 16px ${hexToRgba(themeColor, 0.40)}` : 'none',
                  }}
                  onMouseEnter={e => { if (activeImageIndex !== idx) e.currentTarget.style.opacity = '0.80'; }}
                  onMouseLeave={e => { if (activeImageIndex !== idx) e.currentTarget.style.opacity = '0.38'; }}
                >
                  <img src={img.image} alt="Thumbnail" className="w-full h-full object-cover img-crisp" />
                </button>
              ))}
            </div>

            <div className="flex-1 flex flex-col gap-4">
              {/* Main image */}
              <div
                className="w-full h-[45vh] sm:h-[55vh] lg:h-full relative rounded-3xl overflow-hidden flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${hexToRgba(themeColor, 0.06)} 0%, rgba(255,255,255,0.02) 60%, ${hexToRgba(themeColor, 0.04)} 100%)`,
                  border: `1px solid ${hexToRgba(themeColor, 0.22)}`,
                  boxShadow: `0 0 80px ${hexToRgba(themeColor, 0.10)}, inset 0 0 80px ${hexToRgba(themeColor, 0.04)}, 0 20px 60px rgba(0,0,0,0.8)`,
                  backdropFilter: 'blur(8px)',
                }}
              >
                {/* Ambient corners */}
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: hexToRgba(themeColor, 0.10), filter: 'blur(80px)' }} />
                <div className="absolute bottom-[-10%] left-[-20%] w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: hexToRgba(themeColor, 0.07), filter: 'blur(70px)' }} />

                <AnimatePresence mode="wait">
                  {allImages.length > 0 ? (
                    <motion.img
                      key={activeImageIndex}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      layoutId={`product-image-${product.id}`}
                      src={allImages[activeImageIndex]?.image}
                      alt={product.title}
                      className="w-full h-full object-contain p-4 drop-shadow-2xl img-crisp"
                    />
                  ) : (
                    <div style={{ color: 'rgba(192,132,252,0.25)' }}>No image available</div>
                  )}
                </AnimatePresence>

                {/* Badge */}
                {product.badge_text && (
                  <motion.div layoutId={`product-badge-${product.id}`} className="absolute top-6 left-6 px-3 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest"
                    style={{ background: hexToRgba(themeColor, 0.25), border: `1px solid ${hexToRgba(themeColor, 0.45)}`, color: themeColor, backdropFilter: 'blur(8px)', boxShadow: `0 0 20px ${hexToRgba(themeColor, 0.30)}` }}>
                    {product.badge_text}
                  </motion.div>
                )}

                {/* Mobile swipe */}
                <div className="absolute inset-y-0 left-0 w-1/4 z-10" onClick={() => setActiveImageIndex(p => Math.max(0, p - 1))} />
                <div className="absolute inset-y-0 right-0 w-1/4 z-10" onClick={() => setActiveImageIndex(p => Math.min(allImages.length - 1, p + 1))} />
              </div>

              {/* Thumbnails - Mobile */}
              <div className="flex lg:hidden flex-row gap-3 w-full overflow-x-auto snap-x no-scrollbar py-2">
                {allImages.map((img, idx) => (
                  <button key={`mob-${idx}`} onClick={() => setActiveImageIndex(idx)}
                    className="flex-shrink-0 w-20 aspect-[9/16] rounded-xl overflow-hidden transition-all duration-300 snap-center"
                    style={{
                      border: activeImageIndex === idx ? `2px solid ${hexToRgba(themeColor, 0.70)}` : '2px solid transparent',
                      opacity: activeImageIndex === idx ? 1 : 0.38,
                      boxShadow: activeImageIndex === idx ? `0 0 16px ${hexToRgba(themeColor, 0.40)}` : 'none',
                    }}
                  >
                    <img src={img.image} alt="Thumbnail" className="w-full h-full object-cover img-crisp" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center py-6 lg:py-0">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>

              {/* Category breadcrumb */}
              <p className="text-xs uppercase font-medium mb-4" style={{ letterSpacing: '0.28em', color: hexToRgba(themeColor, 0.55) }}>
                {product.category_slug?.replace(/-/g, ' ')} • Case Factory
              </p>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight mb-4 text-glow">{product.title}</h1>

              <div className="flex items-end gap-4 mb-8">
                {product.discount_price ? (
                  <>
                    <span className="text-2xl sm:text-3xl font-light text-white">₹{product.discount_price}</span>
                    <span className="text-lg sm:text-xl font-light line-through mb-1" style={{ color: 'rgba(255,255,255,0.28)' }}>₹{product.price}</span>
                    {/* Savings badge */}
                    <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold mb-1" style={{ background: hexToRgba(themeColor, 0.20), border: `1px solid ${hexToRgba(themeColor, 0.35)}`, color: themeColor }}>
                      SALE
                    </span>
                  </>
                ) : (
                  <span className="text-2xl sm:text-3xl font-light text-white">₹{product.price}</span>
                )}
              </div>

              {/* Colors */}
              {product.colors?.length > 0 && (
                <div className="mb-10">
                  <h3 className="text-xs uppercase tracking-widest mb-4 flex items-center justify-between" style={{ color: hexToRgba(themeColor, 0.50) }}>
                    <span>Color</span>
                    <span className="text-white">{selectedColor?.name}</span>
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {product.colors.map(color => (
                      <button key={color.id} onClick={() => setSelectedColor(color)}
                        className="w-12 h-12 rounded-full p-1 transition-all duration-300"
                        style={{
                          border: selectedColor?.id === color.id ? `2px solid ${hexToRgba(themeColor, 0.70)}` : '2px solid transparent',
                          boxShadow: selectedColor?.id === color.id ? `0 0 16px ${hexToRgba(themeColor, 0.40)}` : 'none',
                          transform: selectedColor?.id === color.id ? 'scale(1.12)' : 'scale(1)',
                        }}
                      >
                        <div className="w-full h-full rounded-full shadow-inner" style={{ backgroundColor: color.hex_code }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12 mt-8">
                {product.is_sold_out || product.stock <= 0 ? (
                  <button
                    disabled
                    className="flex-1 h-14 rounded-2xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-white/50 cursor-not-allowed"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    SOLD OUT
                  </button>
                ) : (
                  <div className="flex flex-col flex-1 gap-4">
                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                      {/* Buy Now -> directly to checkout */}
                      <button
                        onClick={handleBuyNow}
                        className="flex-1 h-14 rounded-2xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest transition-all duration-300 text-white shadow-lg relative overflow-hidden group"
                        style={{
                          background: 'linear-gradient(135deg, #7C3AED 0%, #C084FC 100%)',
                          boxShadow: '0 8px 32px rgba(124,58,237, 0.4)',
                        }}
                        onMouseEnter={e => { 
                          e.currentTarget.style.boxShadow = '0 12px 40px rgba(124,58,237, 0.6)';
                        }}
                        onMouseLeave={e => { 
                          e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237, 0.4)';
                        }}
                      >
                        <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        Buy Now
                      </button>

                      {product.is_booking_enabled && (
                        <button
                          onClick={() => {
                            if (!isAuthenticated) {
                              toast.error("Please sign in to book.", { icon: '🔒' });
                              navigate('/login', { state: { from: location } });
                              return;
                            }
                            setIsBookingOpen(true);
                          }}
                          className="flex-1 h-14 rounded-2xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest transition-all duration-300 text-white shadow-lg relative overflow-hidden group"
                          style={{
                            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
                          }}
                        >
                          BOOK NOW
                        </button>
                      )}

                      {!product.is_booking_enabled && (
                        <button
                          onClick={handleAddToCart}
                          className="flex-1 sm:flex-none sm:w-auto sm:px-8 h-14 rounded-2xl flex items-center justify-center gap-3 font-semibold transition-all duration-300"
                          style={{
                            background: 'rgba(124,58,237,0.15)',
                            border: '1px solid rgba(124,58,237,0.4)',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.25)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.15)' }}
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                    
                    {product.is_booking_enabled && (
                      <button
                        onClick={handleAddToCart}
                        className="w-full h-14 rounded-2xl flex items-center justify-center gap-3 font-semibold transition-all duration-300"
                        style={{
                          background: 'rgba(124,58,237,0.15)',
                          border: '1px solid rgba(124,58,237,0.4)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.25)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.15)' }}
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                )}
                
                {/* WhatsApp Enquiry (Icon only for space) */}
                <button onClick={handleWhatsApp} disabled={isEnquiring}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 text-white shadow-lg"
                  style={{
                    background: 'rgba(37, 211, 102, 0.15)',
                    border: '1px solid rgba(37, 211, 102, 0.4)',
                  }}
                  title="Enquire on WhatsApp"
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(37, 211, 102, 0.3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(37, 211, 102, 0.15)'}
                >
                  {isEnquiring ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <MessageCircle size={22} style={{ color: '#25D366' }} />
                  )}
                </button>
              </div>

              {/* Description & Details */}
              <div className="space-y-10 pt-10" style={{ borderTop: `1px solid ${hexToRgba(themeColor, 0.14)}` }}>
                {product.full_description && (
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: themeColor, letterSpacing: '0.22em', fontSize: '10px' }}>The Details</h3>
                    <p className="font-light leading-relaxed text-sm lg:text-base" style={{ color: 'rgba(255,255,255,0.55)' }}>{product.full_description}</p>
                  </div>
                )}

                {product.features && (
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: themeColor, letterSpacing: '0.22em', fontSize: '10px' }}>Key Features</h3>
                    <ul className="space-y-3">
                      {product.features.split('\n').filter(Boolean).map((feat, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                          <Check size={16} className="mt-0.5 flex-shrink-0" style={{ color: themeColor }} />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(product.material || product.compatibility) && (
                  <div className="grid grid-cols-2 gap-6 p-6 rounded-2xl" style={{
                    background: `linear-gradient(135deg, ${hexToRgba(themeColor, 0.08)} 0%, rgba(255,255,255,0.02) 100%)`,
                    border: `1px solid ${hexToRgba(themeColor, 0.20)}`,
                    boxShadow: `inset 0 1px 0 ${hexToRgba(themeColor, 0.08)}`,
                  }}>
                    {product.material && (
                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest mb-1" style={{ color: hexToRgba(themeColor, 0.45) }}>Material</h4>
                        <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.90)' }}>{product.material}</p>
                      </div>
                    )}
                    {product.compatibility && (
                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest mb-1" style={{ color: hexToRgba(themeColor, 0.45) }}>Compatibility</h4>
                        <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.90)' }}>{product.compatibility}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-32 pt-16" style={{ borderTop: `1px solid ${hexToRgba(themeColor, 0.14)}` }}>
            <div className="flex items-center gap-4 mb-10">
              <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${hexToRgba(themeColor, 0.50)})` }} />
              <h2 className="text-2xl font-serif text-white tracking-wide">You May Also Like</h2>
              <div className="h-px flex-1" style={{ background: `linear-gradient(to right, ${hexToRgba(themeColor, 0.20)}, transparent)` }} />
            </div>
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 sm:gap-6 pb-6 no-scrollbar md:grid md:grid-cols-3 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct, idx) => (
                <motion.div key={relatedProduct.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.1 }} className="flex-shrink-0 w-[240px] md:w-auto snap-center">
                  <HotPickCard product={relatedProduct} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* EXPLORE MORE */}
        {exploreMoreProducts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-20 pt-16" style={{ borderTop: `1px solid ${hexToRgba(themeColor, 0.14)}` }}>
            <div className="flex items-center justify-center gap-4 mb-10">
              <h2 className="text-2xl font-serif text-white tracking-wide uppercase">Explore More</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {exploreMoreProducts.map((p, idx) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.1 }}>
                  <HotPickCard product={p} />
                </motion.div>
              ))}
            </div>

            {exploreMoreProducts.length >= 8 && (
              <div className="mt-16 flex justify-center">
                <button onClick={() => navigate('/')} className="px-10 py-4 rounded-full font-semibold uppercase tracking-widest text-sm glass-btn-primary">
                  View Full Collection
                </button>
              </div>
            )}
          </motion.div>
        )}
        <BookingModal 
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          product={product}
          selectedColor={selectedColor}
        />
      </main>
    </motion.div>
  );
}

function BookingModal({ isOpen, onClose, product, selectedColor }) {
  const { customer, getAuthHeaders } = useCustomerAuth();
  const [fullName, setFullName] = useState(customer?.first_name ? `${customer.first_name} ${customer.last_name || ''}`.trim() : (customer?.username || ''));
  const [email, setEmail] = useState(customer?.email || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [customerNote, setCustomerNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (customer) {
      setFullName(customer.first_name ? `${customer.first_name} ${customer.last_name || ''}`.trim() : (customer.username || ''));
      setEmail(customer.email || '');
      if (customer.phone) setPhone(customer.phone);
    }
  }, [customer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !phone || !email) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const authHeaders = getAuthHeaders();
      const res = await fetch('/api/bookings/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({
          product: product.id,
          selected_color: selectedColor?.name || '',
          full_name: fullName,
          email,
          phone,
          customer_note: customerNote
        })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Booking failed');
      }
      setSuccess(true);
    } catch (err) {
      toast.error(err.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
          style={{ background: 'rgba(10, 10, 10, 0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          {/* Ambient top glow */}
          <div className="absolute top-0 inset-x-0 h-1" style={{ background: 'linear-gradient(90deg, transparent, #10B981, transparent)' }} />
          
          {success ? (
            <div className="p-10 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <Check size={40} />
              </div>
              <h3 className="text-3xl font-serif text-white mb-3">Booking Received</h3>
              <p className="text-white/60 mb-10 text-sm leading-relaxed">Our team will contact you as soon as possible.</p>
              <button 
                onClick={onClose}
                className="w-full py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h3 className="text-xl font-serif text-white">Book Product</h3>
                <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="flex items-center gap-4 mb-2 p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="w-12 h-12 bg-black/50 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={product.images?.[0]?.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium line-clamp-1">{product.title}</p>
                    {selectedColor && <p className="text-xs text-white/50">Color: {selectedColor.name}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Full Name *</label>
                  <input 
                    required 
                    type="text" 
                    value={fullName} 
                    onChange={e => setFullName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Email Address *</label>
                  <input 
                    required 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                    placeholder="Enter your email address"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Phone Number *</label>
                  <input 
                    required 
                    type="tel" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                    placeholder="Enter your contact number"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Additional Note</label>
                  <textarea 
                    value={customerNote} 
                    onChange={e => setCustomerNote(e.target.value)}
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 resize-none"
                    placeholder="Any special requests? (Optional)"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full mt-6 py-4 rounded-xl font-bold text-sm tracking-widest uppercase text-white transition-all shadow-lg relative overflow-hidden group disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)' }}
                >
                  <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {submitting ? 'SUBMITTING...' : 'SUBMIT BOOKING REQUEST'}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
