import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, ArrowRight } from "lucide-react";

export default function QuickCommerceStrip() {
  const navigate = useNavigate();

  return (
    <section className="bg-white px-2 py-4 border-b border-gray-100" id="quick-commerce">
      <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-4">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          {/* Left Text */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full md:w-1/3 flex flex-col items-start"
          >
            <div className="flex items-center gap-2 mb-2 bg-[#ea580c] text-white px-2.5 py-0.5 rounded shadow-sm">
              <Zap size={14} className="fill-current" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Under 30-Min Delivery</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              Groceries & Daily Needs
            </h2>
            <p className="text-gray-500 text-xs font-medium mb-4 max-w-xs">
              Everything you need, delivered faster than you can imagine.
            </p>
            <button
              onClick={() => navigate("/quick-commerce")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#065F46] text-white font-bold text-sm rounded shadow-sm hover:bg-[#047857] transition-colors"
            >
              Order Now <ArrowRight size={16} />
            </button>
          </motion.div>

          {/* Right Cards Grid */}
          <div className="w-full md:w-2/3 flex overflow-x-auto gap-3 sm:gap-4 pb-2 no-scrollbar">
             {[
                { name: "Vegetables", img: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?q=80&w=200&auto=format&fit=crop" },
                { name: "Fruits", img: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=200&auto=format&fit=crop" },
                { name: "Dairy", img: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=200&auto=format&fit=crop" },
                { name: "Snacks", img: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?q=80&w=200&auto=format&fit=crop" },
                { name: "Beverages", img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=200&auto=format&fit=crop" },
             ].map((item) => (
                <div 
                  key={item.name} 
                  onClick={() => navigate("/quick-commerce")}
                  className="flex-none w-[100px] sm:w-[120px] bg-white rounded border border-gray-100 p-2 text-center cursor-pointer hover:shadow-md hover:border-[#065F46] transition-all group"
                >
                  <div className="aspect-square bg-gray-50 rounded mb-2 overflow-hidden">
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-xs font-bold text-gray-800 line-clamp-1">{item.name}</span>
                </div>
             ))}
          </div>
        </div>
      </div>
    </section>
  );
}
