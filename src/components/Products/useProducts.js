import { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '../../router/AdminAuthContext';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Need token to do mutations if needed, though view says IsAuthenticatedOrReadOnly
  const { token } = useAdminAuth() || {};

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/products/');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = useCallback(async (formData) => {
    try {
      const res = await fetch('/api/products/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData, // FormData because of images
      });
      if (!res.ok) throw new Error('Failed to create product');
      await fetchProducts();
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, [token, fetchProducts]);

  const updateProduct = useCallback(async (slug, formData) => {
    try {
      const res = await fetch(`/api/products/${slug}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to update product');
      await fetchProducts();
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, [token, fetchProducts]);

  const deleteProduct = useCallback(async (slug) => {
    try {
      const res = await fetch(`/api/products/${slug}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to delete product: ${res.status} ${text}`);
      }
      await fetchProducts();
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, [token, fetchProducts]);

  // Provide sorted variations
  const activeProducts = [...products]
    .filter((p) => p.is_active)
    .sort((a, b) => a.display_order - b.display_order);

  const allSorted = [...products].sort((a, b) => a.display_order - b.display_order);

  const productsByCategory = useCallback((slug) =>
    activeProducts.filter((p) => p.category_slug === slug),
  [activeProducts]);

  return {
    products,
    activeProducts,
    allSorted,
    productsByCategory,
    isLoading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    refresh: fetchProducts,
  };
}
