import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, ShoppingBasket, Pill, Package, ArrowRight } from "lucide-react";

const quickCategories = [
  {
    icon: <ShoppingBasket size={28} className="text-white" />,
    title: "Groceries",
    subtitle: "Fresh fruits, veggies & more",
    bg: "bg-gradient-to-br from-emerald-500 to-teal-600",
  },
  {
    icon: <Pill size={28} className="text-white" />,
    title: "Medicines",
    subtitle: "Pharmacy essentials",
    bg: "bg-gradient-to-br from-blue-500 to-indigo-600",
  },
  {
    icon: <Package size={28} className="text-white" />,
    title: "Daily Needs",
    subtitle: "Household & personal care",
    bg: "bg-gradient-to-br from-violet-500 to-purple-600",
  },
];

export default function QuickCommerceStrip() {
  const navigate = useNavigate();

  return (
    <section className="bg-brand-background px-2 py-2" id="quick-commerce">
      <div className="w-full bg-gradient-to-r from-yellow-50 to-orange-50 shadow-sm p-4 sm:p-6 border border-yellow-200 rounded-sm">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          {/* Left Text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full md:w-1/3 flex flex-col items-start"
          >
            <div className="flex items-center gap-2 mb-2 bg-yellow-400 text-black px-3 py-1 rounded-full shadow-sm">
              <Zap size={16} className="fill-current" />
              <span className="text-xs font-bold uppercase tracking-wider">Under 30-Minute Delivery</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 leading-tight">
              Groceries & More
            </h2>
            <p className="text-gray-700 text-sm font-medium mb-4 max-w-xs">
              Everything you need, delivered faster than you can imagine.
            </p>
            <button
              onClick={() => navigate("/quick-commerce")}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white font-bold text-sm rounded shadow-sm hover:bg-gray-800 transition-colors"
            >
              Order Now <ArrowRight size={16} />
            </button>
          </motion.div>

          {/* Right Cards Grid */}
          <div className="w-full md:w-2/3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
             {[
                { name: "Vegetables", img: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?q=80&w=200&auto=format&fit=crop" },
                { name: "Fruits", img: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=200&auto=format&fit=crop" },
                { name: "Dairy", img: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=200&auto=format&fit=crop" },
                { name: "Snacks", img: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?q=80&w=200&auto=format&fit=crop" },
                { name: "Beverages", img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=200&auto=format&fit=crop" },
             ].map((item, i) => (
                <div 
                  key={item.name} 
                  onClick={() => navigate("/quick-commerce")}
                  className="bg-white rounded border border-gray-100 p-2 text-center cursor-pointer hover:shadow-md hover:border-yellow-300 transition-all"
                >
                  <div className="aspect-square bg-gray-50 rounded mb-2 overflow-hidden">
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-800 line-clamp-1">{item.name}</span>
                </div>
             ))}
          </div>
        </div>
      </div>
    </section>
  );
}
