/* eslint-disable react/prop-types */
import { memo } from "react";
import { ChevronRight } from "lucide-react";
import { ProductCard } from "./PopularProducts";

function DailyEssentials({ products, cart, onAdd, onInc, onDec, isLoading }) {
  if (isLoading) return null;

  const getCategoryProducts = (category) => products.filter(p => p.category === category).slice(0, 5);

  const sections = [
    { title: "Dairy & Breakfast", id: "dairy" },
    { title: "Fresh Vegetables", id: "vegetables" },
    { title: "Snacks & Munchies", id: "snacks" }
  ];

  return (
    <div className="bg-[#F7F8FA] flex flex-col gap-2 pb-4">
      {sections.map(section => {
        const secProducts = getCategoryProducts(section.id);
        if (secProducts.length === 0) return null;

        return (
          <div key={section.id} className="bg-white py-4 border-t border-gray-100 shadow-sm">
            <div className="px-3 flex items-center justify-between mb-3">
              <h2 className="text-base font-black text-gray-900">{section.title}</h2>
              <button className="text-[#00B55D] text-[10px] font-bold uppercase tracking-wider flex items-center">
                See All <ChevronRight size={12} strokeWidth={3} />
              </button>
            </div>
            <div className="flex overflow-x-auto gap-3 px-3 pb-2 hide-scrollbar snap-x">
              {secProducts.map(p => (
                <div key={p.id} className="snap-start shrink-0 w-32 md:w-40">
                   <ProductCard p={p} cartQty={cart[p.id] || 0} onAdd={onAdd} onInc={onInc} onDec={onDec} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default memo(DailyEssentials);
