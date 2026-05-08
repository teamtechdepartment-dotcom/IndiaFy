import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosInstance from '../utils/axiosInstance';

export const useSellerAuthStore = create(
  persist(
    (set) => ({
      user: null, // { id, role, name, email, etc. }
      token: null,
      isAuthenticated: false,

      login: (userData, token) => set({
        user: {
          ...userData,
          role: userData?.role?.toLowerCase() || 'seller'
        },
        token: token,
        isAuthenticated: true
      }),

      logout: async () => {
        try {
          await axiosInstance.post('/seller/auth/logout');
        } catch (err) {
          console.error("Seller logout failed on backend:", err);
        }
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
      },

      fetchMe: async (role) => {
        try {
          const res = await axiosInstance.get(`/${role.toLowerCase()}/auth/me`);
          const userData = res.data || res;
          set({
            user: {
              ...userData,
              role: userData?.role?.toLowerCase() || 'seller'
            },
            isAuthenticated: true
          });
        } catch (err) {
          console.error("fetchMe seller failed:", err);
          if (err.response?.status === 401) {
            set({ user: null, isAuthenticated: false });
          }
        }
      }
    }),
    {
      name: 'indiafy-seller-auth-storage',
    }
  )
);
