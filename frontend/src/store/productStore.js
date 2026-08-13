/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import { create } from 'zustand';
import axiosInstance from '../utils/axiosInstance';

export const useProductStore = create((set) => ({
  products: [],
  isLoading: false,
  error: null,
  categories: [],

  fetchCategories: async () => {
    try {
      const res = await axiosInstance.get('/products/categories');
      set({ categories: res.data || res || [] });
    } catch (_err) {
      console.error("Fetch categories failed", _err);
    }
  },

  fetchProducts: async (search = '', subCategory = '', sellerId = '', nodeType = '', nodeId = '') => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get('/products', {
        params: { search, subCategory, sellerId, nodeType, nodeId }
      });
      set({ products: res.data || res || [] });
    } catch (_err) {
      set({ error: _err?.response?.data?.message || 'Failed to fetch products' });
    } finally {
      set({ isLoading: false });
    }
  },

  createProduct: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const raw = res?.data || res;
      const created = raw?.data || raw?.product || raw;
      if (created && (created._id || created.id)) {
        const item = created;
        set((state) => ({
          products: [item, ...state.products.filter(p => (p._id || p.id) !== (item._id || item.id))]
        }));
      }
      return created;
    } catch (_err) {
      const errorMsg = _err?.response?.data?.message || _err?.message || 'Failed to create product';
      set({ error: errorMsg });
      throw new Error(errorMsg);
    } finally {
      set({ isLoading: false });
    }
  },

  getProductById: async (id) => {
    try {
      const res = await axiosInstance.get(`/products/${id}`);
      return res.data || res;
    } catch (_err) {
      console.error(_err);
      return null;
    }
  },

  updateProduct: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.put(`/products/${id}`, payload);
      const updated = res.data || res;
      if (updated && (updated._id || updated.id)) {
        const targetId = updated._id || updated.id;
        set((state) => ({
          products: state.products.map(p => (p._id === targetId || p.id === targetId) ? updated : p)
        }));
      }
      return updated;
    } catch (_err) {
      const errorMsg = _err?.response?.data?.message || _err?.message || 'Failed to update product';
      set({ error: errorMsg });
      throw new Error(errorMsg);
    } finally {
      set({ isLoading: false });
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.delete(`/products/${id}`);
      set((state) => ({
        products: state.products.filter((p) => (p._id || p.id) !== id)
      }));
    } catch (_err) {
      const errorMsg = _err?.response?.data?.message || 'Failed to delete product';
      set({ error: errorMsg });
      throw new Error(errorMsg);
    } finally {
      set({ isLoading: false });
    }
  }
}));
