/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import { create } from 'zustand';
import axiosInstance from '../utils/axiosInstance';

export const useWholesaleStore = create((set, get) => ({
  wholesaleProducts: [],
  distributors: [],
  isLoading: false,
  error: null,
  
  // V3: Filter State
  filters: {
    search: '',
    category: [],
    moq: '',
    location: [],
    rating: '',
    gstVerified: false,
    videoVerified: false,
    delivery: ''
  },

  setFilter: (key, value) => set((state) => ({
    filters: {
      ...state.filters,
      [key]: value
    }
  })),

  clearFilters: () => set({
    filters: {
      search: '',
      category: [],
      moq: '',
      location: [],
      rating: '',
      gstVerified: false,
      videoVerified: false,
      delivery: ''
    }
  }),

  removeFilterArrayItem: (key, valueToRemove) => set((state) => ({
    filters: {
      ...state.filters,
      [key]: state.filters[key].filter(val => val !== valueToRemove)
    }
  })),

  fetchWholesaleProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      // Pass filters to backend if supported, but also we can mock/filter client-side in the component
      const res = await axiosInstance.get('/wholesale/products', {
        params: { 
          search: filters.search || undefined,
          category: filters.category.length > 0 ? filters.category.join(',') : undefined
        }
      });
      set({ wholesaleProducts: res.data?.data || [] });
    } catch (_err) {
      set({ error: _err?.response?.data?.message || 'Failed to fetch wholesale products' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchDistributors: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get('/wholesale/distributors');
      set({ distributors: res.data?.data || [] });
    } catch (_err) {
      set({ error: _err?.response?.data?.message || 'Failed to fetch distributors' });
    } finally {
      set({ isLoading: false });
    }
  },

  getWholesaleProductById: async (id) => {
    try {
      const res = await axiosInstance.get(`/wholesale/products/${id}`);
      return res.data?.data || null;
    } catch (_err) {
      console.error(err);
      return null;
    }
  }
}));
