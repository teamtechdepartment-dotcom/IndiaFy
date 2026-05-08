import { create } from 'zustand';
import axiosInstance from '../utils/axiosInstance';

export const useWholesaleStore = create((set) => ({
  wholesaleProducts: [],
  distributors: [],
  isLoading: false,
  error: null,

  fetchWholesaleProducts: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { category, search, minQty } = filters;
      const res = await axiosInstance.get('/wholesale/products', {
        params: { category, search, minQty }
      });
      set({ wholesaleProducts: res.data?.data || [] });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch wholesale products' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchDistributors: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get('/wholesale/distributors');
      set({ distributors: res.data?.data || [] });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch distributors' });
    } finally {
      set({ isLoading: false });
    }
  },

  getWholesaleProductById: async (id) => {
    try {
      const res = await axiosInstance.get(`/wholesale/products/${id}`);
      return res.data?.data || null;
    } catch (err) {
      console.error(err);
      return null;
    }
  }
}));
