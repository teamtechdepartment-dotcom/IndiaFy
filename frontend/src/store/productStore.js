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
      // Refresh products after creation
      return res.data;
    } catch (_err) {
      const errorMsg = _err?.response?.data?.message || 'Failed to create product';
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
      console.error(err);
      return null;
    }
  },

  updateProduct: async (id, formData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    } catch (_err) {
      const errorMsg = _err?.response?.data?.message || 'Failed to update product';
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
