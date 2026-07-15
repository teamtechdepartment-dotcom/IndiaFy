/* eslint-disable react/prop-types */
import { memo } from "react";
import ProductCard from "./ProductCard";

function ProductGrid({ products, viewMode }) {
  if (products.length === 0) {
    return (
      <div className="w-full py-20 text-center bg-white flex flex-col items-center justify-center border border-gray-100 shadow-sm mt-4">
        <div className="w-24 h-24 mb-4 opacity-50 grayscale">
          <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/error-no-search-results_2353c5.png" alt="No results" className="w-full h-full object-contain" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">Sorry, no results found!</h3>
        <p className="text-gray-500 text-sm">Please check the spelling or try searching for something else</p>
      </div>
    );
  }

  const gridClass = viewMode === "grid" 
    ? "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4" 
    : "flex flex-col gap-2";

  return (
    <div className={`${gridClass}`}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} viewMode={viewMode} />
      ))}
    </div>
  );
}

export default memo(ProductGrid);
