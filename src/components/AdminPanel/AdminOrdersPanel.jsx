import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Search, X, CheckCircle, Truck, XCircle, Clock,
  RefreshCw, ChevronDown, User, MapPin, Package, Eye, ZoomIn, ZoomOut, RotateCcw, Smartphone, Archive, Trash2
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAdminAuth } from '../../router/AdminAuthContext';

const API = '/api';
const STATUSES = ['All', 'Pending', 'Approved', 'Shipped', 'Delivered', 'Rejected', 'Cancelled', 'Archived'];

const STATUS_META = {
  Pending:   { color: '#F97316', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.3)',  icon: Clock        },
  Approved:  { color: '#A855F7', bg: 'rgba(168,85,247,0.1)',  border: 'rgba(168,85,247,0.3)',  icon: CheckCircle  },
  Shipped:   { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.3)',  icon: Truck        },
  Delivered: { color: '#22C55E', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.3)',   icon: CheckCircle  },
  Rejected:  { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   icon: XCircle      },
  Cancelled: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   icon: XCircle      },
  Archived:  { color: '#FCD34D', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.3)',  icon: Archive      },
};

function getMeta(s) { return STATUS_META[s] || STATUS_META.Pending; }

function StatusBadge({ status }) {
  const m = getMeta(status);
  const Icon = m.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide"
      style={{ background: m.bg, border: `1px solid ${m.border}`, color: m.color }}>
      <Icon size={11} /> {status}
    </span>
  );
}

// ─── Order Detail Drawer ───────────────────────────────────────────────────────
function OrderDetailDrawer({ order, onClose, onStatusUpdate, onArchive, onDelete, adminToken }) {
  const [newStatus, setNewStatus] = useState(order.status);
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '');
  const [adminNotes, setAdminNotes] = useState(order.admin_notes || '');
  const [updating, setUpdating] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const ACTION_BUTTONS = [
    { status: 'Approved',  label: 'Approve Order',  color: '#A855F7', bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.4)', icon: CheckCircle },
    { status: 'Shipped',   label: 'Mark Shipped',   color: '#3B82F6', bg: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.4)',  icon: Truck       },
    { status: 'Delivered', label: 'Mark Delivered', color: '#22C55E', bg: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.4)',   icon: CheckCircle },
    { status: 'Rejected',  label: 'Reject Order',   color: '#EF4444', bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.4)',   icon: XCircle     },
  ];

  const [refundStatus, setRefundStatus] = useState(order.refund_status || 'not_applicable');
  const [updatingRefund, setUpdatingRefund] = useState(false);

  const handleRefundUpdate = async (newRefundStatus) => {
    setUpdatingRefund(true);
    try {
      const res = await axios.patch(
        `${API}/orders/${order.id}/update_refund_status/`,
        { refund_status: newRefundStatus, admin_notes: adminNotes },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      setRefundStatus(newRefundStatus);
      onStatusUpdate(res.data);
      toast.success('Refund status updated.');
    } catch {
      toast.error('Failed to update refund status.');
    } finally {
      setUpdatingRefund(false);
    }
  };

  const handleAdminArchive = async () => {
    setArchiving(true);
    try {
      const endpoint = order.is_archived ? 'admin_unarchive' : 'admin_archive';
      const res = await axios.post(
        `${API}/orders/${order.id}/${endpoint}/`,
        {},
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      onArchive(res.data);
      toast.success(order.is_archived ? 'Order unarchived.' : 'Order archived.');
    } catch {
      toast.error('Failed to update archive status.');
    } finally {
      setArchiving(false);
    }
  };

  const handleAdminDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(
        `${API}/orders/${order.id}/admin_delete/`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      onDelete(order.id);
      toast.success('Order permanently deleted.');
      onClose();
    } catch {
      toast.error('Failed to delete order.');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleSave = async () => {
    setUpdating(true);
    try {
      const res = await axios.patch(
        `${API}/orders/${order.id}/update_status/`,
        { status: newStatus, tracking_number: trackingNumber, admin_notes: adminNotes },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      onStatusUpdate(res.data);
      toast.success('Order updated successfully.');
    } catch {
      toast.error('Failed to update order.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black/85 backdrop-blur-sm" />

      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 200 }}
        className="relative w-full max-w-xl h-full flex flex-col"
        style={{ background: '#07030F', borderLeft: '1px solid rgba(124,58,237,0.2)' }}
      >
        <div className="h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(192,132,252,0.6), transparent)' }} />

        {/* Header */}
        <div className="flex items-center justify-between p-6 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Order Management</p>
            <h2 className="text-lg font-mono font-bold text-violet-300">{order.order_id}</h2>
            <p className="text-xs text-white/40 mt-0.5">{new Date(order.created_at).toLocaleString('en-IN')}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={newStatus} />
            {order.is_archived && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wide"
                style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', color: '#FCD34D' }}>
                <Archive size={10} /> Archived
              </span>
            )}
            <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(124,58,237,0.3) transparent' }}>

          {/* ── Cancelled State Banner ── */}
          {order.status === 'Cancelled' && (
            <div className="p-5 rounded-xl space-y-4" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <p className="text-sm font-bold text-red-400 flex items-center gap-2">
                <XCircle size={18} /> Order Cancelled
              </p>
              
              <p className="text-xs text-white/50 italic mt-2">This order was cancelled by customer. Order is locked and cannot be updated.</p>
              
              {order.cancel_reason && (
                <div className="mt-4">
                  <p className="text-xs text-red-400/60 uppercase tracking-widest mb-1">Reason:</p>
                  <p className="text-sm text-red-200/90 bg-red-950/20 p-3 rounded-lg border border-red-500/10">{order.cancel_reason}</p>
                </div>
              )}

              {order.cancelled_at && (
                <div className="mt-4">
                  <p className="text-xs text-red-400/60 uppercase tracking-widest mb-1">Cancelled At:</p>
                  <p className="text-sm text-red-300/80">{new Date(order.cancelled_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              )}
            </div>
          )}

          {/* ── Action Buttons ── */}
          {order.status !== 'Cancelled' && (
            <>
              <div>
                <p className="text-xs uppercase font-semibold tracking-widest mb-3 text-white/40">Update Status</p>
                <div className="grid grid-cols-2 gap-3">
              {ACTION_BUTTONS.map(btn => {
                const Icon = btn.icon;
                const isActive = newStatus === btn.status;
                return (
                  <button key={btn.status} onClick={() => setNewStatus(btn.status)}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 relative overflow-hidden"
                    style={{
                      background: isActive ? btn.bg : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isActive ? btn.border : 'rgba(255,255,255,0.08)'}`,
                      color: isActive ? btn.color : 'rgba(255,255,255,0.5)',
                      boxShadow: isActive ? `0 0 20px ${btn.bg}` : 'none',
                    }}>
                    <Icon size={14} />
                    {btn.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Tracking & Notes ── */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs uppercase font-semibold tracking-widest text-white/40 mb-2">Tracking Number</label>
              <input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)}
                placeholder="e.g. IND123456789"
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(124,58,237,0.2)' }}
                onFocus={e => e.target.style.borderColor = 'rgba(168,85,247,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(124,58,237,0.2)'}
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-semibold tracking-widest text-white/40 mb-2">Admin Note to Customer</label>
              <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={3}
                placeholder="Optional message shown to customer..."
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all resize-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(124,58,237,0.2)' }}
                onFocus={e => e.target.style.borderColor = 'rgba(168,85,247,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(124,58,237,0.2)'}
              />
            </div>
            
            <button 
              onClick={handleSave} 
              disabled={updating}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm text-white transition-all overflow-hidden relative group"
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                boxShadow: '0 0 20px rgba(124,58,237,0.3)',
                opacity: updating ? 0.7 : 1,
              }}
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              {updating ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  SAVING...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  SAVE ORDER UPDATE
                </>
              )}
            </button>
          </div>
            </>
          )}

          {/* ── Customer Info ── */}
          <div>
            <p className="text-xs uppercase font-semibold tracking-widest mb-3 text-white/40">Customer</p>
            <div className="p-4 rounded-xl space-y-1" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="font-semibold text-white">{order.full_name}</p>
              <p className="text-sm text-white/50">{order.customer_email || order.email}</p>
              <p className="text-sm text-white/50">{order.phone}</p>
              <p className="text-xs text-white/30 pt-1">{order.address}, {order.city}, {order.state} — {order.pincode}</p>
            </div>
          </div>

          {/* ── Items ── */}
          <div>
            <p className="text-xs uppercase font-semibold tracking-widest mb-3 text-white/40">Ordered Items ({order.items?.length})</p>
            <div className="space-y-2">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0" style={{ background: 'rgba(0,0,0,0.4)' }}>
                    {item.product_image ? (
                      <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : <div className="w-full h-full flex items-center justify-center"><Package size={18} className="text-white/20" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white line-clamp-2">{item.product_name}</p>
                    {item.selected_color && <p className="text-xs text-white/40 mt-0.5">Color: {item.selected_color}</p>}
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-white/40">Qty: {item.quantity}</span>
                      <span className="text-sm font-bold text-violet-400">₹{(parseFloat(item.price) * item.quantity).toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Payment App Used ── */}
          {order.payment_app_name && (
            <div>
              <p className="text-xs uppercase font-semibold tracking-widest mb-3 text-white/40">Payment Method</p>
              <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(124,58,237,0.2)' }}>
                  <Smartphone size={18} className="text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Paid via {order.payment_app_name}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Payment Proof ── */}
          {order.payment_proof?.screenshot && (
            <div>
              <p className="text-xs uppercase font-semibold tracking-widest mb-3 text-white/40">Payment Proof</p>
              <button onClick={() => setShowPayment(true)} className="w-full rounded-xl overflow-hidden relative group"
                style={{ border: '1px solid rgba(124,58,237,0.2)' }}>
                <img src={order.payment_proof.screenshot} alt="Payment proof" className="w-full max-h-64 object-contain" style={{ background: '#000' }} />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Eye size={24} className="text-white" />
                </div>
              </button>
            </div>
          )}

          {/* Total */}
          <div className="p-5 rounded-xl" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">Order Total</span>
              <span className="text-2xl font-serif text-violet-400">₹{order.total_amount}</span>
            </div>
          </div>

          {/* ── Refund Status (admin view) ── */}
          {order.status === 'Cancelled' && (
            <div className="p-5 rounded-xl space-y-4" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <div>
                <p className="text-xs text-red-400/60 uppercase tracking-widest mb-2">Refund Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'not_applicable', label: 'N/A',        color: '#6B7280' },
                    { key: 'pending',        label: 'Pending',    color: '#F97316' },
                    { key: 'processing',     label: 'Processing', color: '#A855F7' },
                    { key: 'completed',      label: 'Completed',  color: '#22C55E' },
                  ].map(r => (
                    <button key={r.key}
                      onClick={() => handleRefundUpdate(r.key)}
                      disabled={updatingRefund}
                      className="py-2 px-3 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: refundStatus === r.key ? `${r.color}20` : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${refundStatus === r.key ? `${r.color}50` : 'rgba(255,255,255,0.08)'}`,
                        color: refundStatus === r.key ? r.color : 'rgba(255,255,255,0.4)',
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Admin Danger Zone ── */}
          <div className="p-5 rounded-xl space-y-3" style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <p className="text-xs uppercase font-semibold tracking-widest" style={{ color: 'rgba(239,68,68,0.6)' }}>Admin Actions</p>
            <div className="flex gap-3">
              <button
                onClick={handleAdminArchive}
                disabled={archiving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200"
                style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#FCD34D', opacity: archiving ? 0.7 : 1 }}
              >
                <Archive size={14} />
                {archiving ? 'Working...' : order.is_archived ? 'Unarchive' : 'Archive Order'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5' }}
              >
                <Trash2 size={14} />
                Delete Order
              </button>
            </div>
            {showDeleteConfirm && (
              <div className="p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <p className="text-sm font-bold text-red-300 mb-1">⚠️ Permanently delete this order?</p>
                <p className="text-xs mb-4" style={{ color: 'rgba(239,68,68,0.5)' }}>This cannot be undone. All order data will be lost forever.</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleAdminDelete}
                    disabled={deleting}
                    className="flex-1 py-2 rounded-lg text-sm font-bold text-white transition-all"
                    style={{ background: '#EF4444', opacity: deleting ? 0.7 : 1 }}
                  >
                    {deleting ? 'Deleting...' : 'Yes, Delete Forever'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </motion.div>

      {/* Full-screen payment view */}
      <AnimatePresence>
        {showPayment && order.payment_proof?.screenshot && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md p-4"
          >
            {/* Top Toolbar */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10 bg-white/5 border border-white/10 rounded-2xl p-2 backdrop-blur-lg">
              <button 
                onClick={() => setZoomScale(prev => Math.min(3, prev + 0.25))}
                className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={18} />
              </button>
              <button 
                onClick={() => setZoomScale(prev => Math.max(0.5, prev - 0.25))}
                className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={18} />
              </button>
              <button 
                onClick={() => setZoomScale(1)}
                className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                title="Reset Zoom"
              >
                <RotateCcw size={16} />
              </button>
              <div className="w-px h-6 bg-white/10 mx-1" />
              <button 
                onClick={() => { setShowPayment(false); setZoomScale(1); }}
                className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Main Interactive Viewer Workspace */}
            <div className="w-full h-full flex items-center justify-center overflow-auto no-scrollbar p-6">
              <motion.img 
                src={order.payment_proof.screenshot} 
                alt="Payment proof zoom view" 
                style={{ 
                  scale: zoomScale,
                  transition: 'transform 0.15s ease-out',
                  cursor: zoomScale > 1 ? 'grab' : 'default'
                }}
                className="max-w-[90%] max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10 bg-black" 
              />
            </div>
            
            {/* Zoom Indicator */}
            <div className="absolute bottom-6 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/50 text-[10px] font-mono uppercase tracking-widest">
              Scale: {Math.round(zoomScale * 100)}%
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AdminOrdersPanel({ isOpen, onClose }) {
  const { token } = useAdminAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const res = await axios.get(`${API}/orders/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch {
      if (!silent) toast.error('Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (isOpen) fetchOrders();
  }, [isOpen]);

  const handleStatusUpdate = (updatedOrder) => {
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    if (selectedOrder?.id === updatedOrder.id) setSelectedOrder(updatedOrder);
  };

  const handleOrderArchive = (updatedOrder) => {
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    if (selectedOrder?.id === updatedOrder.id) setSelectedOrder(updatedOrder);
  };

  const handleOrderDelete = (orderId) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    setSelectedOrder(null);
  };

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    const matchSearch = !q || o.order_id?.toLowerCase().includes(q) || o.full_name?.toLowerCase().includes(q) || o.phone?.includes(q);
    if (filterStatus === 'Archived') return o.is_archived && matchSearch;
    const matchStatus = filterStatus === 'All' || o.status === filterStatus;
    return !o.is_archived && matchStatus && matchSearch;
  });

  const counts = STATUSES.reduce((acc, s) => {
    if (s === 'Archived') acc[s] = orders.filter(o => o.is_archived).length;
    else if (s === 'All') acc[s] = orders.filter(o => !o.is_archived).length;
    else acc[s] = orders.filter(o => !o.is_archived && o.status === s).length;
    return acc;
  }, {});

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex"
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <motion.div
        initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 200 }}
        className="relative w-full max-w-4xl h-full flex flex-col overflow-hidden"
        style={{ background: '#070310', borderRight: '1px solid rgba(124,58,237,0.2)' }}
      >
        <div className="h-px" style={{ background: 'linear-gradient(to right, rgba(192,132,252,0.6), transparent)' }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>
              <ShoppingBag size={18} style={{ color: '#C084FC' }} />
            </div>
            <div>
              <h2 className="text-lg font-serif text-white">Order Management</h2>
              <p className="text-xs text-white/40">{orders.length} total orders</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => fetchOrders()} disabled={refreshing}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <RefreshCw size={15} className={`text-white/60 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <X size={16} className="text-white/60" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 flex-shrink-0 space-y-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order ID, customer name, phone..."
              className="w-full pl-10 pr-4 py-2.5 text-sm text-white rounded-xl outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(124,58,237,0.2)' }}
              onFocus={e => e.target.style.borderColor = 'rgba(168,85,247,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(124,58,237,0.2)'}
            />
          </div>
          {/* Status tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {STATUSES.map(s => {
              const active = filterStatus === s;
              const m = s !== 'All' ? getMeta(s) : null;
              return (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                  style={{
                    background: active ? (m ? m.bg : 'rgba(124,58,237,0.2)') : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${active ? (m ? m.border : 'rgba(124,58,237,0.4)') : 'rgba(255,255,255,0.08)'}`,
                    color: active ? (m ? m.color : '#C084FC') : 'rgba(255,255,255,0.4)',
                  }}>
                  {s} {counts[s] > 0 && <span className="ml-1 opacity-60">({counts[s]})</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(124,58,237,0.3) transparent' }}>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ShoppingBag size={40} className="text-white/10 mb-3" />
              <p className="text-white/30 text-sm">No orders found</p>
            </div>
          ) : (
            filtered.map((order, i) => (
              <motion.div key={order.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                onClick={() => setSelectedOrder(order)}
                className="group p-4 rounded-2xl cursor-pointer transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(124,58,237,0.08)' }}
                whileHover={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(124,58,237,0.25)' }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-xs font-bold text-violet-300">{order.order_id}</span>
                      <span className="text-white/30 text-xs hidden sm:block">{new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <User size={11} className="text-white/30" />
                        <span className="text-sm text-white/70 font-medium">{order.full_name}</span>
                      </div>
                      <span className="text-white/20 text-xs hidden md:block">•</span>
                      <span className="text-sm text-white/40 hidden md:block">{order.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1.5">
                        <Package size={11} className="text-white/30" />
                        <span className="text-xs text-white/40">{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</span>
                      </div>
                      <span className="text-sm font-bold text-white">₹{order.total_amount}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <StatusBadge status={order.status} />
                    {order.is_archived && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', color: '#FCD34D' }}>
                        <Archive size={9} /> Archived
                      </span>
                    )}
                    <span className="text-xs text-violet-400/60 group-hover:text-violet-400 transition-colors">View Details →</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailDrawer
            key={selectedOrder.id}
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onStatusUpdate={handleStatusUpdate}
            onArchive={handleOrderArchive}
            onDelete={handleOrderDelete}
            adminToken={token}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
