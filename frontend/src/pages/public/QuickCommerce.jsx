
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Clock,
  ChevronRight,
  Plus,
  Minus,
  Zap,
  ShoppingBag,
  ArrowLeft,
  Milk,
  Cookie,
  CupSoda,
  Apple,
  Pill,
  Gift,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";

// --- MOCK DATA ---
const CATEGORIES = [
  {
    id: "dairy",
    name: "Dairy & Bread",
    icon: <Milk size={28} strokeWidth={1.5} />,
    color: "bg-blue-50 text-blue-600",
  },
  {
    id: "snacks",
    name: "Snacks",
    icon: <Cookie size={28} strokeWidth={1.5} />,
    color: "bg-orange-50 text-orange-600",
  },
  {
    id: "drinks",
    name: "Cold Drinks",
    icon: <CupSoda size={28} strokeWidth={1.5} />,
    color: "bg-red-50 text-red-600",
  },
  {
    id: "fruits",
    name: "Fruits & Veg",
    icon: <Apple size={28} strokeWidth={1.5} />,
    color: "bg-green-50 text-green-600",
  },
  {
    id: "pharma",
    name: "Pharmacy",
    icon: <Pill size={28} strokeWidth={1.5} />,
    color: "bg-teal-50 text-teal-600",
  },
];

const PRODUCTS_DB = {
  dairy: [
    {
      id: 101,
      name: "Amul Taaza Toned Fresh Milk",
      weight: "500 ml",
      price: 27,
      mrp: 27,
      time: "12 MINS",
      img: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80",
    },
    {
      id: 102,
      name: "Britannia 100% Whole Wheat Bread",
      weight: "400 g",
      price: 50,
      mrp: 55,
      discount: "9% OFF",
      time: "12 MINS",
      img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80",
    },
    {
      id: 103,
      name: "Amul Salted Butter",
      weight: "100 g",
      price: 58,
      mrp: 60,
      time: "12 MINS",
      img: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80",
    },
    {
      id: 104,
      name: "Mother Dairy Paneer",
      weight: "200 g",
      price: 85,
      mrp: 90,
      discount: "5% OFF",
      time: "12 MINS",
      img: "https://images.unsplash.com/photo-1559561853-08451507cbe7?w=400&q=80",
    },
  ],
  snacks: [
    {
      id: 201,
      name: "Lay's India's Magic Masala",
      weight: "50 g",
      price: 20,
      mrp: 20,
      time: "12 MINS",
      img: "https://images.unsplash.com/photo-1566478989037-e924e0e4b77d?w=400&q=80",
    },
    {
      id: 202,
      name: "Kurkure Masala Munch",
      weight: "90 g",
      price: 30,
      mrp: 30,
      time: "12 MINS",
      img: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80",
    },
    {
      id: 203,
      name: "Haldiram's Bhujia Sev",
      weight: "200 g",
      price: 60,
      mrp: 65,
      time: "12 MINS",
      img: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&q=80",
    },
  ],
  drinks: [
    {
      id: 301,
      name: "Coca-Cola Original",
      weight: "750 ml",
      price: 40,
      mrp: 45,
      discount: "11% OFF",
      time: "12 MINS",
      img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80",
    },
    {
      id: 302,
      name: "Red Bull Energy Drink",
      weight: "250 ml",
      price: 125,
      mrp: 125,
      time: "12 MINS",
      img: "https://images.unsplash.com/photo-1568227451296-17631cc1fa23?w=400&q=80",
    },
  ],
  fruits: [
    {
      id: 401,
      name: "Fresh Farm Onion",
      weight: "1 kg",
      price: 35,
      mrp: 45,
      discount: "22% OFF",
      time: "15 MINS",
      img: "https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?w=400&q=80",
    },
    {
      id: 402,
      name: "Nagpur Oranges",
      weight: "500 g",
      price: 80,
      mrp: 100,
      discount: "20% OFF",
      time: "15 MINS",
      img: "https://images.unsplash.com/photo-1611080661265-d04b86bb3d58?w=400&q=80",
    },
  ],
  pharma: [
    {
      id: 501,
      name: "Dolo 650 Tablet",
      weight: "15 Tablets",
      price: 30,
      mrp: 30,
      time: "10 MINS",
      img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80",
    },
  ],
};

export default function QuickCommerce() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState({});
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = CATEGORIES.map((c) => document.getElementById(c.id));
      const scrollPosition = window.scrollY + 150;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveCategory(CATEGORIES[i].id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToCategory = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleAdd = (id) => setCart((prev) => ({ ...prev, [id]: 1 }));
  const handleInc = (id) =>
    setCart((prev) => ({ ...prev, [id]: prev[id] + 1 }));
  const handleDec = (id) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[id] > 1) {
        newCart[id] -= 1;
      } else {
        delete newCart[id];
      }
      return newCart;
    });
  };

  // Handle Search Execution
  const handleSearch = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      navigate(`/search?query=${encodeURIComponent(e.target.value.trim())}`);
    }
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(cart).reduce((total, [id, qty]) => {
    let productPrice = 0;
    Object.values(PRODUCTS_DB).forEach((category) => {
      const p = category.find((item) => item.id === parseInt(id));
      if (p) productPrice = p.price;
    });
    return total + productPrice * qty;
  }, 0);

  return (
    <div className="bg-[#f4f6f9] min-h-screen font-sans pb-24 flex flex-col">
      {/* Main Navbar */}
      <WebsiteNavbar />

      <div className="mt-[70px] lg:mt-[85px] bg-white px-4 py-3 shadow-sm border-b border-zinc-100 relative z-30">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="flex justify-between items-center md:w-auto w-full gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="md:hidden p-1 bg-zinc-100 rounded-full active:scale-95"
              >
                <ArrowLeft size={20} className="text-zinc-700" />
              </button>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-zinc-900 flex items-center gap-1.5 leading-none">
                  Blink Node{" "}
                  <Zap
                    size={22}
                    className="text-emerald-500 fill-emerald-500"
                  />
                </h2>
                <div className="flex items-center gap-1.5 text-zinc-500 mt-1 cursor-pointer hover:text-emerald-600 transition-colors">
                  <MapPin size={12} />
                  <span className="text-xs sm:text-sm font-bold truncate max-w-[200px]">
                    Sector 45, Gurugram
                  </span>
                  <ChevronRight size={14} />
                </div>
              </div>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-sm">
              <Clock size={16} className="text-emerald-600 animate-pulse" />
              <div className="flex flex-col leading-none">
                <span className="text-[10px] text-emerald-600 font-bold uppercase">
                  Delivery in
                </span>
                <span className="text-emerald-700 text-sm font-black">
                  12 Mins
                </span>
              </div>
            </div>
          </div>

          <div className="relative w-full md:w-[400px] lg:w-[500px]">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              onKeyDown={handleSearch}
              placeholder="Search Essentials, Electronics, or Groceries..."
              className="w-full bg-zinc-100 border border-transparent focus:bg-white focus:border-emerald-500 focus:shadow-md rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-zinc-900 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* MOBILE CATEGORY STRIP */}
      <div className="md:hidden bg-white py-3 border-b border-zinc-100 sticky top-[64px] lg:top-[72px] z-40 shadow-sm">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar px-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? "bg-zinc-900 text-white shadow-md"
                  : "bg-zinc-100 text-zinc-600"
              }`}
            >
              <div className="scale-75 origin-left">{cat.icon}</div>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 mt-6 flex gap-8 relative">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden md:flex flex-col w-[240px] sticky top-[100px] h-[calc(100vh-120px)] overflow-y-auto hide-scrollbar shrink-0">
          <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 px-2">
            Categories
          </h3>
          <div className="flex flex-col gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left ${
                  activeCategory === cat.id
                    ? "bg-white shadow-md border border-zinc-200 scale-105 z-10"
                    : "hover:bg-zinc-200/50 text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${activeCategory === cat.id ? cat.color : "bg-zinc-100 text-zinc-500"}`}
                >
                  {cat.icon}
                </div>
                <span
                  className={`text-sm ${activeCategory === cat.id ? "font-black text-zinc-900" : "font-bold"}`}
                >
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 pb-10 min-w-0">
          {/* PROMO BANNER */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-zinc-900 rounded-3xl p-6 sm:p-8 flex items-center justify-between mb-10 overflow-hidden relative shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-transparent" />
            <div className="relative z-10 text-white">
              <span className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md mb-3 inline-block">
                First Order
              </span>
              <h3 className="text-3xl sm:text-4xl font-black mb-2 tracking-tighter">
                Get 20% OFF
              </h3>
              <p className="text-zinc-400 text-sm font-medium mb-6">
                On your first Hyperlocal delivery.
              </p>
              <button className="bg-white text-zinc-900 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-emerald-400 hover:text-white transition-colors">
                Use Code: INDIAFY20
              </button>
            </div>
            <div className="absolute right-[-20px] bottom-[-40px] opacity-20 transform -rotate-12">
              <Gift size={200} strokeWidth={0.5} className="text-white" />
            </div>
          </motion.div>

          {/* DYNAMIC SECTIONS LOOP */}
          {CATEGORIES.map((category) => (
            <div
              key={category.id}
              id={category.id}
              className="mb-12 scroll-mt-[120px]"
            >
              <div className="flex justify-between items-end mb-5">
                <h3 className="text-xl sm:text-2xl font-black text-zinc-900 flex items-center gap-2">
                  {category.name}{" "}
                  <ChevronRight size={20} className="text-zinc-400" />
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4">
                {isLoading
                  ? /* SKELETON LOADER */
                    Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-[1.5rem] p-3 border border-zinc-100 shadow-sm animate-pulse h-[280px]"
                      >
                        <div className="w-full aspect-square bg-zinc-200 rounded-xl mb-3" />
                        <div className="w-3/4 h-4 bg-zinc-200 rounded-md mb-2" />
                        <div className="w-1/2 h-3 bg-zinc-200 rounded-md mb-6" />
                        <div className="flex justify-between items-end">
                          <div className="w-1/3 h-5 bg-zinc-200 rounded-md" />
                          <div className="w-16 h-8 bg-zinc-200 rounded-xl" />
                        </div>
                      </div>
                    ))
                  : /* REAL PRODUCTS */
                    PRODUCTS_DB[category.id]?.map((product) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        key={product.id}
                        // LINKED: Navigate to product detail page
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="bg-white rounded-[1.5rem] p-3 border border-zinc-100 hover:border-emerald-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col relative group cursor-pointer"
                      >
                        {product.discount && (
                          <div className="absolute top-0 left-3 bg-indigo-600 text-white text-[9px] font-black px-2.5 py-1 rounded-b-xl shadow-sm z-10 flex items-center gap-1">
                            <Zap size={10} className="fill-white" />{" "}
                            {product.discount}
                          </div>
                        )}

                        <div className="w-full aspect-square bg-zinc-100 rounded-xl mb-3 overflow-hidden relative border border-black/5">
                          <img
                            src={product.img}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-zinc-100">
                            <Clock size={10} className="text-zinc-500" />
                            <span className="text-[9px] font-black text-zinc-700">
                              {product.time}
                            </span>
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col">
                          <h4 className="text-sm font-bold text-zinc-900 leading-tight mb-1 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                            {product.name}
                          </h4>
                          <span className="text-[11px] font-bold text-zinc-400 mb-3">
                            {product.weight}
                          </span>

                          <div className="mt-auto flex items-center justify-between">
                            <div>
                              <div className="text-sm font-black text-zinc-900">
                                ₹{product.price}
                              </div>
                              {product.price !== product.mrp && (
                                <div className="text-[10px] font-bold text-zinc-400 line-through">
                                  ₹{product.mrp}
                                </div>
                              )}
                            </div>

                            {cart[product.id] ? (
                              <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className="flex items-center bg-emerald-600 text-white rounded-xl h-9 shadow-md shadow-emerald-600/20"
                              >
                                <button
                                  // STOP PROPAGATION added here
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDec(product.id);
                                  }}
                                  className="w-8 h-full flex items-center justify-center active:bg-emerald-700 rounded-l-xl transition-colors"
                                >
                                  <Minus size={14} strokeWidth={3} />
                                </button>
                                <span className="w-6 text-center text-xs font-black">
                                  {cart[product.id]}
                                </span>
                                <button
                                  // STOP PROPAGATION added here
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleInc(product.id);
                                  }}
                                  className="w-8 h-full flex items-center justify-center active:bg-emerald-700 rounded-r-xl transition-colors"
                                >
                                  <Plus size={14} strokeWidth={3} />
                                </button>
                              </motion.div>
                            ) : (
                              <button
                                // STOP PROPAGATION added here
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAdd(product.id);
                                }}
                                className="border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 h-9 px-5 rounded-xl text-xs font-black tracking-wide active:scale-95 transition-all shadow-sm"
                              >
                                ADD
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />

      {/* SMART BOTTOM CART POPUP */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ y: 150, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 150, opacity: 0 }}
            className="fixed bottom-4 sm:bottom-6 left-0 w-full z-50 px-4 pointer-events-none flex justify-center"
          >
            <div
              onClick={() => navigate("/cart")}
              className="pointer-events-auto w-full max-w-[400px] bg-emerald-600 text-white p-3 sm:p-4 rounded-2xl shadow-[0_20px_40px_rgba(16,185,129,0.4)] cursor-pointer hover:bg-emerald-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-sm relative overflow-hidden">
                  <ShoppingBag size={20} className="text-white relative z-10" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-[10px] font-black text-black z-20 shadow-sm border-2 border-emerald-600">
                    {totalItems}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest mb-0.5">
                    Total Payload
                  </p>
                  <p className="text-lg font-black leading-none">
                    ₹{totalPrice}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-black tracking-widest uppercase bg-white text-emerald-700 px-4 py-2.5 rounded-xl shadow-sm">
                Checkout <ChevronRight size={16} strokeWidth={3} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />
    </div>
  );
}