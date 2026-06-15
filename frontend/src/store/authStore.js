import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosInstance from '../utils/axiosInstance';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null, // { id, role, name, email, etc. }
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isBackendAvailable: true,
      expiresAt: null,

      login: (userData, token, refreshToken) => set({
        user: {
          ...userData,
          role: userData?.role?.toLowerCase() || 'customer'
        },
        token: token,
        refreshToken: refreshToken || userData?.refreshToken,
        isAuthenticated: true,
        isBackendAvailable: true,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
      }),

      clearSession: () => {
        // Clear local cart store memory dynamically
        try {
          import('./cartStore.js').then(m => m.useCartStore.setState({ cartItems: [], totalPrice: 0 }));
        } catch (e) {}
        set({ 
          user: null, 
          token: null, 
          refreshToken: null,
          isAuthenticated: false,
          expiresAt: null 
        });
      },

      logout: async () => {
        try {
          await axiosInstance.post('/customer/auth/logout');
        } catch (err) {
          console.error("Customer logout failed on backend:", err);
        }
        // Clear local cart store memory dynamically
        try {
          import('./cartStore.js').then(m => m.useCartStore.setState({ cartItems: [], totalPrice: 0 }));
        } catch (e) {}
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          expiresAt: null
        });
      },

      fetchMe: async (role, retries = 2) => {
        const state = get();
        if (state.expiresAt && Date.now() > state.expiresAt) {
          state.clearSession();
          return;
        }

        try {
          const res = await axiosInstance.get(`/${role.toLowerCase()}/auth/me`);
          // res = { statusCode, data: userData, message }
          const userData = res.data || res;
          set({
            user: {
              ...userData,
              role: userData?.role?.toLowerCase() || role.toLowerCase()
            },
            isAuthenticated: true,
            isBackendAvailable: true
          });
        } catch (err) {
          if (err.code === "ERR_NETWORK") {
            if (retries > 0) {
              console.log(`Retrying fetchMe... (${retries} attempts left)`);
              await new Promise(resolve => setTimeout(resolve, 1000));
              return get().fetchMe(role, retries - 1);
            }
            set({ user: null, isAuthenticated: false, isBackendAvailable: false });
            return;
          }
          
          if (err.response?.status === 401) {
            get().clearSession();
            set({ isBackendAvailable: true });
            return;
          }

          throw err;
        }
      }
    }),
    {
      name: 'indiafy-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        isBackendAvailable: state.isBackendAvailable,
        expiresAt: state.expiresAt,
      }),
    }
  )
);
