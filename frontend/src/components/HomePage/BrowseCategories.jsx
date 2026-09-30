import React, { memo } from "react";
import { Link } from "react-router-dom";
import {
  Tag,
  ShoppingBasket,
  Smartphone,
  Shirt,
  Monitor,
  Home,
  Sparkles,
  Pill,
  Package,
  Plane,
  Gamepad2
} from "lucide-react";

// Flipkart-style compact icon categories
const categoryLinks = [
  { name: "Top Offers", slug: "offers", icon: Tag },
  { name: "Grocery", slug: "grocery", icon: ShoppingBasket },
  { name: "Mobiles", slug: "electronics", icon: Smartphone },
  { name: "Fashion", slug: "garments", icon: Shirt },
  { name: "Electronics", slug: "electronics", icon: Monitor },
  { name: "Home", slug: "home-decor", icon: Home },
  { name: "Beauty", slug: "beauty", icon: Sparkles },
  { name: "Pharmacy", slug: "pharmacy", icon: Pill },
  { name: "Wholesale", slug: "wholesale", icon: Package },
  { name: "Toys", slug: "toys", icon: Gamepad2 },
  { name: "Travel", slug: "travel", icon: Plane },
];

const BrowseCategories = memo(function BrowseCategories() {
  return (
    <section className="bg-white border-b border-gray-200">
      <div className="w-full max-w-[1400px] mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-start xl:justify-center overflow-x-auto no-scrollbar py-3 gap-6 md:gap-8 lg:gap-10">
          {categoryLinks.map((category) => {
            const IconComponent = category.icon;
            return (
              <Link
                key={category.slug}
                to={category.slug === 'wholesale' ? '/wholesale' : `/category/${category.slug}`}
                className="flex flex-col items-center justify-center flex-none min-w-[64px] group"
              >
                <div className="mb-2 transition-transform duration-300 group-hover:-trangray-y-1">
                  <IconComponent 
                    size={32} 
                    strokeWidth={1.5} 
                    className="text-gray-700 group-hover:text-[#065F46]" 
                  />
                </div>
                <span className="text-[13px] md:text-[14px] font-medium text-gray-800 text-center leading-tight group-hover:text-[#065F46] transition-colors whitespace-nowrap">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
});

BrowseCategories.displayName = 'BrowseCategories';

export default BrowseCategories;
