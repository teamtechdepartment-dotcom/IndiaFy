import { create } from 'zustand';
import axiosInstance from '../utils/axiosInstance';

export const useOrderStore = create((set) => ({
  orders: [],
  sellerOrders: [],
  isLoading: false,
  error: null,

  createOrder: async (orderPayload) => {
    try {
      const res = await axiosInstance.post('/orders', orderPayload);
      // axios interceptor returns response.data = { statusCode, data, message }
      return res.data || res;
    } catch (err) {
      throw err;
    }
  },

  fetchMyOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get('/orders/myorders');
      // res = { statusCode, data: [orders], message }
      const orders = res.data || res || [];
      set({ orders: Array.isArray(orders) ? orders : [] });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch orders' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSellerOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get('/orders/sellerorders');
      const orders = res.data || res || [];
      set({ sellerOrders: Array.isArray(orders) ? orders : [] });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch seller orders' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      await axiosInstance.put(`/orders/${orderId}/status`, { status });
      // update state locally
      set((state) => ({
        sellerOrders: state.sellerOrders.map((o) =>
          o._id === orderId ? { ...o, status } : o
        ),
      }));
    } catch (err) {
      throw err;
    }
  },

  deleteOrder: async (orderId) => {
    try {
      await axiosInstance.delete(`/orders/${orderId}`);
      set((state) => ({
        orders: state.orders.filter((o) => o._id !== orderId)
      }));
    } catch (err) {
      throw err;
    }
  },

  fetchOrderById: async (orderId) => {
    try {
      const res = await axiosInstance.get(`/orders/${orderId}`);
      // res is already unwrapped by axiosInstance interceptor: { statusCode, data, message, success }
      // The actual order object is in res.data
      if (res && res.data) return res.data;
      if (res && res._id) return res; // Already the order object
      return res;
    } catch (err) {
      console.error("fetchOrderById error:", err);
      throw err;
    }
  }
}));
