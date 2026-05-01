import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosInstance from '../utils/axiosInstance';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null, // { id, role, name, email, etc. }
      token: null,
      isAuthenticated: false,

      login: (userData, token) => set({
        user: {
          ...userData,
          role: userData?.role?.toLowerCase() || 'customer'
        },
        token: token,
        isAuthenticated: true
      }),

      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false
      }),

      fetchMe: async (role) => {
        try {
          const res = await axiosInstance.get(`/${role.toLowerCase()}/auth/me`);
          // res = { statusCode, data: userData, message }
          const userData = res.data || res;
          set({
            user: {
              ...userData,
              role: userData?.role?.toLowerCase() || role.toLowerCase()
            },
            isAuthenticated: true
          });
        } catch (err) {
          console.error("fetchMe failed:", err);
          // Only clear state if it's a 401 Unauthorized (meaning session is actually dead)
          if (err.response?.status === 401) {
            set({ user: null, isAuthenticated: false });
          }
        }
      }
    }),
    {
      name: 'indiafy-auth-storage',
    }
  )
);
