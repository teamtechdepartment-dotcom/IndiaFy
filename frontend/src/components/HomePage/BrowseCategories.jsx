import React, { memo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useProductStore } from "../../store/productStore";
import {
  ShoppingBag,
  ShoppingBasket,
  Pill,
  Tv,
  Lamp,
  Scissors,
  Box,
  Wrench,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// Placeholder images for categories (to look like Flipkart)
const categoryImages = {
  grocery: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=150&h=150&auto=format&fit=crop",
  garments: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=150&h=150&auto=format&fit=crop",
  electronics: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=150&h=150&auto=format&fit=crop",
  "home-decor": "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=150&h=150&auto=format&fit=crop",
  beauty: "https://images.unsplash.com/photo-1522335789203-aabd1fc54c28?q=80&w=150&h=150&auto=format&fit=crop",
  pharmacy: "https://images.unsplash.com/photo-1584308666744-24d5e41df2a2?q=80&w=150&h=150&auto=format&fit=crop",
  wholesale: "https://images.unsplash.com/photo-1586528116311-ad8ed7c508c0?q=80&w=150&h=150&auto=format&fit=crop",
  services: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=150&h=150&auto=format&fit=crop",
  default: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=150&h=150&auto=format&fit=crop"
};

const fallbackCategories = [
  { name: "Top Offers", slug: "offers", image: categoryImages.default },
  { name: "Groceries", slug: "grocery", image: categoryImages.grocery },
  { name: "Mobiles", slug: "electronics", image: categoryImages.electronics },
  { name: "Fashion", slug: "garments", image: categoryImages.garments },
  { name: "Electronics", slug: "electronics", image: categoryImages.electronics },
  { name: "Home & Furniture", slug: "home-decor", image: categoryImages["home-decor"] },
  { name: "Beauty", slug: "beauty", image: categoryImages.beauty },
  { name: "Pharmacy", slug: "pharmacy", image: categoryImages.pharmacy },
  { name: "Wholesale", slug: "wholesale", image: categoryImages.wholesale },
];

const BrowseCategories = memo(function BrowseCategories() {
  const { categories, fetchCategories } = useProductStore();
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const getImage = (slug) => {
    if (categoryImages[slug]) return categoryImages[slug];
    for (const key in categoryImages) {
      if (slug.includes(key)) return categoryImages[key];
    }
    return categoryImages.default;
  };

  const validCategories = Array.isArray(categories)
    ? categories.filter(cat => cat && typeof cat === 'string')
    : [];

  const displayCategories = validCategories.length > 0
    ? validCategories.map(cat => {
        const slug = cat.toLowerCase().replace(/\s+/g, '-');
        return {
          name: cat,
          slug: slug,
          image: getImage(slug)
        };
      })
    : fallbackCategories;

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-white py-4 mb-2 shadow-sm border-b border-brand-border">
      <div className="w-full px-2 sm:px-4 relative group">
        
        {/* Navigation Arrows for Desktop */}
        <button 
          onClick={scrollLeft}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-16 bg-white shadow-md items-center justify-center rounded-r-md opacity-0 group-hover:opacity-100 transition-opacity border border-gray-200"
        >
          <ChevronLeft size={24} className="text-gray-600" />
        </button>

        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 md:gap-8 lg:gap-12 pb-2 no-scrollbar scroll-smooth"
        >
          {displayCategories.map((category) => (
            <Link
              key={category.slug}
              to={category.slug === 'wholesale' ? '/wholesale' : `/category/${category.slug}`}
              className="flex flex-col items-center flex-none min-w-[70px] group/item"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 mb-2 overflow-hidden border border-transparent group-hover/item:border-brand-primary transition-all duration-300 group-hover/item:shadow-md">
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500"
                />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-brand-text-primary text-center leading-tight group-hover/item:text-brand-primary transition-colors">
                {category.name}
              </span>
            </Link>
          ))}
        </div>

        <button 
          onClick={scrollRight}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-16 bg-white shadow-md items-center justify-center rounded-l-md opacity-0 group-hover:opacity-100 transition-opacity border border-gray-200"
        >
          <ChevronRight size={24} className="text-gray-600" />
        </button>
      </div>
    </section>
  );
});

BrowseCategories.displayName = 'BrowseCategories';

export default BrowseCategories;
