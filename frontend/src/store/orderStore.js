import { create } from 'zustand';
import axiosInstance from '../utils/axiosInstance';

export const useOrderStore = create((set) => ({
  orders: [],
  sellerOrders: [],
  isLoading: false,
  error: null,

  createOrder: async (orderPayload) => {
    const res = await axiosInstance.post('/orders', orderPayload);
    // axios interceptor returns response.data = { statusCode, data, message }
    return res.data || res;
  },

  fetchMyOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get('/orders/myorders');
      // res = { statusCode, data: [orders], message }
      // res could be the array itself, or { data: [...] } due to interceptor behavior
      const orders = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
      set({ orders });
    } catch (_err) {
      set({ error: _err?.response?.data?.message || 'Failed to fetch orders' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSellerOrders: async (nodeType = '', nodeId = '') => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get('/orders/sellerorders', {
        params: { nodeType, nodeId }
      });
      const orders = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
      set({ sellerOrders: orders });
    } catch (_err) {
      set({ error: _err?.response?.data?.message || 'Failed to fetch seller orders' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateOrderStatus: async (orderId, status) => {
    await axiosInstance.put(`/orders/${orderId}/status`, { status });
    // update state locally
    set((state) => ({
      sellerOrders: state.sellerOrders.map((o) =>
        o._id === orderId ? { ...o, status } : o
      ),
    }));
  },

  deleteOrder: async (orderId) => {
    await axiosInstance.delete(`/orders/${orderId}`);
    set((state) => ({
      orders: state.orders.filter((o) => o._id !== orderId)
    }));
  },

  fetchOrderById: async (orderId) => {
    try {
      const res = await axiosInstance.get(`/orders/${orderId}`);
      // res is already unwrapped by axiosInstance interceptor: { statusCode, data, message, success }
      // The actual order object is in res.data
      if (res && res.data) return res.data;
      if (res && res._id) return res; // Already the order object
      return res;
    } catch (_err) {
      console.error("fetchOrderById error:", _err);
      throw _err;
    }
  }
}));
