import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Calendar, CheckCircle, Clock, Package, AlertCircle, ChevronRight, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminAuth } from '../../router/AdminAuthContext';

export default function BookingsAdminPanel({ isOpen, onClose }) {
  const { token } = useAdminAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [search, setSearch] = useState('');

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings/', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();
      setBookings(data);
    } catch (e) {
      toast.error('Could not load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBookings();
    }
  }, [isOpen]);

  const filteredBookings = bookings.filter(b => 
    b.full_name.toLowerCase().includes(search.toLowerCase()) || 
    b.email.toLowerCase().includes(search.toLowerCase()) ||
    b.product_details?.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] bg-[#0a0a0a] overflow-hidden flex"
        >
          {/* Left List */}
          <div className="w-1/3 min-w-[350px] border-r border-white/10 flex flex-col h-full bg-[#0d0d0d]">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-serif text-white mb-1">Booking Requests</h2>
                  <p className="text-sm text-white/40">Manage product bookings</p>
                </div>
                <button onClick={onClose} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search bookings..." 
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loading ? (
                <div className="p-8 text-center text-white/40 animate-pulse">Loading...</div>
              ) : filteredBookings.length === 0 ? (
                <div className="p-8 text-center text-white/40">No bookings found.</div>
              ) : (
                filteredBookings.map(booking => (
                  <button 
                    key={booking.id}
                    onClick={() => setSelectedBooking(booking)}
                    className={`w-full text-left p-4 rounded-xl transition-all border ${selectedBooking?.id === booking.id ? 'bg-violet-500/10 border-violet-500/30' : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-white truncate pr-2">{booking.full_name}</span>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md ${
                        booking.status === 'Enquired' ? 'bg-yellow-500/20 text-yellow-500' :
                        booking.status === 'Accepted' ? 'bg-emerald-500/20 text-emerald-500' :
                        'bg-red-500/20 text-red-500'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="text-xs text-white/50 truncate mb-1">{booking.product_details?.title}</div>
                    <div className="text-[10px] text-white/30">{new Date(booking.created_at).toLocaleDateString()}</div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right Detail */}
          <div className="flex-1 h-full flex flex-col bg-[#050505] overflow-y-auto relative">
            {selectedBooking ? (
              <BookingDetail 
                booking={selectedBooking} 
                token={token}
                onUpdate={(updated) => {
                  setBookings(bookings.map(b => b.id === updated.id ? updated : b));
                  setSelectedBooking(updated);
                }}
              />
            ) : (
              <div className="m-auto text-center text-white/30">
                <Package size={48} className="mx-auto mb-4 opacity-50" />
                <p>Select a booking to view details</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function BookingDetail({ booking, token, onUpdate }) {
  const [status, setStatus] = useState(booking.status);
  const [adminNote, setAdminNote] = useState(booking.admin_note || '');
  const [rejectionReason, setRejectionReason] = useState(booking.rejection_reason || '');
  const [updating, setUpdating] = useState(false);

  // Sync state when booking changes
  useEffect(() => {
    setStatus(booking.status);
    setAdminNote(booking.admin_note || '');
    setRejectionReason(booking.rejection_reason || '');
  }, [booking]);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}/update_status/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          admin_note: adminNote,
          rejection_reason: rejectionReason
        })
      });
      if (!res.ok) throw new Error('Failed to update');
      const data = await res.json();
      toast.success('Booking updated!');
      onUpdate(data);
    } catch (e) {
      toast.error('Update failed.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <h3 className="text-2xl font-serif text-white mb-2">Booking #{booking.id}</h3>
        <p className="text-white/40 flex items-center gap-2 text-sm"><Calendar size={14} /> {new Date(booking.created_at).toLocaleString()}</p>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Customer Info */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h4 className="text-xs uppercase font-semibold tracking-widest text-white/40 mb-4 flex items-center gap-2"><User size={14} /> Customer</h4>
          <div className="space-y-3">
            <div>
              <p className="text-white font-medium">{booking.full_name}</p>
              <p className="text-sm text-white/50">{booking.email}</p>
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Phone</p>
              <p className="text-sm text-white">{booking.phone}</p>
            </div>
            {booking.customer_note && (
              <div>
                <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Customer Note</p>
                <p className="text-sm text-white/80 italic">"{booking.customer_note}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h4 className="text-xs uppercase font-semibold tracking-widest text-white/40 mb-4 flex items-center gap-2"><Package size={14} /> Product Details</h4>
          <div className="space-y-3">
            <p className="text-white font-medium">{booking.product_details?.title}</p>
            {booking.selected_color && (
              <div>
                <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Color Option</p>
                <p className="text-sm text-white">{booking.selected_color}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin Controls */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
        <h4 className="text-xs uppercase font-semibold tracking-widest text-white/40 mb-6 flex items-center gap-2"><CheckCircle size={14} /> Action Controls</h4>
        
        <div className="space-y-6">
          <div>
            <label className="block text-xs uppercase font-semibold tracking-widest text-white/40 mb-2">Booking Status</label>
            <div className="flex gap-2">
              {['Enquired', 'Accepted', 'Rejected'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all border ${
                    status === s 
                      ? (s === 'Accepted' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : s === 'Rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30')
                      : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase font-semibold tracking-widest text-white/40 mb-2">Admin Note (Shown to Customer)</label>
            <textarea 
              value={adminNote} 
              onChange={e => setAdminNote(e.target.value)} 
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
              placeholder="e.g. We have reserved this for you. We will call you soon."
            />
          </div>

          {status === 'Rejected' && (
            <div>
              <label className="block text-xs uppercase font-semibold tracking-widest text-white/40 mb-2">Rejection Reason</label>
              <textarea 
                value={rejectionReason} 
                onChange={e => setRejectionReason(e.target.value)} 
                rows={2}
                className="w-full bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-red-500/50 transition-colors resize-none"
                placeholder="e.g. Product out of stock, cannot deliver to this area, etc."
              />
            </div>
          )}

          <button 
            onClick={handleUpdate}
            disabled={updating}
            className="w-full py-4 rounded-xl font-bold text-sm text-white transition-all bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-[0_0_20px_rgba(124,58,237,0.3)] disabled:opacity-50"
          >
            {updating ? 'SAVING...' : 'SAVE BOOKING UPDATE'}
          </button>
        </div>
      </div>

    </div>
  );
}
