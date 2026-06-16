/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCartStore } from "../../store/cartStore";
import {
  Star,
  MapPin,
  BadgeCheck,
  ShieldCheck,
  Video,
  Truck,
  Zap,
  ShoppingBag,
  Heart,
  ChevronLeft,
  CheckCircle2,
  Clock,
  ThumbsUp,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import SEOHead from "../../components/seo/SEOHead";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { useAuthStore } from "../../store/authStore";

// ─── DATA ────────────────────────────────────────────────────────────────────
const PRODUCT = {
  id: 1,
  title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
  brand: "Sony",
  rating: 4.6,
  reviewCount: 3847,
  currentPrice: 24990,
  originalPrice: 34990,
  images: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80",
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80",
    "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&q=80",
  ],
  seller: {
    id: "sharma-electronics", // ✅ seller id for /store/:id
    name: "Sharma Electronics",
    rating: 4.5,
    distance: "1.3 km",
    verified: true,
    sector: "DLF Phase 3",
    videoPacking: true,
  },
  delivery: { eta: "15–25 mins", inStock: true, free: true },
  description:
    "Industry-leading noise cancellation with Sony's flagship WH-1000XM5. Featuring 8 microphones and two processors for unparalleled audio quality. The soft-fit leather and aluminum design gives it a premium feel while the auto-optimize technology senses wearing conditions to deliver the best audio experience.",
  specs: [
    { label: "Driver Unit", value: "30 mm, dome type" },
    { label: "Battery Life", value: "Up to 30 hours" },
    { label: "Connectivity", value: "Bluetooth 5.2" },
    { label: "Weight", value: "250 g" },
  ],
  reviews: [
    {
      id: 1,
      user: "Arjun M.",
      avatar: "AM",
      rating: 5,
      date: "Feb 2025",
      title: "Best headphones I've ever owned",
      body: "The noise cancellation is absolutely mind-blowing. I used them on a 6-hour flight and couldn't hear a thing. Sound quality is incredible too.",
      helpful: 124,
    },
    {
      id: 2,
      user: "Priya S.",
      avatar: "PS",
      rating: 5,
      date: "Jan 2025",
      title: "Worth every rupee",
      body: "Premium build, crazy good ANC, and the multipoint connection works flawlessly. Best experience in Gurugram traffic!",
      helpful: 89,
    },
  ],
};

const RELATED_PRODUCTS = [
  {
    id: 2,
    name: "Sony WF-1000XM5 Earbuds",
    price: 19990,
    rating: 4.8,
    dist: "1.3 km",
    img: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80",
  },
  {
    id: 3,
    name: "Bose QuietComfort Ultra",
    price: 32900,
    rating: 4.7,
    dist: "2.5 km",
    img: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&q=80",
  },
  {
    id: 4,
    name: "Apple AirPods Max",
    price: 59900,
    rating: 4.9,
    dist: "0.8 km",
    img: "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=400&q=80",
  },
  {
    id: 5,
    name: "Sennheiser Momentum 4",
    price: 29990,
    rating: 4.6,
    dist: "4.1 km",
    img: "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=400&q=80",
  },
];

const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");

// ... existing code ...

export default function ProductDetailPage() {
  const { id } = useParams();
  const [activeImg, setActiveImg] = useState(0);
  const [tab, setTab] = useState("description");
  const [wishlisted, setWishlisted] = useState(false);
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart);
  const { isAuthenticated } = useAuthStore();

  const [productData, setProductData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axiosInstance.get(`/products/${id}`);
        setProductData(res.data);
      } catch (_err) {
        toast.error("Failed to load product details");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-xl font-bold uppercase text-slate-600">Loading Product...</p>
      </div>
    );
  }

  // Robust data mapping from backend or fallback to static
  const p = productData || PRODUCT;
  const pImages = p.productImage?.length > 0 ? p.productImage : PRODUCT.images;

  // Backend attribute structure is an object, but sometimes we might get an array in different versions
  const attribute = Array.isArray(p.attribute) ? p.attribute[0] : p.attribute;
  const pPrice = attribute?.salePrice || attribute?.price || PRODUCT.currentPrice;
  const pOriginalPrice = attribute?.mrpPrice || PRODUCT.originalPrice;

  const pSeller = p.sellerId || PRODUCT.seller;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.warn("Please login to add items to cart");
      navigate("/login");
      return;
    }

    const idToUse = productData?._id || "507f1f77bcf86cd799439011";

    if (!productData) {
      toast.info("Adding Demo Product to cart for testing...");
    }

    await addToCart(idToUse, quantity);
  };

  const handleBuyNow = async () => {
    const idToUse = productData?._id || "507f1f77bcf86cd799439011";

    if (!isAuthenticated) {
      // Save pending purchase info to localStorage
      localStorage.setItem(
        "pending_purchase",
        JSON.stringify({
          productId: idToUse,
          quantity: quantity,
          product: p,
        })
      );

      toast.warn("Please login to proceed to checkout");
      navigate("/login?redirect=checkout");
      return;
    }

    if (!productData) {
      toast.info("Proceeding with Demo Product for testing...");
    }

    try {
      await addToCart(idToUse, quantity);
      navigate("/checkout", { state: { testProduct: p } });
    } catch (_err) {
      navigate("/checkout", { state: { testProduct: p } });
    }
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.productName || p.brand || "Verified Product",
    image: pImages,
    description: p.description || PRODUCT.description,
    offers: {
      "@type": "Offer",
      url: typeof window !== "undefined" ? window.location.href : "https://india-fy.vercel.app",
      priceCurrency: "INR",
      price: pPrice,
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: pSeller.businessName || pSeller.name,
      },
    },
  };

  return (
    <div className="bg-white min-h-screen relative overflow-hidden">
      <SEOHead
        title={`${p.productName || p.brand || "Product"} | Indiafy`}
        description={p.description || PRODUCT.description}
        image={pImages[0]}
        schemas={[productSchema]}
      />
      <WebsiteNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 md:pt-32 pb-16 md:pb-20 relative z-10">
        
        {/* Background Blobs for Hero Theme - Hidden on Mobile for Performance */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10 hidden md:block opacity-70">
          <div className="absolute top-[-10%] right-[10%] w-[40vw] h-[40vw] bg-gradient-to-br from-emerald-100/50 to-teal-100/30 rounded-full blur-[100px]" />
          <div className="absolute bottom-[20%] left-[-10%] w-[35vw] h-[35vw] bg-gradient-to-tr from-blue-100/40 to-indigo-100/20 rounded-full blur-[100px]" />
        </div>

        {/* ✅ Back → go to previous page */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-6 md:mb-8 font-bold text-[10px] md:text-xs uppercase tracking-widest"
        >
          <ChevronLeft size={16} /> Back to Collection
        </button>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16">
          {/* 1. LEFT: GALLERY SECTION */}
          <div className="lg:col-span-7">
            <div className="sticky top-24 md:top-32 space-y-4 md:space-y-6">
              <motion.div
                layoutId="main-img"
                className="relative aspect-square md:aspect-[4/3] rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-zinc-50 border border-zinc-100 shadow-sm"
              >
                <img
                  loading="lazy"
                  decoding="async"
                  src={pImages[activeImg]}
                  className="w-full h-full object-cover"
                  alt="Main"
                />

                {/* ✅ Video Verified badge */}
                <button
                  onClick={() => navigate(`/store/${pSeller._id || pSeller.id}`)}
                  className="absolute top-4 left-4 md:top-6 md:left-6 bg-white/90 backdrop-blur-md shadow-sm border border-slate-200/90 text-slate-900 px-3 md:px-4 py-2 rounded-full flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors"
                >
                  <Video size={14} className="text-emerald-500" /> <span className="hidden sm:inline">Video-Verified Store</span><span className="sm:hidden">Verified</span>
                </button>

                {/* ✅ Wishlist toggle */}
                <button
                  onClick={() => setWishlisted((w) => !w)}
                  className="absolute top-4 right-4 md:top-6 md:right-6 p-2.5 md:p-3 rounded-full bg-white/90 backdrop-blur-md shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  <Heart
                    size={18}
                    className={wishlisted ? "text-red-500 fill-red-500" : "text-slate-600"}
                  />
                </button>
              </motion.div>

              {/* Thumbnails */}
              <div className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar pb-2">
                {pImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 flex-shrink-0 rounded-2xl md:rounded-3xl overflow-hidden border-2 transition-all ${
                      activeImg === i
                        ? "border-emerald-500 scale-95 shadow-md"
                        : "border-transparent opacity-60"
                    }`}
                  >
                    <img
                      loading="lazy"
                      decoding="async"
                      src={img}
                      className="w-full h-full object-cover"
                      alt="thumb"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. RIGHT: PRODUCT INFO SECTION */}
          <div className="lg:col-span-5 space-y-8 md:space-y-10 mt-4 lg:mt-0">
            <div>
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                  {p.brand || PRODUCT.brand}
                </span>
                <span className="h-1 w-1 rounded-full bg-zinc-300"></span>
                <div className="flex items-center gap-1 text-slate-900 text-xs font-bold">
                  <Star size={12} fill="#10B981" className="text-emerald-500" /> {PRODUCT.rating}
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-start sm:items-center gap-2 leading-tight">
                {p.productName || (p.brand ? `${p.brand}'s Product` : "Verified Product")}
                <BadgeCheck size={24} className="text-emerald-500 flex-shrink-0 mt-1 sm:mt-0" />
              </h1>
              
              <div className="flex flex-wrap items-baseline gap-3 md:gap-4 mt-4">
                <span className="text-3xl md:text-4xl font-black text-slate-900">
                  {fmt(pPrice)}
                </span>
                <span className="text-lg md:text-xl text-slate-500 line-through font-bold">
                  {fmt(pOriginalPrice)}
                </span>
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full uppercase ml-auto sm:ml-0">
                  Save {Math.round(((pOriginalPrice - pPrice) / pOriginalPrice) * 100)}%
                </span>
              </div>
            </div>

            {/* ✅ SELLER CARD */}
            <div
              onClick={() => navigate(`/store/${pSeller._id || pSeller.id}`)}
              className="p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-emerald-50/50 to-teal-50/30 border border-emerald-100/50 cursor-pointer hover:border-emerald-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-emerald-600 font-black text-lg">
                    {(pSeller.businessName || pSeller.name)?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-500">Sold by</p>
                    <p className="font-bold text-slate-900 text-sm md:text-base line-clamp-1">{pSeller.businessName || pSeller.name}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center justify-end gap-1 text-emerald-600 text-[10px] md:text-xs font-black uppercase">
                    <BadgeCheck size={14} /> Verified
                  </div>
                  <p className="text-[9px] md:text-[10px] font-bold text-slate-500 mt-1">
                    {PRODUCT.seller.distance} • {pSeller.city || PRODUCT.seller.sector}
                  </p>
                </div>
              </div>
              {PRODUCT.seller.videoPacking && (
                <div className="flex items-center gap-2 md:gap-3 mt-3 md:mt-4 pt-3 md:pt-4 border-t border-emerald-100/50">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 size={14} />
                  </div>
                  <p className="text-[9px] md:text-[11px] font-bold text-slate-600 uppercase tracking-tighter">
                    Mandatory Video Packing Enabled
                  </p>
                </div>
              )}
            </div>

            {/* QUICK DELIVERY INFO */}
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              {[
                { icon: Clock, val: PRODUCT.delivery.eta },
                { icon: ShieldCheck, val: "1Y Warranty" },
                { icon: Truck, val: "Free Ship" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-50 p-3 md:p-4 rounded-2xl md:rounded-3xl border border-zinc-100 flex flex-col items-center gap-1.5 md:gap-2 text-center"
                >
                  <item.icon size={16} className="text-emerald-500 md:w-[18px] md:h-[18px]" />
                  <span className="text-[9px] md:text-[10px] font-black uppercase text-slate-900 leading-tight">
                    {item.val}
                  </span>
                </div>
              ))}
            </div>

            {/* ✅ BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-4 sm:py-5 bg-white border-2 border-slate-900 rounded-full font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2 md:gap-3"
              >
                <ShoppingBag size={18} /> Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 py-4 sm:py-5 bg-emerald-500 text-white rounded-full font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 md:gap-3"
              >
                <Zap size={18} className="text-white fill-white" /> Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* ─── TABS SECTION ─── */}
        <div className="mt-16 md:mt-24">
          <div className="flex gap-6 sm:gap-10 border-b border-zinc-100 mb-8 md:mb-10 overflow-x-auto no-scrollbar whitespace-nowrap">
            {["description", "specifications", "reviews"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-3 md:pb-4 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all relative ${
                  tab === t ? "text-emerald-600" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {t}
                {tab === t && (
                  <motion.div
                    layoutId="tab-line"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="min-h-[250px] md:min-h-[300px]">
            {tab === "description" && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-base md:text-lg text-slate-600 leading-relaxed font-medium max-w-4xl"
              >
                {p.description || PRODUCT.description}
              </motion.p>
            )}
            {tab === "specifications" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid sm:grid-cols-2 gap-3 md:gap-4"
              >
                {PRODUCT.specs.map((s, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-4 md:p-6 bg-zinc-50 rounded-xl md:rounded-2xl border border-zinc-100"
                  >
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500">
                      {s.label}
                    </span>
                    <span className="text-xs md:text-sm font-bold text-slate-900 text-right">{s.value}</span>
                  </div>
                ))}
              </motion.div>
            )}
            {tab === "reviews" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8 md:space-y-12"
              >
                <div className="grid md:grid-cols-3 gap-6 md:gap-8 bg-zinc-50 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-zinc-100">
                  <div className="text-center md:border-r border-zinc-200 flex flex-col justify-center">
                    <h4 className="text-5xl md:text-6xl font-black text-slate-900">{PRODUCT.rating}</h4>
                    <div className="flex justify-center gap-1 my-2 md:my-3 text-emerald-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} fill={i < 4 ? "#10B981" : "none"} className="md:w-[18px] md:h-[18px]" />
                      ))}
                    </div>
                    <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Based on 3.8k Reviews
                    </p>
                  </div>
                  <div className="md:col-span-2 space-y-2 md:space-y-3">
                    {[5, 4, 3, 2, 1].map((n) => (
                      <div key={n} className="flex items-center gap-3 md:gap-4 text-[10px] md:text-xs font-bold">
                        <span className="w-3 md:w-4">{n}</span>
                        <div className="flex-1 h-1.5 md:h-2 bg-zinc-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500"
                            style={{ width: `${n === 5 ? 70 : 20}%` }}
                          />
                        </div>
                        <span className="w-6 md:w-8 text-right text-slate-500">
                          {n === 5 ? "70%" : "20%"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:gap-6">
                  {PRODUCT.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-zinc-100 bg-white hover:shadow-lg hover:border-emerald-100 transition-all"
                    >
                      <div className="flex flex-wrap sm:flex-nowrap justify-between items-start mb-4 md:mb-6 gap-4">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-sm md:text-base">
                            {rev.avatar}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm md:text-base">{rev.user}</p>
                            <div className="flex items-center gap-1.5 mt-0.5 md:mt-1">
                              <Star size={10} fill="#10B981" className="text-emerald-500" />
                              <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase">
                                {rev.date}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase">
                          Verified Purchase
                        </span>
                      </div>
                      <h5 className="font-bold text-slate-900 mb-1.5 md:mb-2 text-sm md:text-base">{rev.title}</h5>
                      <p className="text-slate-600 text-xs md:text-sm leading-relaxed mb-4 md:mb-6">{rev.body}</p>
                      <button className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors">
                        <ThumbsUp size={14} /> Helpful ({rev.helpful})
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* ─── RELATED PRODUCTS ─── */}
        <div className="mt-20 md:mt-32">
          <div className="flex items-center justify-between mb-8 md:mb-12">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter">
              You may also <span className="text-emerald-600 italic">like</span>
            </h3>
            <div className="h-px flex-1 bg-slate-100 mx-4 md:mx-8 hidden sm:block" />
            <button
              onClick={() => navigate(`/search?q=${PRODUCT.brand}`)}
              className="flex items-center gap-1 text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 hover:text-emerald-600 transition-colors"
            >
              View All <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {RELATED_PRODUCTS.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  navigate(`/product/${p.id}`);
                  window.scrollTo(0, 0);
                }}
                className="group cursor-pointer"
              >
                <div className="aspect-square rounded-2xl md:rounded-[2rem] overflow-hidden bg-zinc-50 border border-zinc-100 mb-3 md:mb-4 relative">
                  <img
                    loading="lazy"
                    decoding="async"
                    src={p.img}
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                    alt={p.name}
                  />
                  {/* Subtle hover overlay to match the premium theme */}
                  <div className="absolute inset-0 bg-emerald-900/0 group-hover:bg-emerald-900/10 transition-colors duration-500" />
                </div>
                <div className="px-1 md:px-2">
                  <h4 className="font-bold text-slate-900 text-xs md:text-sm line-clamp-1 mb-1">
                    {p.name}
                  </h4>
                  <div className="flex justify-between items-center mt-1.5 md:mt-2">
                    <span className="font-black text-slate-900 text-sm md:text-base">{fmt(p.price)}</span>
                    <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest">
                      {p.dist}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}