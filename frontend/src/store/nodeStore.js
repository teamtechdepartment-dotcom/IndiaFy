import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosInstance from '../utils/axiosInstance';

export const useNodeStore = create(
  persist(
    (set, get) => ({
      activeNode: null,
      nodes: [],
      isLoading: false,
      error: null,

      setActiveNode: (node) => set({ activeNode: node }),
      setNodes: (nodes) => set({ nodes }),
      clearActiveNode: () => set({ activeNode: null }),
      clearError: () => set({ error: null }),

      /**
       * Fetch a single node by ID and set it as activeNode.
       * axiosInstance interceptor returns response.data directly:
       *   res = { success: true, node: { ... } }
       */
      fetchNodeDetails: async (nodeId) => {
        if (!nodeId) return null;
        set({ isLoading: true, error: null });
        try {
          // res IS response.data because of axiosInstance interceptor
          const res = await axiosInstance.get(`/seller/nodes/${nodeId}`);
          // res shape: { success: true, node: { ... } }
          const node = res?.node || null;
          if (node) {
            set({ activeNode: node });
            try {
              localStorage.setItem('activeNode', JSON.stringify(node));
            } catch (_) {}
            return node;
          }
          set({ error: 'Node not found' });
          return null;
        } catch (err) {
          const errMsg =
            err?.response?.data?.message ||
            err?.message ||
            'Failed to load store node';
          set({ error: errMsg });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * Fetch all nodes for the logged-in seller.
       * res shape: { success: true, totalNodes: N, nodes: [ ... ] }
       */
      fetchAllNodes: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await axiosInstance.get('/seller/nodes');
          const nodes = Array.isArray(res?.nodes) ? res.nodes : [];
          set({ nodes });
          return nodes;
        } catch (err) {
          const errMsg =
            err?.response?.data?.message ||
            err?.message ||
            'Failed to load seller nodes';
          set({ error: errMsg, nodes: [] });
          return [];
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * Update a node locally after settings save (no extra API call needed).
       */
      updateActiveNode: (updatedFields) =>
        set((state) => ({
          activeNode: state.activeNode
            ? { ...state.activeNode, ...updatedFields }
            : state.activeNode,
        })),
    }),
    {
      name: 'indiafy-node-storage',
      // Only persist activeNode to avoid stale nodes list
      partialize: (state) => ({ activeNode: state.activeNode }),
    }
  )
);

export default useNodeStore;
