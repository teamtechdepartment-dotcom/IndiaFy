import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProductStore } from "../../store/productStore";
import { useCartStore } from "../../store/cartStore";
import { useProfileStore } from "../../store/profileStore";
import { useAuthStore } from "../../store/authStore";
import {
  ShoppingCart,
  Heart,
  Star,
  Zap,
  ShieldCheck,
  Truck,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

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
    reviews: 320,
    distance: "0.8 km",
    tag: "Quick Commerce",
    deliveryTime: "15 min",
    image: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Luxury Silk Evening Wrap",
    seller: "The Boutique Hub",
    price: "2,450",
    oldPrice: "3,200",
    rating: 4.7,
    reviews: 156,
    distance: "1.5 km",
    tag: "E-Commerce",
    deliveryTime: "Same Day",
    image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Bulk Pack: Roasted Almonds (5kg)",
    seller: "Wholesale Central",
    price: "4,800",
    oldPrice: "6,000",
    rating: 4.8,
    reviews: 89,
    distance: "3.2 km",
    tag: "Wholesale",
    deliveryTime: "Next Day",
    image: "https://images.unsplash.com/photo-1508061461508-cb18c242f556?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Handcrafted Ceramic Vase",
    seller: "Modern Home Decor",
    price: "899",
    oldPrice: "1,200",
    rating: 4.6,
    reviews: 234,
    distance: "2.1 km",
    tag: "E-Commerce",
    deliveryTime: "Same Day",
    image: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "Organic Cold-Pressed Coconut Oil",
    seller: "Nature's Own",
    price: "549",
    oldPrice: "750",
    rating: 4.8,
    reviews: 412,
    distance: "1.1 km",
    tag: "Quick Commerce",
    deliveryTime: "20 min",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacdc50f46?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 6,
    name: "Wireless Noise-Cancelling Earbuds",
    seller: "Tech Zone",
    price: "3,499",
    oldPrice: "4,999",
    rating: 4.5,
    reviews: 567,
    distance: "2.5 km",
    tag: "E-Commerce",
    deliveryTime: "Same Day",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 7,
    name: "Premium Basmati Rice 5kg",
    seller: "Grain Mart",
    price: "699",
    oldPrice: "899",
    rating: 4.7,
    reviews: 198,
    distance: "0.6 km",
    tag: "Quick Commerce",
    deliveryTime: "12 min",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 8,
    name: "Cotton Formal Shirt - Slim Fit",
    seller: "Vogue Men's Wear",
    price: "1,499",
    oldPrice: "2,200",
    rating: 4.6,
    reviews: 145,
    distance: "1.8 km",
    tag: "E-Commerce",
    deliveryTime: "Same Day",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop",
  },
];

function getDiscount(oldPrice, price) {
  const old = parseFloat(String(oldPrice).replace(/,/g, ''));
  const current = parseFloat(String(price).replace(/,/g, ''));
  if (!old || !current || old <= current) return null;
  return Math.round(((old - current) / old) * 100);
}

export default function TrendingProducts() {
  const navigate = useNavigate();
  const { products, fetchProducts } = useProductStore();
  const addToCart = useCartStore((state) => state.addToCart);
  const { profile, fetchProfile } = useProfileStore();
  const { isAuthenticated: isCustomerAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isCustomerAuthenticated) {
      fetchProfile();
    }
  }, [fetchProfile, isCustomerAuthenticated]);

  useEffect(() => {
    if (profile?.interests && profile.interests.length > 0) {
      const randomInterest = profile.interests[Math.floor(Math.random() * profile.interests.length)];
      fetchProducts(randomInterest);
    } else {
      fetchProducts();
    }
  }, [fetchProducts, profile]);

  const displayProducts = products.length > 0 ? products : trendingProducts;

  return (
    <section className="py-section-mobile md:py-section-tablet lg:py-section-desktop bg-brand-background" id="trending">
      <div className="section-container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="section-heading mb-2">
              {profile?.interests?.length > 0 ? "Recommended for You" : "Trending Near You"}
            </h2>
            <p className="text-brand-text-secondary font-medium text-sm sm:text-base">
              {profile?.interests?.length > 0
                ? "Curated picks based on your interests"
                : "Most loved products from verified sellers nearby"}
            </p>
          </motion.div>

          <button
            onClick={() => navigate("/search?q=trending")}
            className="flex items-center gap-2 text-sm font-semibold text-brand-accent hover:text-brand-accent-hover transition-colors"
          >
            View All <ArrowRight size={16} />
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {displayProducts.slice(0, 8).map((product, index) => {
            const isReal = !!product._id;
            const id = isReal ? product._id : product.id;
            const name = isReal ? product.productName : product.name;
            const sellerName = isReal ? (product.sellerId?.firstName + " " + (product.sellerId?.lastName || "")) : product.seller;
            const price = isReal ? (product.attribute?.salePrice || "0") : product.price;
            const oldPrice = isReal ? (product.attribute?.mrpPrice || "0") : product.oldPrice;
            const image = isReal ? (product.productImage?.[0]) : product.image;
            const rating = product.rating || 4.5;
            const reviews = product.reviews || 0;
            const deliveryTime = product.deliveryTime || "Same Day";

            let realTag = "E-Commerce";
            if (isReal && product.nodeType) {
              if (product.nodeType === "quick-commerce") realTag = "Quick Commerce";
              else if (product.nodeType === "wholesale") realTag = "Wholesale";
              else if (product.nodeType === "local") realTag = "Local Retail";
              else realTag = product.nodeType;
            }
            const tag = isReal ? realTag : product.tag;
            const discount = getDiscount(oldPrice, price);

            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="card-base overflow-hidden">
                  {/* Image */}
                  <div
                    onClick={() => navigate(`/product/${id}`)}
                    className="relative aspect-square overflow-hidden cursor-pointer bg-gray-50"
                  >
                    <img
                      src={image || "https://placehold.co/400x400?text=Product"}
                      alt={name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Discount Badge */}
                    {discount && (
                      <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-brand-error text-white text-[10px] font-bold">
                        {discount}% OFF
                      </div>
                    )}

                    {/* Wishlist */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/profile");
                      }}
                      aria-label={`Add ${name} to wishlist`}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm text-brand-text-secondary hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <Heart size={16} />
                    </button>

                    {/* Add to Cart overlay */}
                    <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isReal) {
                            toast.info("This is a demo product.");
                            return;
                          }
                          addToCart(id, 1);
                        }}
                        className="w-full py-2.5 bg-brand-primary text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-brand-secondary transition-colors shadow-lg"
                      >
                        <ShoppingCart size={15} /> Add to Cart
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3.5 sm:p-4">
                    {/* Seller */}
                    <button
                      onClick={() => {
                        if (isReal && product.sellerId?._id) {
                          navigate(`/store/${product.sellerId._id}`);
                        } else {
                          toast.info("Store page coming soon for this demo seller.");
                        }
                      }}
                      className="flex items-center gap-1 mb-1"
                    >
                      <ShieldCheck size={12} className="text-brand-accent" />
                      <span className="text-[10px] font-semibold text-brand-text-secondary hover:text-brand-primary transition-colors truncate">
                        {sellerName}
                      </span>
                    </button>

                    {/* Name */}
                    <h3
                      onClick={() => navigate(`/product/${id}`)}
                      className="text-sm font-semibold text-brand-primary mb-2 line-clamp-2 leading-snug cursor-pointer hover:text-brand-accent transition-colors min-h-[2.5rem]"
                    >
                      {name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-100">
                        <Star size={11} fill="#F59E0B" className="text-amber-400" />
                        <span className="text-[11px] font-bold text-amber-700">{rating}</span>
                      </div>
                      {reviews > 0 && (
                        <span className="text-[10px] text-brand-text-secondary">({reviews})</span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-2.5">
                      <span className="text-base font-bold text-brand-primary">₹{price}</span>
                      {oldPrice && oldPrice !== price && (
                        <span className="text-xs text-brand-text-secondary line-through">₹{oldPrice}</span>
                      )}
                    </div>

                    {/* Delivery Badge */}
                    <div className="flex items-center gap-1.5">
                      {tag === "Quick Commerce" ? (
                        <>
                          <Zap size={12} className="text-brand-accent" />
                          <span className="text-[11px] font-semibold text-brand-accent">{deliveryTime} delivery</span>
                        </>
                      ) : (
                        <>
                          <Truck size={12} className="text-brand-text-secondary" />
                          <span className="text-[11px] font-medium text-brand-text-secondary">Free Delivery</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}