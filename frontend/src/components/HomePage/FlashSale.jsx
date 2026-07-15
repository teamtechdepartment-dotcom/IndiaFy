import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame, ArrowRight, Star, ShoppingCart, Clock } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";

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
    <section className="bg-brand-background px-2 py-2" id="flash-sale">
      <div className="w-full bg-white shadow-sm p-4 sm:p-6 border border-brand-border">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-brand-border/50 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-brand-text-primary">Deals of the Day</h2>
              <Clock size={20} className="text-brand-text-secondary ml-2" />
            </div>

            {/* Countdown */}
            <div className="flex items-center gap-1.5 bg-brand-error text-white px-3 py-1 rounded-sm shadow-sm">
              <Clock size={14} className="text-white" />
              <div className="flex gap-1">
                {[h, m, s].map((val, i) => (
                  <React.Fragment key={i}>
                    <span className="text-sm font-bold tracking-wider">
                      {val}
                    </span>
                    {i < 2 && <span className="font-bold">:</span>}
                  </React.Fragment>
                ))}
              </div>
              <span className="text-xs font-medium ml-1">Left</span>
            </div>
          </motion.div>

          <button
            onClick={() => navigate("/search?q=sale")}
            className="flex items-center justify-center bg-brand-primary text-white w-8 h-8 rounded-full hover:bg-blue-800 transition-colors shadow-sm"
            aria-label="View All Deals"
          >
            <ArrowRight size={18} />
          </button>
        </div>
        {/* Products Scroll */}
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar -mx-2 px-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 w-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 font-medium w-full">
              No deals active today. Check back later!
            </div>
          ) : (
            products.map((product, index) => {
              const id = product._id || product.id;
              const name = product.productName || product.name;
              const price = product.attribute?.salePrice || product.price || 0;
              const oldPrice = product.attribute?.mrpPrice || product.price || price;
              const discount = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
              const rating = product.ratingAverage || 4.5;
              const image = product.productImage?.[0] || "https://placehold.co/400x400?text=Product";

              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.4 }}
                  viewport={{ once: true }}
                  className="flex-none w-[200px] sm:w-[220px] snap-start group"
                >
                  <div
                    className="group border border-transparent hover:border-gray-200 hover:shadow-md rounded-md overflow-hidden transition-all duration-300 p-2 sm:p-3 relative bg-white cursor-pointer"
                    onClick={() => navigate(`/product/${id}`)}
                  >
                    <div className="relative aspect-square overflow-hidden bg-white mb-3">
                      <img
                        src={image}
                        alt={name}
                        loading="lazy"
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                      {discount > 0 && (
                        <div className="absolute top-0 left-0 px-2 py-1 bg-brand-error text-white text-[10px] font-bold shadow-sm rounded-br-md">
                          {discount}% OFF
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col h-full">
                      <h3 className="text-sm text-brand-text-primary mb-1 line-clamp-2 hover:text-brand-primary transition-colors min-h-[40px]">{name}</h3>
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex items-center gap-0.5 px-1 bg-green-700 text-white rounded-[3px]">
                          <span className="text-[10px] font-bold">{rating}</span>
                          <Star size={8} fill="white" className="text-white" />
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-base font-bold text-brand-text-primary">₹{price}</span>
                        {oldPrice > price && (
                          <span className="text-[11px] text-brand-text-secondary line-through">₹{oldPrice}</span>
                        )}
                        <span className="text-[11px] font-bold text-brand-error">Deal</span>
                      </div>
                      {/* Stock Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                        <div className="bg-brand-error h-1.5 rounded-full" style={{ width: '80%' }}></div>
                      </div>
                      <p className="text-[10px] text-brand-error font-semibold">Only a few left!</p>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
