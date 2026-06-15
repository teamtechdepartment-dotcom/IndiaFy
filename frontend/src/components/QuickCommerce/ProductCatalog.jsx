/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import { useState, useEffect, useRef } from "react";
import { Plus, Minus, Clock, Zap, TrendingUp, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ProductCardSkeleton } from "./LoadingSkeletons";
import { CATEGORIES } from "./QuickCategories";

// Full product database keyed by category
const PRODUCTS_DB = {
  dairy: [
    { id: 101, name: "Amul Taaza Toned Fresh Milk", weight: "500 ml", price: 27, mrp: 27, eta: "10 min", store: "Organic Roots", img: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80", badge: "fast" },
    { id: 102, name: "Britannia 100% Whole Wheat Bread", weight: "400 g", price: 50, mrp: 55, discount: "9% OFF", eta: "12 min", store: "Daily Mart", img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80", badge: "trending" },
    { id: 103, name: "Amul Salted Butter", weight: "100 g", price: 48, mrp: 60, discount: "20% OFF", eta: "10 min", store: "Fresh Hub", img: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80" },
    { id: 104, name: "Mother Dairy Paneer", weight: "200 g", price: 85, mrp: 90, discount: "5% OFF", eta: "12 min", store: "Organic Roots", img: "https://images.unsplash.com/photo-1559561853-08451507cbe7?w=400&q=80", badge: "bestseller" },
  ],
  vegetables: [
    { id: 201, name: "Fresh Farm Onion", weight: "1 kg", price: 35, mrp: 45, discount: "22% OFF", eta: "15 min", store: "Subzi Mandi", img: "https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?w=400&q=80", badge: "trending" },
    { id: 202, name: "Green Capsicum", weight: "250 g", price: 30, mrp: 35, discount: "14% OFF", eta: "12 min", store: "Fresh Hub", img: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&q=80" },
    { id: 203, name: "Fresh Tomatoes", weight: "500 g", price: 25, mrp: 30, discount: "17% OFF", eta: "10 min", store: "Subzi Mandi", img: "https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=400&q=80", badge: "fast" },
    { id: 204, name: "Potato", weight: "1 kg", price: 28, mrp: 32, discount: "12% OFF", eta: "12 min", store: "Daily Mart", img: "https://images.unsplash.com/photo-1518977676601-b53f82ber40?w=400&q=80" },
  ],
  fruits: [
    { id: 301, name: "Nagpur Oranges", weight: "500 g", price: 80, mrp: 100, discount: "20% OFF", eta: "15 min", store: "Fruit Basket", img: "https://images.unsplash.com/photo-1611080661265-d04b86bb3d58?w=400&q=80", badge: "bestseller" },
    { id: 302, name: "Fresh Banana", weight: "6 pcs", price: 35, mrp: 40, discount: "12% OFF", eta: "10 min", store: "Organic Roots", img: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80", badge: "fast" },
    { id: 303, name: "Shimla Apple", weight: "500 g", price: 120, mrp: 150, discount: "20% OFF", eta: "12 min", store: "Fruit Basket", img: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80" },
  ],
  pharma: [
    { id: 401, name: "Dolo 650 Tablet", weight: "15 Tablets", price: 30, mrp: 30, eta: "8 min", store: "MedPlus", img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80", badge: "fast" },
    { id: 402, name: "Crocin Advance", weight: "20 Tablets", price: 25, mrp: 25, eta: "8 min", store: "MedPlus", img: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400&q=80" },
  ],
  bakery: [
    { id: 501, name: "Chocolate Croissant", weight: "2 pcs", price: 90, mrp: 110, discount: "18% OFF", eta: "12 min", store: "Baker's Street", img: "https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=400&q=80", badge: "trending" },
    { id: 502, name: "Multigrain Bread", weight: "400 g", price: 55, mrp: 65, discount: "15% OFF", eta: "12 min", store: "Baker's Street", img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80" },
  ],
  drinks: [
    { id: 601, name: "Coca-Cola Original", weight: "750 ml", price: 40, mrp: 45, discount: "11% OFF", eta: "12 min", store: "Daily Mart", img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80", badge: "trending" },
    { id: 602, name: "Red Bull Energy Drink", weight: "250 ml", price: 99, mrp: 125, discount: "21% OFF", eta: "12 min", store: "Fresh Hub", img: "https://images.unsplash.com/photo-1568227451296-17631cc1fa23?w=400&q=80" },
    { id: 603, name: "Paper Boat Aam Panna", weight: "200 ml", price: 30, mrp: 30, eta: "10 min", store: "Organic Roots", img: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80", badge: "fast" },
  ],
  snacks: [
    { id: 701, name: "Lay's Magic Masala", weight: "50 g", price: 20, mrp: 20, eta: "12 min", store: "Daily Mart", img: "https://images.unsplash.com/photo-1566478989037-e924e0e4b77d?w=400&q=80" },
    { id: 702, name: "Kurkure Masala Munch", weight: "90 g", price: 30, mrp: 30, eta: "12 min", store: "Fresh Hub", img: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80", badge: "bestseller" },
    { id: 703, name: "Haldiram's Bhujia Sev", weight: "200 g", price: 60, mrp: 65, discount: "8% OFF", eta: "12 min", store: "Daily Mart", img: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&q=80" },
  ],
  daily: [
    { id: 801, name: "Tata Salt", weight: "1 kg", price: 28, mrp: 28, eta: "12 min", store: "Daily Mart", img: "https://images.unsplash.com/photo-1518110925495-5fe2c8e2a76c?w=400&q=80" },
    { id: 802, name: "Fortune Sunflower Oil", weight: "1 L", price: 165, mrp: 180, discount: "8% OFF", eta: "15 min", store: "Fresh Hub", img: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80", badge: "bestseller" },
    { id: 803, name: "India Gate Basmati Rice", weight: "1 kg", price: 95, mrp: 110, discount: "14% OFF", eta: "15 min", store: "Daily Mart", img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80", badge: "trending" },
  ],
};

export { PRODUCTS_DB };

const BADGE_CONFIG = {
  fast: { icon: Zap, label: "Fast", className: "bg-brand-accent/10 text-brand-accent" },
  trending: { icon: TrendingUp, label: "Trending", className: "bg-orange-50 text-orange-600" },
  bestseller: { icon: Star, label: "Best Seller", className: "bg-amber-50 text-amber-600" },
};

function ProductCard({ product, cart, onAdd, onInc, onDec }) {
  const navigate = useNavigate();
  const qty = cart[product.id] || 0;
  const badge = product.badge ? BADGE_CONFIG[product.badge] : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-2xl p-2.5 sm:p-3 border border-zinc-100 hover:border-brand-accent/20 hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-200 flex flex-col relative group cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Discount badge */}
      {product.discount && (
        <div className="absolute top-0 left-2.5 bg-red-600 text-white text-[8px] font-extrabold px-2 py-0.5 rounded-b-lg z-10 flex items-center gap-0.5 shadow-sm">
          <Zap size={7} className="fill-white" /> {product.discount}
        </div>
      )}

      {/* Product badge */}
      {badge && (
        <div className={`absolute top-2 right-2 text-[7px] font-extrabold px-1.5 py-0.5 rounded-md z-10 flex items-center gap-0.5 ${badge.className}`}>
          <badge.icon size={7} /> {badge.label}
        </div>
      )}

      {/* Image */}
      <div className="w-full aspect-square bg-zinc-50 rounded-xl mb-2 overflow-hidden relative border border-zinc-100/50">
        <img
          src={product.img}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* ETA pill */}
        <div className="absolute bottom-1.5 left-1.5 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center gap-0.5 border border-zinc-100/50">
          <Clock size={8} className="text-zinc-500" />
          <span className="text-[8px] font-extrabold text-zinc-600">{product.eta}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col min-h-0">
        <h4 className="text-[11px] sm:text-xs font-bold text-zinc-800 leading-tight mb-0.5 line-clamp-2 group-hover:text-brand-accent transition-colors">
          {product.name}
        </h4>
        <p className="text-[9px] font-semibold text-zinc-400 mb-0.5">{product.weight}</p>
        <p className="text-[8px] font-semibold text-zinc-300 mb-2">{product.store}</p>

        {/* Price + Add */}
        <div className="mt-auto flex items-center justify-between">
          <div>
            <div className="text-xs font-extrabold text-zinc-900">₹{product.price}</div>
            {product.price !== product.mrp && (
              <div className="text-[9px] font-bold text-zinc-400 line-through">₹{product.mrp}</div>
            )}
          </div>

          {qty > 0 ? (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="flex items-center bg-brand-accent text-white rounded-xl h-8 shadow-md shadow-brand-accent/20"
            >
              <button
                onClick={(e) => { e.stopPropagation(); onDec(product.id); }}
                className="w-7 h-full flex items-center justify-center active:bg-brand-accent-hover rounded-l-xl transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus size={12} strokeWidth={3} />
              </button>
              <span className="w-5 text-center text-[10px] font-extrabold">{qty}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onInc(product.id); }}
                className="w-7 h-full flex items-center justify-center active:bg-brand-accent-hover rounded-r-xl transition-colors"
                aria-label="Increase quantity"
              >
                <Plus size={12} strokeWidth={3} />
              </button>
            </motion.div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onAdd(product.id); }}
              className="border border-brand-accent/20 text-brand-accent bg-brand-accent/5 hover:bg-brand-accent hover:text-white hover:border-brand-accent h-8 px-4 rounded-xl text-[10px] font-extrabold tracking-wide active:scale-90 transition-all"
              aria-label={`Add ${product.name}`}
            >
              ADD
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ProductCatalog({ activeCategory, onCategoryClick, cart, onAdd, onInc, onDec, isLoading, productsCatalog = PRODUCTS_DB }) {
  const sidebarRef = useRef(null);

  // Get products for active category
  const products = productsCatalog[activeCategory] || [];

  return (
    <div className="px-4 py-5 bg-zinc-50">
      <div className="max-w-[1440px] mx-auto flex gap-5">
        {/* Desktop Sidebar */}
        <aside
          ref={sidebarRef}
          className="hidden md:flex flex-col w-[200px] lg:w-[220px] sticky top-[60px] h-[calc(100vh-80px)] overflow-y-auto no-scrollbar shrink-0 bg-white rounded-2xl border border-zinc-100 p-3"
        >
          <h3 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-3 px-2">
            Categories
          </h3>
          <div className="flex flex-col gap-1">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              const itemCount = productsCatalog[cat.id]?.length || 0;
              return (
                <button
                  key={cat.id}
                  onClick={() => onCategoryClick(cat.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-left ${
                    isActive
                      ? "bg-brand-accent/10 border border-brand-accent/20"
                      : "hover:bg-zinc-50 border border-transparent"
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isActive ? "bg-brand-accent text-white" : cat.color
                  }`}>
                    <Icon size={14} strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0">
                    <span className={`text-xs block ${isActive ? "font-extrabold text-brand-accent" : "font-bold text-zinc-600"}`}>
                      {cat.name}
                    </span>
                    <span className="text-[9px] font-semibold text-zinc-400">
                      {itemCount} items
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Mobile sticky category strip */}
        <div className="md:hidden fixed top-14 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-zinc-100 shadow-sm">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar px-4 py-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onCategoryClick(cat.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all ${
                  activeCategory === cat.id
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "bg-zinc-100 text-zinc-500"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 min-w-0 md:mt-0 mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-extrabold text-zinc-900">
              {CATEGORIES.find(c => c.id === activeCategory)?.name || "Products"}
            </h2>
            <span className="text-[10px] font-bold text-zinc-400">
              {products.length} products
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3"
            >
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
                : products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      cart={cart}
                      onAdd={onAdd}
                      onInc={onInc}
                      onDec={onDec}
                    />
                  ))
              }
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
