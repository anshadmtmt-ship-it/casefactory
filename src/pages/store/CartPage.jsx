import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
  
  const hasSoldOutItems = cartItems.some(item => {
    const product = item.product_details;
    return product && (product.is_sold_out || item.quantity > product.stock);
  });
  const { isAuthenticated, loading } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { state: { from: location } });
    }
  }, [loading, isAuthenticated, navigate, location]);

  if (loading) {
    return <div className="min-h-screen bg-[#050505]" />;
  }

  const handleUpdateQuantity = (item, newQty) => {
    if (newQty < 1) return;
    updateQuantity(item.id, newQty);
  };

  const handleRemove = (item) => {
    removeFromCart(item.id);
  };

  return (
    <div className="min-h-screen pt-24 pb-32 lg:pb-20 px-4 sm:px-6 lg:px-8 text-white" style={{ background: '#050505' }}>
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-3xl font-serif tracking-wide">Shopping Cart</h1>
        </div>

        {cartItems.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(124,58,237,0.15)' }}
          >
            <div className="w-24 h-24 mb-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
              <ShoppingBag size={40} className="text-violet-400" />
            </div>
            <h2 className="text-2xl font-serif mb-3">Your cart is empty</h2>
            <p className="text-white/50 mb-8 max-w-sm">Looks like you haven't added anything to your cart yet. Discover our premium collection.</p>
            <Link
              to="/"
              className="px-8 py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-300 flex items-center gap-2 relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, #7C3AED 0%, #C084FC 100%)',
                boxShadow: '0 8px 24px rgba(124,58,237, 0.3)',
              }}
            >
              <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              Browse Cases <ArrowRight size={16} />
            </Link>
          </motion.div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Cart Items List */}
            <div className="w-full lg:w-2/3 space-y-4">
              <AnimatePresence>
                {cartItems.map((item) => {
                  const product = item.product_details;
                  if (!product) return null;
                  const price = parseFloat(product.discount_price || product.price);
                  const subtotal = price * item.quantity;
                  const mainImage = product.images?.[0]?.image || '';
                  const isItemSoldOut = product.is_sold_out || item.quantity > product.stock;

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, height: 0, marginTop: 0, marginBottom: 0, padding: 0 }}
                      className={`p-4 sm:p-6 rounded-3xl flex flex-col sm:flex-row gap-6 relative ${isItemSoldOut ? 'opacity-50 grayscale' : ''}`}
                      style={{ background: 'rgba(255,255,255,0.03)', border: isItemSoldOut ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(124,58,237,0.15)' }}
                    >
                      {isItemSoldOut && (
                        <div className="absolute top-2 right-12 bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border border-red-500/30">
                          Unavailable
                        </div>
                      )}
                      {/* Product Image */}
                      <Link to={`/product_details/${product.slug}`} className="w-full sm:w-32 h-32 rounded-2xl bg-black/50 overflow-hidden flex-shrink-0 border border-white/5 relative group">
                        <img src={mainImage} alt={product.title} className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500" />
                      </Link>

                      {/* Product Info */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <Link to={`/product_details/${product.slug}`} className="text-lg font-medium text-white hover:text-violet-400 transition-colors line-clamp-2 mb-1">
                              {product.title}
                            </Link>
                            {item.selected_color && (
                              <p className="text-sm text-white/50 flex items-center gap-2">
                                Color: <span className="text-white">{item.selected_color}</span>
                              </p>
                            )}
                          </div>
                          <button onClick={() => handleRemove(item)} className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0">
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="flex items-end justify-between mt-6">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-1">
                            <button onClick={() => handleUpdateQuantity(item, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                              <Minus size={14} />
                            </button>
                            <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
                            <button onClick={() => handleUpdateQuantity(item, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                              <Plus size={14} />
                            </button>
                          </div>
                          
                          {/* Price */}
                          <div className="text-right">
                            <p className="text-xl font-bold text-violet-300">₹{subtotal.toFixed(2)}</p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-white/40 mt-1">₹{price.toFixed(2)} each</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-1/3">
              <div className="p-6 sm:p-8 rounded-3xl sticky top-28" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(124,58,237,0.15)' }}>
                <h2 className="text-xl font-serif mb-6">Summary</h2>
                
                <div className="space-y-4 py-4 border-y border-white/10">
                  <div className="flex justify-between text-sm text-white/60">
                    <span>Subtotal</span>
                    <span>₹{getCartTotal()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-white/60">
                    <span>Shipping</span>
                    <span className="text-green-400">Free</span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-6">
                  <span className="text-lg font-medium">Total Amount</span>
                  <span className="text-3xl font-serif text-violet-400">₹{getCartTotal()}</span>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      if (hasSoldOutItems) {
                        toast.error("Please remove sold out items from your cart.");
                        return;
                      }
                      navigate('/checkout');
                    }}
                    disabled={hasSoldOutItems}
                    className="w-full py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group"
                    style={{
                      background: hasSoldOutItems ? 'rgba(124,58,237,0.3)' : 'linear-gradient(135deg, #7C3AED 0%, #C084FC 100%)',
                      boxShadow: hasSoldOutItems ? 'none' : '0 8px 32px rgba(124,58,237, 0.4)',
                      cursor: hasSoldOutItems ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {!hasSoldOutItems && <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    Proceed to Checkout <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="w-full py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-300 text-white/60 hover:text-white"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Mobile Sticky Checkout Button (Visible only when cart not empty) */}
      {cartItems.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 z-40 bg-[#050505]/90 backdrop-blur-md border-t border-white/10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-white/50 uppercase tracking-wider">Total</span>
              <span className="text-xl font-bold text-violet-400">₹{getCartTotal()}</span>
            </div>
            <button
              onClick={() => {
                if (hasSoldOutItems) {
                  toast.error("Please remove sold out items from your cart.");
                  return;
                }
                navigate('/checkout');
              }}
              disabled={hasSoldOutItems}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2"
              style={{
                background: hasSoldOutItems ? 'rgba(124,58,237,0.3)' : 'linear-gradient(135deg, #7C3AED 0%, #C084FC 100%)',
                cursor: hasSoldOutItems ? 'not-allowed' : 'pointer'
              }}
            >
              Checkout <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
