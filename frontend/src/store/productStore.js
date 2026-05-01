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
    } catch (err) {
      console.error("Fetch categories failed", err);
    }
  },

  fetchProducts: async (search = '', subCategory = '', sellerId = '') => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get('/products', {
        params: { search, subCategory, sellerId }
      });
      set({ products: res.data || res || [] });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch products' });
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
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create product';
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
    } catch (err) {
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
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update product';
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
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete product';
      set({ error: errorMsg });
      throw new Error(errorMsg);
    } finally {
      set({ isLoading: false });
    }
  }
}));
