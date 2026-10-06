import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProductStore } from "../../store/productStore";
import { useProfileStore } from "../../store/profileStore";
import { useAuthStore } from "../../store/authStore";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from "../Category/ProductCard";

export default function TrendingProducts() {
  const navigate = useNavigate();
  const { products, fetchProducts } = useProductStore();
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
    <section className="bg-white px-2 py-4 border-b border-gray-100" id="trending">
      <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-2">
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              {profile?.interests?.length > 0 ? "Recommended for You" : "Trending Products"}
            </h2>
          </motion.div>

          <button
            onClick={() => navigate("/search?q=trending")}
            className="flex items-center justify-center bg-[#065F46] text-white w-7 h-7 rounded-full hover:bg-[#047857] transition-colors shadow-sm"
            aria-label="View All"
          >
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Product Carousel */}
        {displayProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-500 font-medium w-full border border-gray-100 rounded-md">
            No products available at the moment.
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-4 no-scrollbar snap-x snap-mandatory">
            {displayProducts.slice(0, 10).map((product, index) => {
              const id = product._id || product.id;
              const name = product.productName || product.name;
              const price = parseFloat(product.attribute?.salePrice || product.price || "0");
              const original = parseFloat(product.attribute?.mrpPrice || product.price || price);
              const img = product.productImage?.[0] || "https://placehold.co/400x400?text=Product";
              const rating = product.ratingAverage || 4.5;
              const reviews = product.ratingCount || 0;
              const brand = product.brand || "";

              const mappedProduct = {
                id,
                name,
                img,
                price,
                original,
                rating,
                reviews,
                brand,
                eta: "30 mins",
              };

              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  viewport={{ once: true }}
                  className="flex-none w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px] snap-start"
                >
                  <ProductCard product={mappedProduct} source="trending" />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
