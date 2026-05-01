
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProductStore } from "../../store/productStore";
import { useCartStore } from "../../store/cartStore";
import { useProfileStore } from "../../store/profileStore";
import {
  ShoppingCart,
  Heart,
  Star,
  Zap,
  ShieldCheck,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

// ✅ Tag → route mapping
const tagRoutes = {
  "Quick Commerce": "/quick-commerce",
  "E-Commerce": "/category/ecommerce",
  "Wholesale": "/wholesale",
};

const trendingProducts = [
  {
    id: 1,
    name: "Premium A2 Desi Cow Ghee",
    seller: "Organic Roots Store",
    price: "1,299",
    oldPrice: "1,500",
    rating: 4.9,
    distance: "0.8 km",
    tag: "Quick Commerce",
    image:
      "https://images.unsplash.com/photo-1589927986089-35812388d1f4?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Luxury Silk Evening Wrap",
    seller: "The Boutique Hub",
    price: "2,450",
    oldPrice: "3,200",
    rating: 4.7,
    distance: "1.5 km",
    tag: "E-Commerce",
    image:
      "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Bulk Pack: Roasted Almonds (5kg)",
    seller: "Wholesale Central",
    price: "4,800",
    oldPrice: "6,000",
    rating: 4.8,
    distance: "3.2 km",
    tag: "Wholesale",
    image:
      "https://images.unsplash.com/photo-1508061461508-cb18c242f556?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Handcrafted Ceramic Vase",
    seller: "Modern Home Decor",
    price: "899",
    oldPrice: "1,200",
    rating: 4.6,
    distance: "2.1 km",
    tag: "E-Commerce",
    image:
      "https://images.unsplash.com/photo-1581783898377-1c85bf937427?q=80&w=1000&auto=format&fit=crop",
  },
];

export default function TrendingProducts() {
  const scrollContainerRef = useRef(null);
  const [isTouched, setIsTouched] = useState(false);
  const navigate = useNavigate();
  const { products, fetchProducts } = useProductStore();
  const addToCart = useCartStore((state) => state.addToCart);
  const { profile, fetchProfile } = useProfileStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile?.interests && profile.interests.length > 0) {
      const randomInterest = profile.interests[Math.floor(Math.random() * profile.interests.length)];
      fetchProducts(randomInterest);
    } else {
      fetchProducts();
    }
  }, [fetchProducts, profile]);

  const displayProducts = products.length > 0 ? products : trendingProducts;

  // Auto-scroll logic
  useEffect(() => {
    if (isTouched || displayProducts.length <= 4) return;

    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        const cardElement = scrollContainerRef.current.firstElementChild;
        const scrollAmount = cardElement ? cardElement.clientWidth + 16 : 300;

        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isTouched]);

  const scroll = (direction) => {
    setIsTouched(true);
    if (scrollContainerRef.current) {
      const cardElement = scrollContainerRef.current.firstElementChild;
      const scrollAmount = cardElement ? cardElement.clientWidth + 16 : 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight mb-2">
              {profile?.interests?.length > 0 ? "Recommended for You" : "Trending in Gurugram"}
            </h2>
            <p className="text-zinc-500 font-medium text-sm md:text-base">
              {profile?.interests?.length > 0 ? "Curated picks based on your interests." : "Most loved products from your nearby verified sectors."}
            </p>
          </motion.div>

          <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-6">
            {/* ✅ "Explore All" → /search?q=trending */}
            <button
              onClick={() => navigate("/search?q=trending")}
              className="flex items-center gap-2 font-bold text-sm uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              Explore All <Zap size={16} fill="currentColor" className="text-yellow-400" />
            </button>

            {/* Scroll Arrows */}
            <div className="flex gap-2">
              <button
                onClick={() => scroll("left")}
                className="p-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => scroll("right")}
                className="p-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Product Carousel */}
        <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
          <div
            ref={scrollContainerRef}
            onPointerDown={() => setIsTouched(true)}
            onMouseEnter={() => setIsTouched(true)}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-8 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {displayProducts.map((product, index) => {
              const isReal = !!product._id;
              const id = isReal ? product._id : product.id;
              const name = isReal ? product.productName : product.name;
              const sellerName = isReal ? (product.sellerId?.firstName + " " + (product.sellerId?.lastName || "")) : product.seller;
              const price = isReal ? (product.attribute?.salePrice || "0") : product.price;
              const oldPrice = isReal ? (product.attribute?.mrpPrice || "0") : product.oldPrice;
              const image = isReal ? (product.productImage?.[0]) : product.image;
              const tag = isReal ? "E-Commerce" : product.tag;
              const rating = product.rating || 4.5;
              const distance = product.distance || "1.2 km";

              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group flex-none w-[280px] sm:w-[320px] snap-start"
                >
                  <div
                    onClick={() => navigate(`/product/${id}`)}
                    className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-zinc-100 mb-5 shadow-sm group-hover:shadow-xl transition-all duration-500 cursor-pointer"
                  >
                    <img
                      src={image || "https://placehold.co/400x500?text=No+Image"}
                      alt={name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 pointer-events-none"
                    />
                    <div className="absolute top-4 left-4">
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(tagRoutes[tag] || "/");
                        }}
                        className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-tighter text-zinc-900 shadow-sm cursor-pointer hover:bg-white transition-colors"
                      >
                        {tag}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/profile");
                      }}
                      className="absolute top-4 right-4 p-2.5 rounded-full bg-white text-zinc-400 hover:text-red-500 shadow-md transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <Heart size={18} />
                    </button>
                    <div className="absolute inset-x-4 bottom-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isReal) {
                            toast.info("This is a demo product.");
                            return;
                          }
                          addToCart(id, 1);
                        }}
                        className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-2xl hover:bg-zinc-700 transition-colors"
                      >
                        <ShoppingCart size={18} /> Add to Cart
                      </button>
                    </div>
                  </div>
                  <div className="px-2 cursor-pointer" onClick={() => navigate(`/product/${id}`)}>
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldCheck size={14} className="text-zinc-400" />
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">
                        {sellerName}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 mb-2 group-hover:text-zinc-600 transition-colors truncate">
                      {name}
                    </h3>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-zinc-900">₹{price}</span>
                        <span className="text-sm text-zinc-400 line-through font-medium">₹{oldPrice}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-zinc-100 px-2 py-1 rounded-lg">
                        <Star size={12} fill="currentColor" className="text-zinc-900" />
                        <span className="text-xs font-bold text-zinc-900">{rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <MapPin size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-tight">{distance} from your sector</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}