/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import React, { useState, useEffect, useMemo } from "react";
import SEOHead from "../../components/seo/SEOHead";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Trash2, Minus, Plus, ChevronRight, 
  ShoppingBag, Heart, Star, ArrowRight 
} from "lucide-react";

import QuickHeader from "../../components/QuickCommerce/QuickHeader";
import DeliveryBar from "../../components/QuickCommerce/DeliveryBar";
import SearchSection from "../../components/QuickCommerce/SearchSection";
import Hero from "../../components/QuickCommerce/Hero"; // <-- Imported Hero component
import QuickCategories from "../../components/QuickCommerce/QuickCategories";
import FlashDeals from "../../components/QuickCommerce/FlashDeals";
import StickyCart from "../../components/QuickCommerce/StickyCart";
import BottomNavigation from "../../components/QuickCommerce/BottomNavigation";
import EmptyCartState from "../../components/QuickCommerce/EmptyCartState";
import { useProductStore } from "../../store/productStore";
import { useCartStore } from "../../store/cartStore";

// --- Utility Functions ---
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
    badge: discountPct >= 20 ? "trending" : discountPct > 0 ? "fast" : null,
    rating: p.rating || 4.5,
    reviews: p.reviews || Math.floor(Math.random() * 300) + 50
  };
};

function getDiscount(oldPrice, price) {
  const old = parseFloat(String(oldPrice).replace(/,/g, ''));
  const current = parseFloat(String(price).replace(/,/g, ''));
  if (!old || !current || old <= current) return null;
  return Math.round(((old - current) / old) * 100);
}

// --- Enhanced UI Components ---

const ProductCard = ({ product, quantity, onAdd, onInc, onDec }) => {
  const navigate = useNavigate();
  const discount = getDiscount(product.mrp, product.price);

  return (
    <div className="group flex flex-col h-full border border-zinc-200 hover:border-brand-primary/40 hover:shadow-lg rounded-xl overflow-hidden transition-all duration-200 p-2.5 sm:p-3 bg-white relative">
      <div
        onClick={() => navigate(`/product/${product.id}`)}
        className="relative aspect-square w-full overflow-hidden cursor-pointer bg-zinc-50 rounded-lg mb-3 flex items-center justify-center"
      >
        <img
          src={product.img}
          alt={product.name}
          loading="lazy"
          className="w-[90%] h-[90%] object-contain group-hover:scale-105 transition-transform duration-300 mix-blend-multiply"
        />

        {discount > 0 && (
          <div className="absolute top-0 left-0 px-2 py-1 bg-brand-accent text-white text-[10px] sm:text-xs font-bold shadow-sm rounded-br-lg z-10">
            {discount}% OFF
          </div>
        )}
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate("/profile");
          }}
          className="absolute top-1 right-1 p-1.5 rounded-full text-zinc-400 hover:text-red-500 hover:bg-white/90 shadow-sm transition-colors z-10"
        >
          <Heart size={16} />
        </button>
      </div>

      <div className="flex flex-col flex-1">
        <h3
          onClick={() => navigate(`/product/${product.id}`)}
          className="text-[13px] sm:text-sm font-semibold text-zinc-800 leading-tight mb-1.5 line-clamp-2 cursor-pointer hover:text-brand-primary transition-colors min-h-[36px] sm:min-h-[40px]"
        >
          {product.name}
        </h3>
        <p className="text-[10px] sm:text-xs font-medium text-zinc-500 mb-2">{product.weight}</p>

        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-green-700 text-white rounded-[4px]">
            <span className="text-[10px] font-bold">{product.rating}</span>
            <Star size={9} fill="white" strokeWidth={0} />
          </div>
          <span className="text-[10px] text-zinc-400">({product.reviews})</span>
        </div>

        <div className="mt-auto pt-2 flex flex-col gap-2.5">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm sm:text-base font-extrabold text-zinc-900">₹{product.price}</span>
            {product.mrp > product.price && (
              <span className="text-[11px] text-zinc-400 line-through">₹{product.mrp}</span>
            )}
          </div>

          {quantity > 0 ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-600 rounded-lg h-9 shadow-sm overflow-hidden w-full">
              <button onClick={(e) => { e.stopPropagation(); onDec(product.id); }} className="w-10 h-full flex items-center justify-center text-green-700 hover:bg-green-100 transition-colors">
                <Minus size={16} strokeWidth={2.5} />
              </button>
              <span className="text-sm font-bold text-green-800 flex-1 text-center">{quantity}</span>
              <button onClick={(e) => { e.stopPropagation(); onInc(product.id); }} className="w-10 h-full flex items-center justify-center text-green-700 hover:bg-green-100 transition-colors">
                <Plus size={16} strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onAdd(product.id); }}
              className="w-full bg-white border border-brand-primary text-brand-primary text-xs sm:text-sm font-bold py-2 rounded-lg hover:bg-brand-primary hover:text-white transition-all shadow-sm"
            >
              ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductSection = ({ title, products, cart, onAdd, onInc, onDec, onViewAll }) => {
  if (!products || products.length === 0) return null;

  return (
    <section className="px-2 py-3">
      <div className="w-full bg-white shadow-sm rounded-xl p-4 sm:p-5 border border-zinc-100">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg md:text-xl font-extrabold text-zinc-900 capitalize">
            {title}
          </h2>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="flex items-center justify-center bg-zinc-100 text-zinc-600 w-8 h-8 rounded-full hover:bg-brand-primary hover:text-white transition-colors"
              aria-label="View All"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              quantity={cart[product.id] || 0}
              onAdd={onAdd}
              onInc={onInc}
              onDec={onDec}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Main Cart Drawer ---
function CartDrawer({ isOpen, onClose, cartItems, totalPrice, totalSaved, onInc, onDec, onRemove }) {
  const navigate = useNavigate();
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 pointer-events-auto"
          />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="fixed right-0 top-0 h-full w-full max-w-[420px] bg-white shadow-2xl z-50 flex flex-col pointer-events-auto"
          >
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-zinc-900">Your Basket</h3>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide">10 min delivery</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-zinc-600">
                <X size={18} />
              </button>
            </div>

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
                          <button onClick={() => onDec(pId)} className="p-1.5 hover:bg-zinc-100 rounded-l-xl"><Minus size={10} strokeWidth={3} /></button>
                          <span className="w-5 text-center text-[10px] font-extrabold">{item.quantity}</span>
                          <button onClick={() => onInc(pId)} className="p-1.5 hover:bg-zinc-100 rounded-r-xl"><Plus size={10} strokeWidth={3} /></button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-4 border-t border-zinc-100 bg-zinc-50 space-y-4">
                <div className="space-y-1.5 text-xs text-zinc-500 font-semibold">
                  <div className="flex justify-between"><span>Subtotal</span><span className="text-zinc-900 font-bold">₹{totalPrice}</span></div>
                  <div className="flex justify-between"><span>Delivery Charge</span><span className="text-emerald-500 font-bold uppercase text-[10px]">Free</span></div>
                  {totalSaved > 0 && (
                    <div className="flex justify-between text-emerald-500"><span>Saved</span><span className="font-bold">-₹{totalSaved}</span></div>
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

// --- Main View ---
export default function QuickCommerce() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("dairy");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { products: dbProducts, fetchProducts } = useProductStore();
  const { cartItems, totalPrice, fetchCart, addToCart, removeFromCart } = useCartStore();

  useEffect(() => {
    fetchProducts("", "", "", "QUICK_COMMERCE");
    fetchCart();
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [fetchProducts, fetchCart]);

  const handleAdd = (id) => {
    addToCart(id, 1);
    setIsDrawerOpen(true);
  };
  const handleInc = (id) => addToCart(id, 1);
  const handleDec = (id) => addToCart(id, -1);
  const handleRemove = (id) => removeFromCart(id);

  const totalItems = useMemo(() => cartItems.reduce((acc, item) => acc + item.quantity, 0), [cartItems]);
  
  const totalSaved = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const p = item.productId;
      const mrp = p?.attribute?.mrpPrice || p?.attribute?.salePrice || item.price;
      const price = item.price;
      if (mrp > price) return acc + (mrp - price) * item.quantity;
      return acc;
    }, 0);
  }, [cartItems]);

  const cart = useMemo(() => {
    const c = {};
    cartItems.forEach(item => {
      const pId = item.productId?._id || item.productId;
      if (pId) c[pId] = item.quantity;
    });
    return c;
  }, [cartItems]);

  // Data processing
  const dynamicCatalog = {};
  const categoriesList = ["dairy", "vegetables", "fruits", "pharma", "bakery", "drinks", "snacks", "daily"];
  categoriesList.forEach(c => { dynamicCatalog[c] = []; });

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

  const dynamicBuyAgain = [];
  const buyAgainAddedIds = new Set();
  dbMappedProducts.forEach(qProd => {
    if (!buyAgainAddedIds.has(qProd.id)) {
      dynamicBuyAgain.push(qProd);
      buyAgainAddedIds.add(qProd.id);
    }
  });

  const dynamicRecommended = [];
  const recAddedIds = new Set();
  [...dbMappedProducts].reverse().forEach(qProd => {
    if (!recAddedIds.has(qProd.id)) {
      dynamicRecommended.push(qProd);
      recAddedIds.add(qProd.id);
    }
  });

  const handleCategoryClick = (catId) => setActiveCategory(catId);
  const handleSearch = (query) => console.log("Search:", query);

  return (
    <div className="bg-[#f2f4f7] min-h-screen flex flex-col font-sans pb-16 md:pb-0">
      <SEOHead 
        title="15 Minute Delivery in Gurugram | Indiafy Quick Commerce"
        description="Experience quick commerce in Gurugram with Indiafy. The best instant delivery platform in Gurugram for fast grocery delivery and hyperlocal essentials."
      />
      
      <QuickHeader />
      <DeliveryBar />
      <SearchSection onSearch={handleSearch} />

      {/* Hero Section Inserted Here */}
      <Hero />

      <ProductSection 
        title="Buy Again" 
        products={dynamicBuyAgain.slice(0, 6)} 
        cart={cart} 
        onAdd={handleAdd} onInc={handleInc} onDec={handleDec} 
        onViewAll={() => navigate('/orders')}
      />

      <QuickCategories activeCategory={activeCategory} onCategoryClick={handleCategoryClick} isLoading={isLoading} />
      
      {/* Renders the updated Flash Deals Grid here */}
      <FlashDeals onAdd={handleAdd} isLoading={isLoading} />

      <ProductSection 
        title={`${activeCategory} Essentials`} 
        products={dynamicCatalog[activeCategory]} 
        cart={cart} 
        onAdd={handleAdd} onInc={handleInc} onDec={handleDec} 
        onViewAll={() => navigate(`/search?q=${activeCategory}`)}
      />

      <ProductSection 
        title="Recommended for You" 
        products={dynamicRecommended.slice(0, 12)} 
        cart={cart} 
        onAdd={handleAdd} onInc={handleInc} onDec={handleDec} 
      />

      <StickyCart totalItems={totalItems} totalPrice={totalPrice} totalSaved={totalSaved} onOpenDrawer={() => setIsDrawerOpen(true)} />
      
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

      <div 
        onClick={() => navigate('/gurugram-market-survey')}
        className="fixed bottom-0 md:bottom-0 left-0 w-full z-40 bg-brand-accent text-white py-3 px-4 flex items-center justify-center gap-2 cursor-pointer shadow-[0_-4px_10px_rgba(0,0,0,0.15)] hover:bg-[#e05a18] transition-colors"
      >
        <span className="font-extrabold text-sm md:text-base uppercase tracking-wider">Partner with IndiaFy</span>
        <ArrowRight size={18} strokeWidth={3} />
      </div>
      
      <div className="hidden md:block">
        <BottomNavigation />
      </div>
    </div>
  );
}