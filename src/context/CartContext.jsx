import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useCustomerAuth } from './CustomerAuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const { isAuthenticated, getAuthHeaders, loading } = useCustomerAuth();

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      return;
    }
    try {
      const res = await axios.get('/api/cart/my_cart/', { headers: getAuthHeaders() });
      if (res.data && res.data.items) {
        setCartItems(res.data.items);
      }
    } catch (err) {
      console.error('Failed to fetch cart', err);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchCart();
    }
  }, [isAuthenticated, loading]);

  const addToCart = async (product, color, quantity = 1) => {
    if (!isAuthenticated) {
      return false; // Will handle redirect in component
    }

    try {
      const res = await axios.post('/api/cart/add_item/', {
        product_id: product.id,
        quantity: quantity,
        selected_color: color?.name || ''
      }, { headers: getAuthHeaders() });
      
      setCartItems(res.data.items || []);
      toast.success('Added to cart!');
      return true;
    } catch (err) {
      toast.error('Failed to add item to cart.');
      return false;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const res = await axios.post('/api/cart/remove_item/', {
        item_id: itemId
      }, { headers: getAuthHeaders() });
      setCartItems(res.data.items || []);
    } catch (err) {
      toast.error('Failed to remove item.');
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const res = await axios.post('/api/cart/update_quantity/', {
        item_id: itemId,
        quantity: newQuantity
      }, { headers: getAuthHeaders() });
      setCartItems(res.data.items || []);
    } catch (err) {
      toast.error('Failed to update quantity.');
    }
  };

  const clearCart = async () => {
    try {
      const res = await axios.post('/api/cart/clear/', {}, { headers: getAuthHeaders() });
      setCartItems(res.data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      // product_details is serialized from backend
      const prod = item.product_details;
      if (!prod) return total;
      const price = prod.discount_price || prod.price;
      return total + (parseFloat(price) * item.quantity);
    }, 0).toFixed(2);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
