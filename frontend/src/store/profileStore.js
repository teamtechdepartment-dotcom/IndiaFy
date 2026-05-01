import { create } from 'zustand';
import axiosInstance from '../utils/axiosInstance';

export const useProfileStore = create((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get('/customer/profile');
      // res = { statusCode, data: profileObj, message }
      set({ profile: res.data || null });
    } catch (err) {
      console.error("fetchProfile error:", err);
      set({ error: err.response?.data?.message || 'Failed to fetch profile' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (profileData) => {
    try {
      const res = await axiosInstance.put('/customer/profile', profileData);
      // Immediately update with response
      const updated = res.data || res;
      set({ profile: { ...get().profile, ...updated } });
      // Re-fetch to ensure populated fields (like email) are intact
      const freshRes = await axiosInstance.get('/customer/profile');
      set({ profile: freshRes.data || null });
    } catch (err) {
      throw err;
    }
  },

  addAddress: async (addressData) => {
    try {
      const res = await axiosInstance.post('/customer/profile/addresses', addressData);
      // Backend returns the address array in res.data
      const addresses = res.data || [];
      set((state) => ({
        profile: { ...state.profile, address: addresses }
      }));
      return addresses;
    } catch (err) {
      throw err;
    }
  },

  deleteAddress: async (addressId) => {
    try {
      const res = await axiosInstance.delete(`/customer/profile/addresses/${addressId}`);
      // Backend returns the updated address array
      const addresses = res.data || [];
      set((state) => ({
        profile: { ...state.profile, address: addresses }
      }));
      return addresses;
    } catch (err) {
      throw err;
    }
  }
}));
