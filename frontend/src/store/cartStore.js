import { create } from 'zustand';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-hot-toast'; // Consistent toast utility
import { useAuthStore } from './authStore';
import { useProductStore } from './productStore';

const getProductDetails = async (productId) => {
  try {
    // 1. Try to find in product store cache
    const dbProducts = useProductStore.getState().products || [];
    let product = dbProducts.find(p => (p._id || p.id) === productId);
    if (product) return product;

    // 2. Fetch from backend
    const res = await axiosInstance.get(`/products/${productId}`);
    return res.data || res;
  } catch (e) {
    console.error("Failed to fetch product details for guest cart:", e);
    return null;
  }
};

export const useCartStore = create((set, get) => ({
  cartItems: [],
  totalPrice: 0,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    const isAuthenticated = useAuthStore.getState().isAuthenticated;

    if (!isAuthenticated) {
      // Guest Mode: load from local storage
      try {
        const guestCart = JSON.parse(localStorage.getItem("indiafy_guest_cart")) || { items: [], totalPrice: 0 };
        set({
          cartItems: guestCart.items || [],
          totalPrice: guestCart.totalPrice || 0
        });
      } catch (e) {
        set({ cartItems: [], totalPrice: 0 });
      } finally {
        set({ isLoading: false });
      }
      return;
    }

    // Authenticated Mode: check and merge guest cart first
    const guestCartData = localStorage.getItem("indiafy_guest_cart");
    if (guestCartData) {
      try {
        const { items } = JSON.parse(guestCartData);
        if (items && items.length > 0) {
          for (const item of items) {
            const pId = item.productId?._id || item.productId;
            if (pId) {
              // Add guest items sequentially to the backend cart
              await axiosInstance.post('/customer/cart/add', { productId: pId, quantity: item.quantity });
            }
          }
        }
      } catch (e) {
        console.error("Failed to merge guest cart into database:", e);
      } finally {
        localStorage.removeItem("indiafy_guest_cart");
      }
    }

    // Fetch live cart from backend
    try {
      const res = await axiosInstance.get('/customer/cart');
      const data = res.data || {};
      set({
        cartItems: data.items || [],
        totalPrice: data.totalPrice || 0
      });
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  addToCart: async (productId, quantity = 1) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;

    if (!isAuthenticated) {
      // Guest Mode: update local state & sync with localStorage
      const product = await getProductDetails(productId);
      if (!product) {
        toast.error("Product details not found");
        return;
      }

      const availableStock = parseInt(product.attribute?.quantity || "0") || 200;
      const productPrice = Number(product.attribute?.salePrice) || 0;
      const gstPercentage = Number(product.gstPercentage) || 0;

      const state = get();
      let updatedItems = [...state.cartItems];
      const itemIndex = updatedItems.findIndex(item => (item.productId?._id || item.productId) === productId);
      const currentQtyInCart = itemIndex > -1 ? updatedItems[itemIndex].quantity : 0;

      if (currentQtyInCart + quantity > availableStock) {
        toast.error(`Insufficient stock. Only ${availableStock} units available.`);
        return;
      }

      if (itemIndex > -1) {
        const item = { ...updatedItems[itemIndex] };
        const newQty = item.quantity + quantity;
        if (newQty <= 0) {
          updatedItems.splice(itemIndex, 1);
        } else {
          item.quantity = newQty;
          item.gstAmount = (item.price * newQty) * (gstPercentage / 100);
          updatedItems[itemIndex] = item;
        }
      } else {
        if (quantity > 0) {
          updatedItems.push({
            productId: {
              _id: product._id || product.id,
              productName: product.productName,
              productImage: product.productImage,
              sellerId: product.sellerId,
              attribute: product.attribute,
              isWholesale: product.isWholesale,
              minimumOrderQty: product.minimumOrderQty,
              gstPercentage: product.gstPercentage
            },
            quantity,
            price: productPrice,
            gstAmount: (productPrice * quantity) * (gstPercentage / 100),
            isWholesale: product.isWholesale || false
          });
        }
      }

      const newTotalPrice = updatedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      set({ cartItems: updatedItems, totalPrice: newTotalPrice });
      localStorage.setItem("indiafy_guest_cart", JSON.stringify({ items: updatedItems, totalPrice: newTotalPrice }));
      toast.success("Basket updated!");
      return;
    }

    // Authenticated Mode: synchronize with backend
    try {
      const res = await axiosInstance.post('/customer/cart/add', { productId, quantity });
      const data = res.data || {};
      set({
        cartItems: data.items || [],
        totalPrice: data.totalPrice || 0
      });
      toast.success("Added to cart!");
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error(error.response?.data?.message || "Failed to add to cart");
    }
  },

  removeFromCart: async (productId) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;

    if (!isAuthenticated) {
      // Guest Mode: delete local item & sync with localStorage
      const state = get();
      const updatedItems = state.cartItems.filter(item => (item.productId?._id || item.productId) !== productId);
      const newTotalPrice = updatedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      set({ cartItems: updatedItems, totalPrice: newTotalPrice });
      localStorage.setItem("indiafy_guest_cart", JSON.stringify({ items: updatedItems, totalPrice: newTotalPrice }));
      toast.success("Item removed from cart");
      return;
    }

    // Authenticated Mode: delete on backend
    try {
      const res = await axiosInstance.delete(`/customer/cart/remove/${productId}`);
      const data = res.data || {};
      set({
        cartItems: data.items || [],
        totalPrice: data.totalPrice || 0
      });
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove item");
    }
  },

  clearCartStore: async () => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;

    if (!isAuthenticated) {
      // Guest Mode
      set({ cartItems: [], totalPrice: 0 });
      localStorage.removeItem("indiafy_guest_cart");
      return;
    }

    // Authenticated Mode
    try {
      await axiosInstance.delete('/customer/cart/clear');
      set({ cartItems: [], totalPrice: 0 });
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  }
}));
