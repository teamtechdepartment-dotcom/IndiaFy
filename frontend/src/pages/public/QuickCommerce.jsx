import { useState, useEffect, lazy, Suspense, useMemo } from "react";
import SEOHead from "../../components/seo/SEOHead";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Minus, Plus, ChevronRight, ShoppingBag } from "lucide-react";

import QuickHeader from "../../components/QuickCommerce/QuickHeader";
import DeliveryBar from "../../components/QuickCommerce/DeliveryBar";
import SearchSection from "../../components/QuickCommerce/SearchSection";
import BuyAgain from "../../components/QuickCommerce/BuyAgain";
import QuickCategories from "../../components/QuickCommerce/QuickCategories";
import FlashDeals from "../../components/QuickCommerce/FlashDeals";
import ProductCatalog from "../../components/QuickCommerce/ProductCatalog";
import RecommendedProducts from "../../components/QuickCommerce/RecommendedProducts";
import StickyCart from "../../components/QuickCommerce/StickyCart";
import BottomNavigation from "../../components/QuickCommerce/BottomNavigation";
import EmptyCartState from "../../components/QuickCommerce/EmptyCartState";
import { useProductStore } from "../../store/productStore";
import { useCartStore } from "../../store/cartStore";

const mapCategoryToId = (catName) => {
  const name = (catName || "").toLowerCase().trim();
  if (name.includes("milk") || name.includes("dairy")) return "dairy";
  if (name.includes("vegetable") || name.includes("onion") || name.includes("tomato") || name.includes("potato") || name.includes("capsicum")) return "vegetables";
  if (name.includes("fruit") || name.includes("apple") || name.includes("orange") || name.includes("banana")) return "fruits";
  if (name.includes("pharma") || name.includes("medicine") || name.includes("dolo") || name.includes("crocin")) return "pharma";
  if (name.includes("bakery") || name.includes("bread") || name.includes("croissant")) return "bakery";
  if (name.includes("beverage") || name.includes("drink") || name.includes("coke") || name.includes("juice") || name.includes("water") || name.includes("tea") || name.includes("coffee")) return "drinks";
  if (name.includes("snack") || name.includes("chip") || name.includes("biscuit") || name.includes("cookie") || name.includes("chocolate") || name.includes("kurkure") || name.includes("lay's")) return "snacks";
  return "daily";
};

const mapDbProductToQCommerce = (p) => {
  const price = p.attribute?.salePrice ?? 0;
  const mrp = p.attribute?.mrpPrice ?? price;
  const discountPct = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const discountLabel = discountPct > 0 ? `${discountPct}% OFF` : null;
  
  return {
    id: p._id || p.id,
    name: p.productName || p.name,
    weight: p.attribute?.weight || "500g",
    price: price,
    mrp: mrp,
    discount: discountLabel,
    eta: "10 min",
    store: p.nodeId?.storeName || p.store || "Fast Seller",
    img: p.productImage?.[0] || p.image || "https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=400&q=80",
    badge: discountPct >= 20 ? "trending" : discountPct > 0 ? "fast" : null
  };
};

function CartDrawer({ isOpen, onClose, cartItems, totalPrice, totalSaved, onInc, onDec, onRemove }) {
  const navigate = useNavigate();
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 pointer-events-auto"
          />
          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="fixed right-0 top-0 h-full w-full max-w-[420px] bg-white shadow-2xl z-50 flex flex-col pointer-events-auto"
          >
            {/* Header */}
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-zinc-900">Your Basket</h3>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide">10 min delivery</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-zinc-600">
                <X size={18} />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {cartItems.length === 0 ? (
                <EmptyCartState onBrowse={onClose} />
              ) : (
                cartItems.map((item) => {
                  const pId = item.productId?._id || item.productId;
                  return (
                    <div key={pId} className="flex gap-3 bg-zinc-50 p-3 rounded-2xl border border-zinc-100">
                      <img
                        src={item.productId?.productImage?.[0] || "https://placehold.co/100"}
                        alt={item.productId?.productName}
                        className="w-14 h-14 object-cover rounded-xl border bg-white"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-zinc-800 truncate">{item.productId?.productName || "Product"}</h4>
                        <p className="text-[9px] font-semibold text-zinc-400">{item.productId?.attribute?.weight || "500g"}</p>
                        <p className="text-xs font-extrabold text-zinc-900 mt-1">₹{item.price}</p>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <button onClick={() => onRemove(pId)} className="text-zinc-400 hover:text-red-500">
                          <Trash2 size={14} />
                        </button>
                        <div className="flex items-center bg-white border border-zinc-200 rounded-xl h-7 shadow-sm">
                          <button onClick={() => onDec(pId)} className="p-1.5 hover:bg-zinc-100 rounded-l-xl">
                            <Minus size={10} strokeWidth={3} />
                          </button>
                          <span className="w-5 text-center text-[10px] font-extrabold">{item.quantity}</span>
                          <button onClick={() => onInc(pId)} className="p-1.5 hover:bg-zinc-100 rounded-r-xl">
                            <Plus size={10} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Bill Details */}
            {cartItems.length > 0 && (
              <div className="p-4 border-t border-zinc-100 bg-zinc-50 space-y-4">
                <div className="space-y-1.5 text-xs text-zinc-500 font-semibold">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-zinc-900 font-bold">₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charge</span>
                    <span className="text-emerald-500 font-bold uppercase text-[10px]">Free</span>
                  </div>
                  {totalSaved > 0 && (
                    <div className="flex justify-between text-emerald-500">
                      <span>Saved</span>
                      <span className="font-bold">-₹{totalSaved}</span>
                    </div>
                  )}
                </div>
                <div className="pt-3 border-t border-zinc-200 flex justify-between items-center">
                  <div>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Grand Total</p>
                    <p className="text-xl font-extrabold text-zinc-900">₹{totalPrice}</p>
                  </div>
                  <button
                    onClick={() => navigate("/checkout")}
                    className="bg-brand-accent text-white px-6 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-brand-accent/20 hover:bg-brand-accent-hover"
                  >
                    Checkout <ChevronRight size={14} strokeWidth={3} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function QuickCommerce() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("dairy");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { products: dbProducts, fetchProducts } = useProductStore();
  const { cartItems, totalPrice, fetchCart, addToCart, removeFromCart } = useCartStore();

  // Load backend products and cart on mount
  useEffect(() => {
    fetchProducts("", "", "", "QUICK_COMMERCE");
    fetchCart();
    
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [fetchProducts, fetchCart]);

  // --- Cart handlers ---
  const handleAdd = (id) => {
    addToCart(id, 1);
    setIsDrawerOpen(true);
  };
  const handleInc = (id) => addToCart(id, 1);
  const handleDec = (id) => addToCart(id, -1);
  const handleRemove = (id) => removeFromCart(id);

  // Compute reactive counts & totals from Zustand store
  const totalItems = useMemo(() => cartItems.reduce((acc, item) => acc + item.quantity, 0), [cartItems]);
  
  const totalSaved = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const p = item.productId;
      const mrp = p?.attribute?.mrpPrice || p?.attribute?.salePrice || item.price;
      const price = item.price;
      if (mrp > price) {
        return acc + (mrp - price) * item.quantity;
      }
      return acc;
    }, 0);
  }, [cartItems]);

  const cart = useMemo(() => {
    const c = {};
    cartItems.forEach(item => {
      const pId = item.productId?._id || item.productId;
      if (pId) {
        c[pId] = item.quantity;
      }
    });
    return c;
  }, [cartItems]);

  // Group dbProducts by mapped category and merge them into catalog
  const dynamicCatalog = {};
  const categoriesList = ["dairy", "vegetables", "fruits", "pharma", "bakery", "drinks", "snacks", "daily"];
  categoriesList.forEach(c => {
    dynamicCatalog[c] = [];
  });

  const dbMappedProducts = [];
  if (Array.isArray(dbProducts)) {
    dbProducts.forEach(p => {
      const qProduct = mapDbProductToQCommerce(p);
      dbMappedProducts.push(qProduct);
      
      const catId = mapCategoryToId(p.categoryName);
      if (dynamicCatalog[catId] && !dynamicCatalog[catId].some(existing => existing.id === qProduct.id)) {
        dynamicCatalog[catId].push(qProduct);
      }
    });
  }

  // Prepend database products to Buy Again section
  const dynamicBuyAgain = [];
  const buyAgainAddedIds = new Set();
  
  dbMappedProducts.forEach(qProd => {
    if (!buyAgainAddedIds.has(qProd.id)) {
      dynamicBuyAgain.push(qProd);
      buyAgainAddedIds.add(qProd.id);
    }
  });

  // Prepend database products to Recommended section
  const dynamicRecommended = [];
  const recAddedIds = new Set();
  
  dbMappedProducts.forEach(qProd => {
    if (!recAddedIds.has(qProd.id)) {
      dynamicRecommended.push(qProd);
      recAddedIds.add(qProd.id);
    }
  });

  // Category click handler
  const handleCategoryClick = (catId) => {
    setActiveCategory(catId);
  };

  // Search handler
  const handleSearch = (query) => {
    console.log("Search:", query);
  };

  return (
    <div className="bg-zinc-50 min-h-screen flex flex-col font-sans pb-14 md:pb-0">
      <SEOHead 
        title="15 Minute Delivery in Gurugram | Indiafy Quick Commerce"
        description="Experience quick commerce in Gurugram with Indiafy. The best instant delivery platform in Gurugram for fast grocery delivery and hyperlocal essentials."
      />
      
      {/* Section 1: Compact Header */}
      <QuickHeader />

      {/* Section 2: Delivery Intelligence Bar */}
      <DeliveryBar />

      {/* Section 3: Search */}
      <SearchSection onSearch={handleSearch} />

      {/* Section 4: Buy Again */}
      <BuyAgain cart={cart} onAdd={handleAdd} onInc={handleInc} onDec={handleDec} isLoading={isLoading} items={dynamicBuyAgain} />

      {/* Section 5: Quick Categories */}
      <QuickCategories
        activeCategory={activeCategory}
        onCategoryClick={handleCategoryClick}
        isLoading={isLoading}
      />

      {/* Section 6: Flash Deals */}
      <FlashDeals onAdd={handleAdd} isLoading={isLoading} />

      {/* Section 7: Product Catalog */}
      <ProductCatalog
        activeCategory={activeCategory}
        onCategoryClick={handleCategoryClick}
        cart={cart}
        onAdd={handleAdd}
        onInc={handleInc}
        onDec={handleDec}
        isLoading={isLoading}
        productsCatalog={dynamicCatalog}
      />

      {/* Section 8: Recommended Products */}
      <RecommendedProducts cart={cart} onAdd={handleAdd} onInc={handleInc} onDec={handleDec} items={dynamicRecommended} />

      {/* Section 9: Sticky Cart */}
      <StickyCart
        totalItems={totalItems}
        totalPrice={totalPrice}
        totalSaved={totalSaved}
        onOpenDrawer={() => setIsDrawerOpen(true)}
      />

      {/* Section 10: Sliding Drawer Basket */}
      <CartDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        cartItems={cartItems}
        totalPrice={totalPrice}
        totalSaved={totalSaved}
        onInc={handleInc}
        onDec={handleDec}
        onRemove={handleRemove}
      />

      {/* Section 11: Bottom Navigation (mobile only) */}
      <BottomNavigation />
    </div>
  );
}