import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import ProductCard from "../Category/ProductCard";

function getTimeUntilNextReset() {
  const now = new Date();
  const hours = now.getHours();
  const nextSlot = Math.ceil((hours + 1) / 6) * 6;
  const reset = new Date(now);
  reset.setHours(nextSlot, 0, 0, 0);
  if (reset <= now) reset.setHours(reset.getHours() + 6);
  return reset - now;
}

function formatCountdown(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return { h: String(h).padStart(2, '0'), m: String(m).padStart(2, '0'), s: String(s).padStart(2, '0') };
}

export default function FlashSale() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(getTimeUntilNextReset());
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntilNextReset());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    axiosInstance.get("/products/featured")
      .then(res => {
        setProducts(res.data?.data || res.data || []);
      })
      .catch(err => {
        console.error("Failed to fetch flash products", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const { h, m, s } = formatCountdown(timeLeft);

  return (
    <section className="bg-white px-2 py-4 border-b border-gray-100" id="flash-sale">
      <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Deals of the Day</h2>
            </div>

            {/* Countdown */}
            <div className="flex items-center gap-1.5 bg-[#ea580c] text-white px-2.5 py-0.5 rounded shadow-sm">
              <Clock size={12} className="text-white" />
              <div className="flex gap-0.5">
                {[h, m, s].map((val, i) => (
                  <React.Fragment key={i}>
                    <span className="text-xs font-bold tracking-wider">
                      {val}
                    </span>
                    {i < 2 && <span className="font-bold text-xs">:</span>}
                  </React.Fragment>
                ))}
              </div>
              <span className="text-[10px] font-medium ml-1 uppercase">Left</span>
            </div>
          </motion.div>

          <button
            onClick={() => navigate("/search?q=sale")}
            className="hidden sm:flex items-center justify-center bg-[#065F46] text-white w-7 h-7 rounded-full hover:bg-[#047857] transition-colors shadow-sm"
            aria-label="View All Deals"
          >
            <ArrowRight size={16} />
          </button>
        </div>
        
        {/* Products Carousel */}
        <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-4 no-scrollbar snap-x snap-mandatory">
          {isLoading ? (
            <div className="flex-none w-full flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#065F46]"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex-none w-full text-center py-10 text-gray-500 font-medium border border-gray-100 rounded-md">
              No deals active today. Check back later!
            </div>
          ) : (
            products.slice(0, 8).map((product, index) => {
              const price = parseFloat(product.attribute?.salePrice || product.price || "0");
              const original = parseFloat(product.attribute?.mrpPrice || product.price || price);
              
              const mappedProduct = {
                id: product._id || product.id,
                name: product.productName || product.name,
                img: product.productImage?.[0] || "https://placehold.co/400x400?text=Product",
                price: price,
                original: original,
                rating: product.ratingAverage || 4.5,
                reviews: product.ratingCount || 0,
                brand: product.brand || "",
                badge: "Hot Deal"
              };

              return (
                <motion.div
                  key={mappedProduct.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  viewport={{ once: true }}
                  className="flex-none w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px] snap-start"
                >
                  <ProductCard product={mappedProduct} source="flash_sale" />
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
