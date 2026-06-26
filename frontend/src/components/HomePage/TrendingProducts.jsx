/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
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
    <section className="bg-brand-background px-2 py-2" id="trending">
      <div className="w-full bg-white shadow-sm p-4 sm:p-6 border border-brand-border">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-brand-border/50">
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-brand-text-primary">
              {profile?.interests?.length > 0 ? "Recommended for You" : "Trending Deals"}
            </h2>
          </motion.div>

          <button
            onClick={() => navigate("/search?q=trending")}
            className="flex items-center justify-center bg-brand-primary text-white w-8 h-8 rounded-full hover:bg-blue-800 transition-colors shadow-sm"
            aria-label="View All"
          >
            <ArrowRight size={18} />
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
                <div className="group border border-transparent hover:border-gray-200 hover:shadow-md rounded-md overflow-hidden transition-all duration-300 p-2 sm:p-3 relative bg-white">
                  {/* Image */}
                  <div
                    onClick={() => navigate(`/product/${id}`)}
                    className="relative aspect-square overflow-hidden cursor-pointer bg-white mb-3"
                  >
                    <img
                      src={image || "https://placehold.co/400x400?text=Product"}
                      alt={name}
                      loading="lazy"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Discount Badge */}
                    {discount && (
                      <div className="absolute top-0 left-0 px-2 py-1 bg-brand-accent text-white text-[10px] font-bold shadow-sm rounded-br-md">
                        {discount}% OFF
                      </div>
                    )}
                    
                    {/* Wishlist */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/profile");
                      }}
                      className="absolute top-1 right-1 p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-100 transition-colors"
                    >
                      <Heart size={16} />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col h-full">
                    <h3
                      onClick={() => navigate(`/product/${id}`)}
                      className="text-sm text-brand-text-primary mb-1 line-clamp-2 cursor-pointer hover:text-brand-primary transition-colors min-h-[40px]"
                    >
                      {name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex items-center gap-0.5 px-1 bg-green-700 text-white rounded-[3px]">
                        <span className="text-[10px] font-bold">{rating}</span>
                        <Star size={8} fill="white" className="text-white" />
                      </div>
                      <span className="text-[10px] text-brand-text-secondary">({reviews})</span>
                      {/* <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_62673a.png" alt="assured" className="h-4 ml-auto" /> */}
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-2 mt-auto">
                      <span className="text-base font-bold text-brand-text-primary">₹{price}</span>
                      {oldPrice && oldPrice !== price && (
                        <span className="text-[11px] text-brand-text-secondary line-through">₹{oldPrice}</span>
                      )}
                      {discount && (
                         <span className="text-[11px] font-bold text-green-600">{discount}% off</span>
                      )}
                    </div>

                    {/* Delivery Badge */}
                    <div className="text-[10px] text-brand-text-secondary">
                      {tag === "Quick Commerce" ? (
                        <span className="font-semibold text-brand-text-primary">Delivery in {deliveryTime}</span>
                      ) : (
                        <span>Free delivery</span>
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