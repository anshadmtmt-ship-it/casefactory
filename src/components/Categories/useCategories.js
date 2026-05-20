import { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '../../router/AdminAuthContext';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { token } = useAdminAuth() || {};

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/categories/');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = useCallback(async (formData) => {
    try {
      const res = await fetch('/api/categories/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to create category');
      await fetchCategories();
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, [token, fetchCategories]);

  const updateCategory = useCallback(async (slug, formData) => {
    try {
      const res = await fetch(`/api/categories/${slug}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to update category');
      await fetchCategories();
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, [token, fetchCategories]);

  const deleteCategory = useCallback(async (slug) => {
    try {
      const res = await fetch(`/api/categories/${slug}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete category');
      await fetchCategories();
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, [token, fetchCategories]);

  const toggleActive = useCallback((slug, currentActive) => {
    const fd = new FormData();
    fd.append('is_active', !currentActive);
    updateCategory(slug, fd);
  }, [updateCategory]);

  const activeCategories = [...categories]
    .filter((c) => c.is_active)
    .sort((a, b) => a.display_order - b.display_order);

  const allSorted = [...categories].sort((a, b) => a.display_order - b.display_order);

  return {
    categories,
    activeCategories,
    allSorted,
    isLoading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleActive,
    refresh: fetchCategories
  };
}
