import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../../utils/axiosInstance";
import ProductCard from "../Category/ProductCard";

export default function RecentlyViewed() {
  const [viewed, setViewed] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    axiosInstance.get("/products/latest")
      .then(res => {
        const raw = res.data?.data || res.data || [];
        setViewed(raw.slice(0, 8).map(p => {
          const price = parseFloat(p.attribute?.salePrice || p.price || "0");
          const original = parseFloat(p.attribute?.mrpPrice || p.price || price);
          return {
            id: p._id || p.id,
            name: p.productName || p.name,
            brand: p.brand || p.sellerId?.firstName || "Verified Seller",
            price: price,
            original: original,
            rating: p.ratingAverage || 4.5,
            reviews: p.ratingCount || 0,
            image: p.productImage?.[0] || "https://placehold.co/400x400?text=Product",
            eta: "30 mins",
          };
        }));
      })
      .catch(err => {
        console.error("Failed to fetch latest products for recommended", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading || viewed.length === 0) return null;

  return (
    <section className="bg-white px-2 py-4 border-b border-gray-100" id="recommended">
      <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-4 pb-2"
        >
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-0.5">Recently Viewed</h2>
            <p className="text-gray-500 text-xs font-medium">
              Based on your browsing history
            </p>
          </div>
          <button
            onClick={() => navigate("/search")}
            className="flex items-center justify-center bg-[#065F46] text-white w-7 h-7 rounded-full hover:bg-[#047857] transition-colors shadow-sm"
            aria-label="View All"
          >
            <ArrowRight size={16} />
          </button>
        </motion.div>

        {/* Carousel */}
        <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-4 no-scrollbar snap-x snap-mandatory">
          <AnimatePresence>
            {viewed.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="flex-none w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px] snap-start"
              >
                <ProductCard product={{...product, img: product.image}} source="recently_viewed" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}