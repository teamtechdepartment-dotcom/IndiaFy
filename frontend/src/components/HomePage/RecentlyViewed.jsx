/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const tagRoutes = {
  "Quick Commerce": "/quick-commerce",
  "E-Commerce": "/category/ecommerce",
  "Wholesale": "/wholesale",
};

const INITIAL_VIEWED = [
  {
    id: 101,
    sellerId: "green-earth-organics",
    name: "Fresh Organic Broccoli (500g)",
    seller: "Green Earth Organics",
    price: "85",
    tag: "Quick Commerce",
    image: "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?q=80&w=800",
    viewedAt: "2 hours ago",
  },
  {
    id: 102,
    sellerId: "tech-zone-gurugram",
    name: "Noise Cancelling Headphones",
    seller: "Tech Zone Gurugram",
    price: "4,200",
    tag: "E-Commerce",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800",
    viewedAt: "5 hours ago",
  },
  {
    id: 103,
    sellerId: "vogue-mens-wear",
    name: "Cotton Formal Shirt - Slim Fit",
    seller: "Vogue Men's Wear",
    price: "1,499",
    tag: "E-Commerce",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800",
    viewedAt: "Yesterday",
  },
];

export default function RecentlyViewed() {
  const [viewed] = useState(INITIAL_VIEWED);
  const navigate = useNavigate();

  if (viewed.length === 0) return null;

  return (
    <section className="py-section-mobile md:py-16 bg-white" id="recommended">
      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <h2 className="section-heading mb-2">Recommended For You</h2>
            <p className="text-brand-text-secondary text-sm font-medium">
              Based on your recent browsing
            </p>
          </div>
          <button
            onClick={() => navigate("/search")}
            className="hidden sm:flex items-center gap-2 text-sm font-semibold text-brand-accent hover:text-brand-accent-hover transition-colors"
          >
            Browse More <ArrowRight size={16} />
          </button>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {viewed.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                className="group"
              >
                <div className="card-base p-4 flex gap-4">
                  {/* Image */}
                  <div
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-gray-50 cursor-pointer"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
                    <div>
                      <div className="flex items-center gap-1 text-brand-text-secondary mb-1">
                        <Clock size={11} />
                        <span className="text-[10px] font-medium">{product.viewedAt}</span>
                      </div>
                      <h3
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="text-sm font-semibold text-brand-primary line-clamp-1 mb-0.5 cursor-pointer hover:text-brand-accent transition-colors"
                      >
                        {product.name}
                      </h3>
                      <button
                        onClick={() => navigate(`/store/${product.sellerId}`)}
                        className="flex items-center gap-1 text-[10px] font-medium text-brand-text-secondary hover:text-brand-primary transition-colors"
                      >
                        <ShieldCheck size={10} className="text-brand-accent" />
                        {product.seller}
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="text-base font-bold text-brand-primary cursor-pointer"
                      >
                        ₹{product.price}
                      </span>
                      <button
                        onClick={() => navigate("/cart")}
                        className="p-2 rounded-xl bg-brand-primary text-white hover:bg-brand-secondary active:scale-95 transition-all shadow-sm"
                        title="Add to Cart"
                      >
                        <ShoppingCart size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}