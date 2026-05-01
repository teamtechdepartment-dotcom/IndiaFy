import { create } from 'zustand';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-toastify';

export const useCartStore = create((set, get) => ({
  cartItems: [],
  totalPrice: 0,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get('/customer/cart');
      // res = { statusCode, data: { items, totalPrice }, message }
      const data = res.data || {};
      set({
        cartItems: data.items || [],
        totalPrice: data.totalPrice || 0
      });
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  addToCart: async (productId, quantity = 1) => {
    try {
      const res = await axiosInstance.post('/customer/cart/add', { productId, quantity });
      const data = res.data || {};
      set({
        cartItems: data.items || [],
        totalPrice: data.totalPrice || 0
      });
      toast.success("Added to cart!");
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error(error.response?.data?.message || "Failed to add to cart");
    }
  },

  removeFromCart: async (productId) => {
    try {
      const res = await axiosInstance.delete(`/customer/cart/remove/${productId}`);
      const data = res.data || {};
      set({
        cartItems: data.items || [],
        totalPrice: data.totalPrice || 0
      });
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove item");
    }
  },

  clearCartStore: async () => {
    try {
      await axiosInstance.delete('/customer/cart/clear');
      set({ cartItems: [], totalPrice: 0 });
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  }
}));
