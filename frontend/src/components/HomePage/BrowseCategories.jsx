import React, { memo } from "react";
import {
  ShoppingBag,
  ShoppingBasket,
  Pill,
  Tv,
  Lamp,
  Scissors,
  ArrowRight,
  ChevronRight,
  Box,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useProductStore } from "../../store/productStore";
import { useEffect } from "react";

const BrowseCategories = memo(function BrowseCategories() {
  const { categories, fetchCategories } = useProductStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const getIcon = (name) => {
    if (!name || typeof name !== 'string') return <Box size={24} />;
    const lower = name.toLowerCase();
    if (lower.includes('garment') || lower.includes('cloth')) return <ShoppingBag size={24} />;
    if (lower.includes('grocery') || lower.includes('food')) return <ShoppingBasket size={24} />;
    if (lower.includes('pharm') || lower.includes('med')) return <Pill size={24} />;
    if (lower.includes('elect')) return <Tv size={24} />;
    if (lower.includes('home') || lower.includes('decor')) return <Lamp size={24} />;
    if (lower.includes('care') || lower.includes('beauty')) return <Scissors size={24} />;
    return <Box size={24} />;
  };

  const validCategories = Array.isArray(categories) 
    ? categories.filter(cat => cat && typeof cat === 'string')
    : [];

  const displayCategories = validCategories.length > 0 
    ? validCategories.map(cat => ({
        name: cat,
        slug: cat.toLowerCase().replace(/\s+/g, '-'),
        stores: "Verified Node",
        icon: getIcon(cat)
      }))
    : [
        { name: "Garments", slug: "garments", stores: "12 Stores", icon: <ShoppingBag size={24} /> },
        { name: "Grocery", slug: "grocery", stores: "45 Stores", icon: <ShoppingBasket size={24} /> },
        { name: "Pharmacy", slug: "pharmacy", stores: "8 Stores", icon: <Pill size={24} /> },
        { name: "Electronics", slug: "electronics", stores: "15 Stores", icon: <Tv size={24} /> },
      ];

  return (
    <section className="relative pt-24 pb-20 bg-white overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-zinc-50 rounded-full blur-3xl opacity-50" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="h-px w-8 bg-zinc-900" />
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-500">
                Explore Gurugram
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-zinc-900 tracking-tight">
              Browse Categories
            </h2>
            <p className="text-zinc-500 mt-4 text-lg font-medium max-w-md">
              Discover verified local sellers across the platform's vertical
              ecosystem.
            </p>
          </div>

          <Link
            to="/local-sellers"
            className="group inline-flex items-center gap-3 px-6 py-3 bg-zinc-900 text-white rounded-full text-sm font-bold hover:bg-zinc-800 transition-all shadow-lg hover:shadow-zinc-200"
          >
            View All Nodes
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </motion.div>

        {/* Desktop Grid Layout */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {displayCategories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Link
                to={`/category/${category.slug}`}
                className="group relative block bg-zinc-50 border border-zinc-100 rounded-[2rem] p-8 transition-all duration-500 hover:bg-white hover:shadow-2xl hover:shadow-zinc-200 hover:-translate-y-2 overflow-hidden"
              >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <ChevronRight size={80} strokeWidth={1} />
                </div>

                <div className="relative z-10">
                  <div className="w-14 h-14 mb-8 flex items-center justify-center rounded-2xl bg-white text-zinc-900 shadow-sm border border-zinc-100 group-hover:bg-zinc-900 group-hover:text-white transition-all duration-500">
                    {category.icon}
                  </div>

                  <h3 className="text-xl font-bold text-zinc-900 group-hover:tracking-wide transition-all">
                    {category.name}
                  </h3>

                  <div className="mt-2 flex items-center gap-2 text-zinc-400 group-hover:text-zinc-600 transition-colors">
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      {category.stores}
                    </span>
                    <ArrowRight
                      size={12}
                      className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all"
                    />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile Horizontal Scroll */}
        <div className="md:hidden flex gap-4 overflow-x-auto pb-8 snap-x no-scrollbar">
          {displayCategories.map((category, index) => (
            <motion.div key={index} className="min-w-[200px] snap-center">
              <Link
                to={`/category/${category.slug}`}
                className="block bg-zinc-50 border border-zinc-100 rounded-3xl p-6"
              >
                <div className="w-12 h-12 mb-6 flex items-center justify-center rounded-xl bg-white text-zinc-900 shadow-sm border border-zinc-100">
                  {category.icon}
                </div>
                <h3 className="font-bold text-zinc-900">{category.name}</h3>
                <p className="text-xs text-zinc-400 font-bold mt-1 uppercase tracking-tighter">
                  {category.stores}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

BrowseCategories.displayName = 'BrowseCategories';

export default BrowseCategories;
