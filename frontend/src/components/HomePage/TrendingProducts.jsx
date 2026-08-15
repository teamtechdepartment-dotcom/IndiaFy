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
  const displayProducts = products;

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
        {displayProducts.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 font-medium bg-white w-full">
            No products available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {displayProducts.slice(0, 8).map((product, index) => {
              const id = product._id || product.id;
              const name = product.productName || product.name;
              const price = product.attribute?.salePrice || product.price || "0";
              const oldPrice = product.attribute?.mrpPrice || product.price || price;
              const image = product.productImage?.[0] || "https://placehold.co/400x400?text=Product";
              const rating = product.ratingAverage || 4.5;
              const reviews = product.ratingCount || 0;
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
                  <div className="group border border-gray-200/60 hover:border-gray-200 hover:shadow-md rounded-xl overflow-hidden transition-all duration-300 p-2 sm:p-3 relative bg-[#f4f5f7]">
                    {/* Image */}
                    <div
                      onClick={() => navigate(`/product/${id}`)}
                      className="relative aspect-square overflow-hidden cursor-pointer bg-[#eef0f2] rounded-lg mb-3"
                    >
                      <img
                        src={image}
                        alt={name}
                        loading="lazy"
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Discount Badge */}
                      {discount > 0 && (
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
                      </div>

                      {/* Price */}
                      <div className="flex items-baseline gap-2 mb-2 mt-auto">
                        <span className="text-base font-bold text-brand-text-primary">₹{price}</span>
                        {oldPrice && oldPrice !== price && (
                          <span className="text-[11px] text-brand-text-secondary line-through">₹{oldPrice}</span>
                        )}
                        {discount > 0 && (
                           <span className="text-[11px] font-bold text-green-600">{discount}% off</span>
                        )}
                      </div>

                      {/* Delivery Badge */}
                      <div className="text-[10px] text-brand-text-secondary font-medium">
                        <span>Free delivery</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
