import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomerAuth } from '../../../context/CustomerAuthContext';
import { Package, Clock, CheckCircle, Truck, XCircle, X, ChevronRight, Ban, AlertTriangle, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API = '/api';
const POLL_INTERVAL = 30000; // 30 seconds

// ─── Status helpers ────────────────────────────────────────────────────────────
const STATUS_STEPS = ['Pending', 'Approved', 'Shipped', 'Delivered'];

const STATUS_META = {
  Pending:   { color: '#F97316', glow: 'rgba(249,115,22,0.35)',  icon: Clock,        label: 'Order Placed'  },
  Approved:  { color: '#A855F7', glow: 'rgba(168,85,247,0.35)',  icon: CheckCircle,  label: 'Approved'      },
  Shipped:   { color: '#3B82F6', glow: 'rgba(59,130,246,0.35)',  icon: Truck,        label: 'Shipped'       },
  Delivered: { color: '#22C55E', glow: 'rgba(34,197,94,0.35)',   icon: CheckCircle,  label: 'Delivered'     },
  Rejected:  { color: '#EF4444', glow: 'rgba(239,68,68,0.35)',   icon: XCircle,      label: 'Rejected'      },
  Cancelled: { color: '#EF4444', glow: 'rgba(239,68,68,0.35)',   icon: Ban,          label: 'Cancelled'     },
};

function getStatusMeta(s) { return STATUS_META[s] || STATUS_META.Pending; }

function statusBadge(s) {
  const m = getStatusMeta(s);
  return {
    color: m.color,
    background: `${m.glow}`,
    border: `1px solid ${m.color}55`,
  };
}

// ─── Animated Timeline ─────────────────────────────────────────────────────────
function OrderTimeline({ status, adminNotes, cancelReason, cancelledAt }) {
  // Special: Cancelled order — show partial timeline + red cancelled node
  if (status === 'Cancelled') {
    return (
      <div className="space-y-3">
        {/* Completed steps before cancellation (just Order Placed) */}
        <div className="flex gap-4">
          <div className="flex flex-col items-center" style={{ width: 32, flexShrink: 0 }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center z-10"
              style={{ background: 'rgba(249,115,22,0.15)', border: '2px solid #F97316' }}>
              <CheckCircle size={14} style={{ color: '#F97316' }} />
            </div>
            <div className="flex-1 w-0.5 my-1" style={{ minHeight: 24, background: 'linear-gradient(to bottom, #F97316, rgba(239,68,68,0.4))' }} />
          </div>
          <div className="pb-4">
            <p className="text-sm font-semibold text-white/70">Order Placed</p>
          </div>
        </div>

        {/* Cancelled node */}
        <div className="flex gap-4">
          <div className="flex flex-col items-center" style={{ width: 32, flexShrink: 0 }}>
            <motion.div
              animate={{ boxShadow: ['0 0 0px rgba(239,68,68,0.4)', '0 0 20px rgba(239,68,68,0.5)', '0 0 8px rgba(239,68,68,0.4)'] }}
              transition={{ duration: 1.8, repeat: Infinity, repeatType: 'loop' }}
              className="w-8 h-8 rounded-full flex items-center justify-center z-10"
              style={{ background: 'rgba(239,68,68,0.15)', border: '2px solid #EF4444' }}>
              <Ban size={14} style={{ color: '#EF4444' }} />
            </motion.div>
          </div>
          <div>
            <p className="text-sm font-bold text-red-400">Order Cancelled</p>
            {cancelledAt && (
              <p className="text-xs text-red-400/60 mt-0.5">
                {new Date(cancelledAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
            {cancelReason && (
              <div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <p className="text-[10px] text-red-400/60 uppercase tracking-widest mb-1">Cancellation Reason</p>
                <p className="text-sm text-red-300/90">{cancelReason}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'Rejected') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
        <XCircle size={20} style={{ color: '#EF4444' }} />
        <span className="text-sm font-semibold text-red-400">Order Rejected</span>
      </div>
    );
  }

  const currentIdx = STATUS_STEPS.indexOf(status);

  return (
    <div className="relative">
      {STATUS_STEPS.map((step, idx) => {
        const meta = STATUS_META[step];
        const Icon = meta.icon;
        const isActive = idx === currentIdx;
        const isDone = idx < currentIdx;
        const isPending = idx > currentIdx;
        const isLast = idx === STATUS_STEPS.length - 1;

        return (
          <div key={step} className="flex gap-4" style={{ minHeight: isLast ? 'auto' : '64px' }}>
            {/* Dot + line column */}
            <div className="flex flex-col items-center" style={{ width: 32, flexShrink: 0 }}>
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? [1, 1.2, 1] : 1,
                  boxShadow: isActive ? [`0 0 0px ${meta.glow}`, `0 0 20px ${meta.glow}`, `0 0 8px ${meta.glow}`] : 'none',
                }}
                transition={{ duration: 1.5, repeat: isActive ? Infinity : 0, repeatType: 'loop' }}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                style={{
                  background: isPending ? 'rgba(255,255,255,0.05)' : `${meta.color}22`,
                  border: `2px solid ${isPending ? 'rgba(255,255,255,0.1)' : meta.color}`,
                }}
              >
                {isDone ? (
                  <CheckCircle size={14} style={{ color: meta.color }} />
                ) : isActive ? (
                  <Icon size={14} style={{ color: meta.color }} />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                )}
              </motion.div>

              {!isLast && (
                <div className="flex-1 w-0.5 my-1" style={{ background: isDone ? `linear-gradient(to bottom, ${meta.color}, ${STATUS_META[STATUS_STEPS[idx+1]].color}44)` : 'rgba(255,255,255,0.08)' }} />
              )}
            </div>

            {/* Label */}
            <div className={`pb-4 ${isLast ? '' : ''}`}>
              <p className="text-sm font-semibold" style={{ color: isPending ? 'rgba(255,255,255,0.25)' : isActive ? meta.color : 'rgba(255,255,255,0.7)' }}>
                {meta.label}
              </p>
              {isActive && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs mt-0.5" style={{ color: `${meta.color}99` }}>
                  {step === 'Pending' ? 'Awaiting approval' : step === 'Approved' ? 'Being prepared for shipping' : step === 'Shipped' ? 'In transit to you' : 'Order complete!'}
                </motion.p>
              )}
              {isActive && adminNotes && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Admin Note</p>
                  <p className="text-sm text-white/80">{adminNotes}</p>
                </motion.div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Order Card ────────────────────────────────────────────────────────────────
function OrderCard({ order, onClick }) {
  const meta = getStatusMeta(order.status);
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="group cursor-pointer p-5 rounded-2xl transition-all duration-300"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(124,58,237,0.1)' }}
      whileHover={{ scale: 1.005, borderColor: 'rgba(124,58,237,0.3)', background: 'rgba(255,255,255,0.05)' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-mono text-xs font-bold" style={{ color: '#C084FC' }}>{order.order_id}</span>
            <span className="text-white/30 text-xs">{new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>

          {/* Product images row */}
          <div className="flex gap-2 mb-3">
            {order.items?.slice(0, 4).map((item, idx) => (
              <div key={idx} className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {item.product_image ? (
                  <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Package size={16} className="text-white/20" /></div>
                )}
              </div>
            ))}
            {order.items?.length > 4 && (
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xs font-bold text-white/40"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                +{order.items.length - 4}
              </div>
            )}
          </div>

          <p className="text-sm text-white/50">
            {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''} &bull;{' '}
            <span className="text-white font-semibold">₹{order.total_amount}</span>
          </p>
        </div>

        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide"
            style={statusBadge(order.status)}>
            <Icon size={12} style={{ color: meta.color }} />
            <span style={{ color: meta.color }}>{order.status}</span>
          </div>
          <ChevronRight size={16} className="text-white/20 group-hover:text-white/60 transition-colors" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Cancel Order Modal ─────────────────────────────────────────────────────────
const CANCEL_REASONS = [
  'Ordered by mistake',
  'Wrong address entered',
  'Payment issue',
  'Changed my mind',
  'Found a better product',
  'Delivery time is too long',
  'Other',
];

function CancelOrderModal({ order, onClose, onCancelled }) {
  const { getAuthHeaders } = useCustomerAuth();
  const [reason, setReason] = useState('');
  const [otherText, setOtherText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const finalReason = reason === 'Other' ? otherText.trim() : reason;

  const handleSubmit = async () => {
    if (!finalReason) {
      toast.error('Please select or enter a cancellation reason.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post(
        `${API}/orders/${order.id}/cancel/`,
        { cancel_reason: finalReason },
        { headers: getAuthHeaders() }
      );
      toast.success('Order cancelled successfully.');
      onCancelled(res.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        className="w-full max-w-md rounded-3xl p-6 relative"
        style={{ background: 'linear-gradient(135deg, #0D0518 0%, #0A0310 100%)', border: '1px solid rgba(239,68,68,0.25)', boxShadow: '0 0 60px rgba(239,68,68,0.1)' }}
      >
        {/* Header shimmer */}
        <div className="absolute top-0 left-0 right-0 h-px rounded-t-3xl" style={{ background: 'linear-gradient(to right, transparent, rgba(239,68,68,0.5), transparent)' }} />

        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <AlertTriangle size={22} style={{ color: '#EF4444' }} />
          </div>
          <div>
            <h3 className="text-lg font-serif text-white">Cancel Order?</h3>
            <p className="text-xs text-white/40 mt-1 font-mono">{order.order_id}</p>
          </div>
          <button onClick={onClose} className="ml-auto w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <p className="text-sm text-white/60 mb-5 leading-relaxed">
          Once cancelled, this order <span className="text-white/90 font-semibold">cannot be reversed</span>. Please select a reason below.
        </p>

        {/* Reason select */}
        <div className="relative mb-4">
          <select
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl text-sm text-white outline-none appearance-none cursor-pointer transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${reason ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'}`, color: reason ? '#fff' : 'rgba(255,255,255,0.4)' }}
          >
            <option value="" style={{ background: '#0D0518', color: '#aaa' }}>Select a reason...</option>
            {CANCEL_REASONS.map(r => (
              <option key={r} value={r} style={{ background: '#0D0518', color: '#fff' }}>{r}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
        </div>

        {/* Other textarea */}
        <AnimatePresence>
          {reason === 'Other' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
              <textarea
                value={otherText}
                onChange={e => setOtherText(e.target.value)}
                rows={3}
                placeholder="Please describe your reason..."
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none resize-none transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(239,68,68,0.3)', color: '#fff' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} disabled={submitting}
            className="flex-1 py-3.5 rounded-xl text-sm font-semibold text-white/70 transition-all hover:bg-white/10"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            Keep Order
          </button>
          <button onClick={handleSubmit} disabled={submitting || !finalReason}
            className="flex-1 py-3.5 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2"
            style={{ background: submitting || !finalReason ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.8)', border: '1px solid rgba(239,68,68,0.5)', opacity: !finalReason ? 0.5 : 1 }}>
            {submitting ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <><Ban size={14} /> Confirm Cancel</>}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Order Detail Drawer ───────────────────────────────────────────────────────
function OrderDrawer({ order, onClose, onArchive, onOrderUpdated }) {
  const { getAuthHeaders } = useCustomerAuth();
  const meta = getStatusMeta(order.status);
  const [showConfirm, setShowConfirm] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const canCancel = order.status === 'Pending' || order.status === 'Approved';

  const handleArchive = async () => {
    setArchiving(true);
    try {
      await axios.post(`${API}/orders/${order.id}/archive/`, {}, { headers: getAuthHeaders() });
      toast.success('Order archived permanently.');
      onArchive(order.id);
      onClose();
    } catch {
      toast.error('Failed to archive order.');
      setArchiving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 200 }}
        className="relative w-full max-w-lg h-full flex flex-col overflow-hidden"
        style={{ background: '#07030F', borderLeft: '1px solid rgba(124,58,237,0.2)' }}
      >
        {/* Top shimmer */}
        <div className="h-px w-full" style={{ background: 'linear-gradient(to right, transparent, rgba(192,132,252,0.5), transparent)' }} />

        {/* Header */}
        <div className="flex items-center justify-between p-6 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Order Details</p>
            <h2 className="text-lg font-mono font-bold" style={{ color: '#C084FC' }}>{order.order_id}</h2>
            <p className="text-xs text-white/40 mt-0.5">{new Date(order.created_at).toLocaleString('en-IN')}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(124,58,237,0.3) transparent' }}>

          {/* Status + Timeline */}
          <div>
            <p className="text-xs uppercase font-semibold tracking-widest mb-4" style={{ color: 'rgba(192,132,252,0.5)' }}>Order Status</p>
            <OrderTimeline
              status={order.status}
              adminNotes={order.admin_notes}
              cancelReason={order.cancel_reason}
              cancelledAt={order.cancelled_at}
            />
          </div>

          {/* Cancel Order Section */}
          {canCancel && (
            <div className="p-4 rounded-2xl" style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white/80">Need to cancel?</p>
                  <p className="text-xs text-white/40 mt-0.5">You can cancel before shipping begins.</p>
                </div>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.3)' }}
                >
                  <Ban size={14} /> Cancel Order
                </button>
              </div>
            </div>
          )}

          {/* Locked notice after shipping */}
          {(order.status === 'Shipped' || order.status === 'Delivered') && (
            <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Truck size={16} className="text-white/30 flex-shrink-0" />
              <p className="text-xs text-white/40">Order can no longer be cancelled after shipping.</p>
            </div>
          )}

          {/* Tracking Information */}
          {(order.tracking_number || order.admin_notes || order.status === 'Shipped' || order.status === 'Delivered') && (
            <div>
              <p className="text-xs uppercase font-semibold tracking-widest mb-4" style={{ color: 'rgba(192,132,252,0.5)' }}>Tracking Information</p>
              <div className="p-5 rounded-2xl space-y-4" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)' }}>
                {order.tracking_number && (
                  <div>
                    <p className="text-xs text-blue-400/70 uppercase tracking-widest mb-1">Courier / Tracking Number</p>
                    <p className="font-mono text-blue-300 text-base font-medium tracking-wide">{order.tracking_number}</p>
                  </div>
                )}
                {order.admin_notes && (
                  <div>
                    <p className="text-xs text-blue-400/70 uppercase tracking-widest mb-1">Latest Update / Note</p>
                    <p className="text-blue-200/80 text-sm leading-relaxed">{order.admin_notes}</p>
                  </div>
                )}
                <div className="pt-2 border-t border-blue-500/10">
                  <p className="text-xs text-blue-400/70 uppercase tracking-widest mb-1">Shipping Status</p>
                  <p className="text-blue-300 text-sm font-semibold">{order.status === 'Shipped' ? 'In Transit' : order.status === 'Delivered' ? 'Delivered' : 'Awaiting Shipment'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Items */}
          <div>
            <p className="text-xs uppercase font-semibold tracking-widest mb-4" style={{ color: 'rgba(192,132,252,0.5)' }}>Ordered Items ({order.items?.length})</p>
            <div className="space-y-4">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex gap-5 p-5 rounded-2xl transition-colors hover:bg-white/5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    {item.product_image ? (
                      <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Package size={24} className="text-white/20" /></div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <p className="text-base font-semibold text-white line-clamp-2">{item.product_name}</p>
                    {item.selected_color && <p className="text-sm text-white/50 mt-1">Variant/Model: <span className="text-white/80">{item.selected_color}</span></p>}
                    
                    <div className="flex justify-between items-end mt-4">
                      <div>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest mb-0.5">Unit Price & Qty</p>
                        <p className="text-sm text-white/70 font-medium">₹{item.price} <span className="text-white/30 mx-1">x</span> {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-white/40 uppercase tracking-widest mb-0.5">Subtotal</p>
                        <p className="text-lg font-bold" style={{ color: '#C084FC' }}>₹{(item.price * item.quantity).toFixed(0)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping */}
          <div>
            <p className="text-xs uppercase font-semibold tracking-widest mb-4" style={{ color: 'rgba(192,132,252,0.5)' }}>Shipping Address</p>
            <div className="p-5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="font-semibold text-white mb-1">{order.full_name}</p>
              <p className="text-sm text-white/60">{order.address}</p>
              <p className="text-sm text-white/60">{order.city}, {order.state} — {order.pincode}</p>
              <p className="text-sm text-white/40 mt-2">{order.phone}</p>
            </div>
          </div>

          {/* Payment Summary */}
          <div>
            <p className="text-xs uppercase font-semibold tracking-widest mb-4" style={{ color: 'rgba(192,132,252,0.5)' }}>Payment Summary</p>
            <div className="p-5 rounded-xl" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)' }}>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60">Total Amount</span>
                <span className="text-2xl font-serif font-medium" style={{ color: '#C084FC' }}>₹{order.total_amount}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-white/40">Shipping</span>
                <span className="text-xs text-emerald-400 font-semibold">FREE</span>
              </div>
            </div>
          </div>
          
          {/* Archive Action */}
          {order.status === 'Delivered' && (
            <div className="pt-6">
              <button onClick={() => setShowConfirm(true)} className="w-full py-4 rounded-xl text-sm font-bold tracking-wide transition-all"
                style={{ background: 'rgba(239,68,68,0.05)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                Archive / Delete Order
              </button>
            </div>
          )}

        </div>
        
        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="w-full p-6 rounded-2xl border border-red-500/30 bg-red-950/20 text-center">
                <XCircle size={48} className="mx-auto text-red-500 mb-4" />
                <h3 className="text-lg font-serif text-white mb-2">Delete this order?</h3>
                <p className="text-sm text-white/60 mb-6">Deleting this order will remove tracking history permanently from your account.</p>
                
                <div className="flex gap-3">
                  <button onClick={() => setShowConfirm(false)} disabled={archiving}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold text-white/70 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleArchive} disabled={archiving}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-red-500/80 hover:bg-red-500 transition-colors flex justify-center items-center gap-2">
                    {archiving ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : 'Delete Order'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cancel Order Modal - portal above drawer */}
        <AnimatePresence>
          {showCancelModal && (
            <CancelOrderModal
              order={order}
              onClose={() => setShowCancelModal(false)}
              onCancelled={(updatedOrder) => {
                if (onOrderUpdated) onOrderUpdated(updatedOrder);
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const { getAuthHeaders } = useCustomerAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  const [activeTab, setActiveTab] = useState('All Orders');
  const [searchQuery, setSearchQuery] = useState('');
  
  const TABS = ['All Orders', 'Pending', 'Shipping', 'Delivered', 'Cancelled', 'Bookings'];

  const selectedOrderRef = useRef(null);
  selectedOrderRef.current = selectedOrder;

  const fetchOrders = useCallback(async (silent = false) => {
    try {
      const [ordersRes, bookingsRes] = await Promise.all([
        axios.get(`${API}/orders/`, { headers: getAuthHeaders() }),
        axios.get(`${API}/bookings/`, { headers: getAuthHeaders() })
      ]);
      setOrders(ordersRes.data);
      setBookings(bookingsRes.data);
      // Sync selected order if drawer is open — use ref to avoid dependency
      if (selectedOrderRef.current) {
        const updated = ordersRes.data.find(o => o.id === selectedOrderRef.current.id);
        if (updated) setSelectedOrder(updated);
      }
    } catch (err) {
      if (!silent) toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const handleOrderArchived = (orderId) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const handleOrderUpdated = (updatedOrder) => {
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    setSelectedOrder(updatedOrder);
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(true), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  if (loading) return (
    <div className="min-h-screen pt-28 flex items-center justify-center" style={{ background: '#050508' }}>
      <div className="w-8 h-8 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 text-white" style={{ background: '#050508' }}>
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>
            <Package size={22} style={{ color: '#C084FC' }} />
          </div>
          <div>
            <h1 className="text-2xl font-serif text-white">My Orders & Bookings</h1>
            <p className="text-white/40 text-sm">{orders.length} order{orders.length !== 1 ? 's' : ''}, {bookings.length} booking{bookings.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Filters & Search */}
        {orders.length > 0 && (
          <div className="mb-8 space-y-4">
            <div className="relative max-w-sm">
              <input 
                type="text" 
                placeholder="Search by Order ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-violet-500/50 transition-colors"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70">
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {TABS.map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all"
                  style={{
                    background: activeTab === tab ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.05)',
                    color: activeTab === tab ? '#C084FC' : 'rgba(255,255,255,0.5)',
                    border: `1px solid ${activeTab === tab ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.08)'}`
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Bookings' ? (
          bookings.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="p-16 text-center rounded-3xl"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <Package size={52} className="mx-auto mb-4 text-emerald-500/20" />
              <h2 className="text-xl font-serif mb-2 text-white/60">No bookings yet</h2>
              <p className="text-white/30 text-sm">Your product bookings will appear here.</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {bookings.filter(b => {
                if (searchQuery && !b.product_details?.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                return true;
              }).map((booking, i) => (
                <motion.div key={booking.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <BookingCard booking={booking} onClick={() => setSelectedBooking(booking)} />
                </motion.div>
              ))}
            </div>
          )
        ) : orders.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="p-16 text-center rounded-3xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(124,58,237,0.15)' }}>
            <Package size={52} className="mx-auto mb-4 text-white/15" />
            <h2 className="text-xl font-serif mb-2 text-white/60">No orders yet</h2>
            <p className="text-white/30 text-sm">Your purchases will appear here.</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {orders.filter(order => {
              if (searchQuery && !order.order_id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
              if (activeTab === 'All Orders') return true;
              if (activeTab === 'Pending') return order.status === 'Pending' || order.status === 'Approved';
              if (activeTab === 'Shipping') return order.status === 'Shipped';
              if (activeTab === 'Delivered') return order.status === 'Delivered';
              if (activeTab === 'Cancelled') return order.status === 'Rejected' || order.status === 'Cancelled';
              return true;
            }).map((order, i) => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <OrderCard order={order} onClick={() => setSelectedOrder(order)} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedOrder && <OrderDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} onArchive={handleOrderArchived} onOrderUpdated={handleOrderUpdated} />}
        {selectedBooking && <BookingDrawer booking={selectedBooking} onClose={() => setSelectedBooking(null)} />}
      </AnimatePresence>
    </div>
  );
}
// Insert BookingCard at the bottom or before OrdersPage
function BookingCard({ booking, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="group cursor-pointer p-5 rounded-2xl transition-all duration-300"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(16,185,129,0.1)' }}
      whileHover={{ scale: 1.005, borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(255,255,255,0.05)' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-mono text-xs font-bold text-emerald-400">BK-{booking.id}</span>
            <span className="text-white/30 text-xs">{new Date(booking.created_at).toLocaleDateString()}</span>
          </div>

          <p className="text-sm font-medium text-white mb-1">
            {booking.product_details?.title}
          </p>
          {booking.selected_color && <p className="text-xs text-white/50">Color: {booking.selected_color}</p>}
        </div>

        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide border ${
            booking.status === 'Accepted' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
            booking.status === 'Rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 
            'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
          }`}>
            <span>{booking.status}</span>
          </div>
          <ChevronRight size={16} className="text-white/20 group-hover:text-white/60 transition-colors" />
        </div>
      </div>
    </motion.div>
  );
}

function BookingDrawer({ booking, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 200 }}
        className="relative w-full max-w-lg h-full flex flex-col overflow-hidden"
        style={{ background: '#050508', borderLeft: '1px solid rgba(16,185,129,0.2)' }}
      >
        <div className="flex items-center justify-between p-6 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Booking Details</p>
            <h2 className="text-lg font-mono font-bold text-emerald-400">BK-{booking.id}</h2>
            <p className="text-xs text-white/40 mt-0.5">{new Date(booking.created_at).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-white/10 border border-white/10 bg-white/5">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div>
            <p className="text-xs uppercase font-semibold tracking-widest mb-4 text-emerald-500/50">Status</p>
            <div className={`p-4 rounded-xl border ${
              booking.status === 'Accepted' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
              booking.status === 'Rejected' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 
              'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
            }`}>
              <p className="font-semibold mb-1">{booking.status}</p>
              {booking.status === 'Enquired' && <p className="text-xs opacity-70">We have received your request and will contact you soon.</p>}
            </div>
            {booking.admin_note && (
              <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Note from Staff</p>
                <p className="text-sm text-white/80">{booking.admin_note}</p>
              </div>
            )}
            {booking.rejection_reason && (
              <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-[10px] uppercase tracking-widest text-red-400/60 mb-1">Reason</p>
                <p className="text-sm text-red-400/80">{booking.rejection_reason}</p>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs uppercase font-semibold tracking-widest mb-4 text-emerald-500/50">Product Info</p>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="font-medium text-white mb-2">{booking.product_details?.title}</p>
              {booking.selected_color && <p className="text-sm text-white/50">Color: {booking.selected_color}</p>}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
