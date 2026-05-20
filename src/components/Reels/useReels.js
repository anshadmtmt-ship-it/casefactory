import { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '../../router/AdminAuthContext';

export function useReels() {
  const [reels, setReels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { token } = useAdminAuth() || {};

  const fetchReels = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/reels/');
      if (!res.ok) throw new Error('Failed to fetch reels');
      const data = await res.json();
      setReels(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  const addReel = useCallback(async (formData) => {
    try {
      const res = await fetch('/api/reels/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to create reel');
      await fetchReels();
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, [token, fetchReels]);

  const updateReel = useCallback(async (id, formData) => {
    try {
      const res = await fetch(`/api/reels/${id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to update reel');
      await fetchReels();
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, [token, fetchReels]);

  const deleteReel = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/reels/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete reel');
      await fetchReels();
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, [token, fetchReels]);

  const toggleActive = useCallback(async (id) => {
    const reel = reels.find(r => r.id === id);
    if (!reel) return;
    
    const formData = new FormData();
    formData.append('is_active', !reel.is_active);
    
    await updateReel(id, formData);
  }, [reels, updateReel]);

  const moveReelUp = useCallback(async (id) => {
    const sorted = [...reels].sort((a, b) => a.display_order - b.display_order);
    const idx = sorted.findIndex((r) => r.id === id);
    if (idx <= 0) return;
    
    const currentReel = sorted[idx];
    const prevReel = sorted[idx - 1];
    
    const currentOrder = currentReel.display_order;
    const prevOrder = prevReel.display_order;

    const currentFormData = new FormData();
    currentFormData.append('display_order', prevOrder);
    
    const prevFormData = new FormData();
    prevFormData.append('display_order', currentOrder);

    await Promise.all([
      updateReel(currentReel.id, currentFormData),
      updateReel(prevReel.id, prevFormData)
    ]);
  }, [reels, updateReel]);

  const moveReelDown = useCallback(async (id) => {
    const sorted = [...reels].sort((a, b) => a.display_order - b.display_order);
    const idx = sorted.findIndex((r) => r.id === id);
    if (idx < 0 || idx >= sorted.length - 1) return;
    
    const currentReel = sorted[idx];
    const nextReel = sorted[idx + 1];
    
    const currentOrder = currentReel.display_order;
    const nextOrder = nextReel.display_order;

    const currentFormData = new FormData();
    currentFormData.append('display_order', nextOrder);
    
    const nextFormData = new FormData();
    nextFormData.append('display_order', currentOrder);

    await Promise.all([
      updateReel(currentReel.id, currentFormData),
      updateReel(nextReel.id, nextFormData)
    ]);
  }, [reels, updateReel]);

  const activeReels = [...reels]
    .filter((r) => r.is_active)
    .sort((a, b) => a.display_order - b.display_order);

  const allReelsSorted = [...reels].sort((a, b) => a.display_order - b.display_order);

  return {
    reels,
    activeReels,
    allReelsSorted,
    isLoading,
    error,
    addReel,
    updateReel,
    deleteReel,
    toggleActive,
    moveReelUp,
    moveReelDown,
    refresh: fetchReels,
  };
}
