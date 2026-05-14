import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosInstance from '../utils/axiosInstance';

export const useSellerAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      /**
       * Called after a successful login.
       * userData: the seller object from the API
       * token: optional JWT (used as Bearer fallback for mobile)
       */
      login: (userData, token) => {
        if (!userData) return;
        set({
          user: {
            ...userData,
            role: userData?.role?.toLowerCase() || 'seller',
          },
          token: token || null,
          isAuthenticated: true,
        });
      },

      logout: async () => {
        try {
          await axiosInstance.post('/seller/auth/logout');
        } catch (err) {
          console.error('Seller logout failed on backend:', err);
        }
        set({ user: null, token: null, isAuthenticated: false });
      },

      /**
       * Validates the current session on app startup.
       * axiosInstance returns response.data directly
       * Backend ApiResponse shape:
       * { statusCode: 200, data: { _id, email, role, ...sellerFields }, message, success }
       * So res = { statusCode, data: sellerObject, message, success }
       */
      fetchMe: async (role) => {
        try {
          // axiosInstance returns response.data directly
          // Backend ApiResponse shape:
          // { statusCode: 200, data: { _id, email, role, ...sellerFields }, message, success }
          // So res = { statusCode, data: sellerObject, message, success }
          const res = await axiosInstance.get(`/${role.toLowerCase()}/auth/me`);

          // The seller object is in res.data
          const userData = res?.data;

          if (userData?._id) {
            set({
              user: {
                ...userData,
                role: userData?.role?.toLowerCase() || 'seller',
              },
              isAuthenticated: true,
            });
          } else {
            // Response came back but no valid user object — clear auth
            set({ user: null, isAuthenticated: false });
          }
        } catch (err) {
          // 401 or network error → clear auth state (but don't throw)
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'indiafy-seller-auth-storage',
      // Only persist critical auth fields — avoids stale isAuthenticated=true
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
