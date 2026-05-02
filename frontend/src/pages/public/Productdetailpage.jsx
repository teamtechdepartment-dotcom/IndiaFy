
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
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

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

import { useAuthStore } from "../../store/authStore";

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
      } catch (err) {
        toast.error("Failed to load product details");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  if (isLoading) {
    return <div className="min-h-screen bg-white flex items-center justify-center"><p className="text-xl font-bold uppercase text-zinc-400">Loading Product...</p></div>;
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
      localStorage.setItem("pending_purchase", JSON.stringify({
        productId: idToUse,
        quantity: quantity,
        product: p
      }));
      
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
    } catch (err) {
      navigate("/checkout", { state: { testProduct: p } });
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <WebsiteNavbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        {/* ✅ Back → go to previous page */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors mb-8 font-bold text-xs uppercase tracking-widest"
        >
          <ChevronLeft size={16} /> Back to Collection
        </button>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          {/* 1. LEFT: GALLERY SECTION */}
          <div className="lg:col-span-7">
            <div className="sticky top-32 space-y-6">
              <motion.div
                layoutId="main-img"
                className="relative aspect-[4/3] rounded-[3rem] overflow-hidden bg-zinc-50 border border-zinc-100 shadow-sm"
              >
                <img
                  src={pImages[activeImg]}
                  className="w-full h-full object-cover"
                  alt="Main"
                />

                {/* ✅ Video Verified badge → seller's video verification page */}
                <button
                  onClick={() => navigate(`/store/${pSeller._id || pSeller.id}`)}
                  className="absolute top-6 left-6 bg-zinc-900/90 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors"
                >
                  <Video size={14} className="text-emerald-400" /> Video-Verified Store
                </button>

                {/* ✅ Wishlist toggle on main image */}
                <button
                  onClick={() => setWishlisted((w) => !w)}
                  className="absolute top-6 right-6 p-3 rounded-full bg-white shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  <Heart
                    size={18}
                    className={wishlisted ? "text-red-500 fill-red-500" : "text-zinc-400"}
                  />
                </button>
              </motion.div>

              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {pImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-24 h-24 rounded-3xl overflow-hidden border-2 transition-all ${
                      activeImg === i
                        ? "border-zinc-900 scale-95 shadow-lg"
                        : "border-transparent opacity-60"
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="thumb" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. RIGHT: PRODUCT INFO SECTION */}
          <div className="lg:col-span-5 space-y-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  {p.brand || PRODUCT.brand}
                </span>
                <span className="h-1 w-1 rounded-full bg-zinc-300"></span>
                <div className="flex items-center gap-1 text-zinc-900 text-xs font-bold">
                  <Star size={12} fill="currentColor" /> {PRODUCT.rating}
                </div>
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
                      {p.productName || (p.brand ? `${p.brand}'s Product` : "Verified Product")}
                      <BadgeCheck size={24} className="text-emerald-500" />
                    </h1>
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-black text-zinc-900">
                  {fmt(pPrice)}
                </span>
                <span className="text-xl text-zinc-300 line-through font-bold">
                  {fmt(pOriginalPrice)}
                </span>
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full uppercase">
                  Save {Math.round(((pOriginalPrice - pPrice) / pOriginalPrice) * 100)}%
                </span>
              </div>
            </div>

            {/* ✅ SELLER CARD → /store/:id */}
            <div
              onClick={() => navigate(`/store/${pSeller._id || pSeller.id}`)}
              className="p-6 rounded-[2.5rem] bg-zinc-50 border border-zinc-100 cursor-pointer hover:border-zinc-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-white font-black">
                    {(pSeller.businessName || pSeller.name)?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-zinc-400">Sold by</p>
                    <p className="font-bold text-zinc-900">{pSeller.businessName || pSeller.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-emerald-600 text-xs font-black uppercase">
                    <BadgeCheck size={14} /> Verified
                  </div>
                  <p className="text-[10px] font-bold text-zinc-400 mt-1">
                    {PRODUCT.seller.distance} • {pSeller.city || PRODUCT.seller.sector}
                  </p>
                </div>
              </div>
              {PRODUCT.seller.videoPacking && (
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-zinc-200/50">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 size={16} />
                  </div>
                  <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-tighter">
                    Mandatory Video Packing Enabled
                  </p>
                </div>
              )}
            </div>

            {/* QUICK DELIVERY INFO */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Clock, val: PRODUCT.delivery.eta },
                { icon: ShieldCheck, val: "1Y Warranty" },
                { icon: Truck, val: "Free Ship" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-50 p-4 rounded-3xl border border-zinc-100 flex flex-col items-center gap-2"
                >
                  <item.icon size={18} className="text-zinc-400" />
                  <span className="text-[10px] font-black uppercase text-zinc-900">
                    {item.val}
                  </span>
                </div>
              ))}
            </div>

            {/* ✅ BUTTONS — Add to Cart → /cart | Buy Now → /checkout */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-4 sm:py-5 bg-white border-2 border-zinc-900 rounded-3xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-zinc-50 transition-all flex items-center justify-center gap-3"
              >
                <ShoppingBag size={18} /> Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 py-4 sm:py-5 bg-zinc-900 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-2xl shadow-zinc-300 hover:bg-zinc-800 transition-all flex items-center justify-center gap-3"
              >
                <Zap size={18} className="text-yellow-400 fill-yellow-400" /> Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* ─── TABS SECTION ─── */}
        <div className="mt-24">
          <div className="flex gap-6 sm:gap-10 border-b border-zinc-100 mb-10 overflow-x-auto no-scrollbar whitespace-nowrap">
            {["description", "specifications", "reviews"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${
                  tab === t ? "text-zinc-900" : "text-zinc-300 hover:text-zinc-500"
                }`}
              >
                {t}
                {tab === t && (
                  <motion.div
                    layoutId="tab-line"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-900 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="min-h-[300px]">
            {tab === "description" && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg text-zinc-500 leading-relaxed font-medium max-w-4xl"
              >
                {p.description || PRODUCT.description}
              </motion.p>
            )}
            {tab === "specifications" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid md:grid-cols-2 gap-4"
              >
                {PRODUCT.specs.map((s, i) => (
                  <div
                    key={i}
                    className="flex justify-between p-6 bg-zinc-50 rounded-2xl border border-zinc-100"
                  >
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
                      {s.label}
                    </span>
                    <span className="text-sm font-bold text-zinc-900">{s.value}</span>
                  </div>
                ))}
              </motion.div>
            )}
            {tab === "reviews" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-12"
              >
                <div className="grid md:grid-cols-3 gap-8 bg-zinc-50 p-8 rounded-[2.5rem] border border-zinc-100">
                  <div className="text-center md:border-r border-zinc-200 flex flex-col justify-center">
                    <h4 className="text-6xl font-black text-zinc-900">{PRODUCT.rating}</h4>
                    <div className="flex justify-center gap-1 my-3 text-zinc-900">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={18} fill={i < 4 ? "currentColor" : "none"} />
                      ))}
                    </div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      Based on 3.8k Reviews
                    </p>
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    {[5, 4, 3, 2, 1].map((n) => (
                      <div key={n} className="flex items-center gap-4 text-xs font-bold">
                        <span className="w-4">{n}</span>
                        <div className="flex-1 h-2 bg-zinc-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-zinc-900"
                            style={{ width: `${n === 5 ? 70 : 20}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-zinc-400">
                          {n === 5 ? "70%" : "20%"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-6">
                  {PRODUCT.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-8 rounded-[2rem] border border-zinc-100 bg-white hover:shadow-xl transition-all"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center font-black">
                            {rev.avatar}
                          </div>
                          <div>
                            <p className="font-bold text-zinc-900">{rev.user}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Star size={10} fill="currentColor" />
                              <span className="text-[10px] font-bold text-zinc-400 uppercase">
                                {rev.date}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">
                          Verified Purchase
                        </span>
                      </div>
                      <h5 className="font-bold text-zinc-900 mb-2">{rev.title}</h5>
                      <p className="text-zinc-500 text-sm leading-relaxed mb-6">{rev.body}</p>
                      <button className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-zinc-900 transition-colors">
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
        <div className="mt-32">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-3xl font-black text-zinc-900 tracking-tighter">
              You may also <span className="text-zinc-300 italic">like</span>
            </h3>
            <div className="h-px flex-1 bg-zinc-100 mx-8 hidden md:block" />
            {/* ✅ View All → /search filtered by product brand/category */}
            <button
              onClick={() => navigate(`/search?q=${PRODUCT.brand}`)}
              className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {RELATED_PRODUCTS.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  navigate(`/product/${p.id}`); // ✅ → /product/:id
                  window.scrollTo(0, 0);
                }}
                className="group cursor-pointer"
              >
                <div className="aspect-square rounded-[2rem] overflow-hidden bg-zinc-50 border border-zinc-100 mb-4">
                  <img
                    src={p.img}
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                    alt={p.name}
                  />
                </div>
                <div className="px-2">
                  <h4 className="font-bold text-zinc-900 text-sm line-clamp-1 mb-1">
                    {p.name}
                  </h4>
                  <div className="flex justify-between items-center">
                    <span className="font-black text-zinc-900">{fmt(p.price)}</span>
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
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