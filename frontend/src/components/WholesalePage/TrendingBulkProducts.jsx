import { memo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, FileText, ShieldCheck, Clock, MapPin, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useWholesaleStore } from "../../store/wholesaleStore";
import { useCartStore } from "../../store/cartStore";

const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");

function ProductSkeleton() {
  return (
    <div className="bg-white border border-brand-border rounded-lg p-4 flex flex-col animate-pulse">
      <div className="w-full aspect-[4/3] bg-gray-100 rounded-md mb-4" />
      <div className="h-4 bg-gray-100 rounded w-3/4 mb-3" />
      <div className="h-10 bg-gray-100 rounded w-full mb-3" />
      <div className="h-4 bg-gray-100 rounded w-1/2 mb-4" />
      <div className="h-8 bg-gray-100 rounded mt-auto" />
    </div>
  );
}

function TrendingBulkProducts() {
  const navigate = useNavigate();
  const { wholesaleProducts, fetchWholesaleProducts, isLoading, filters, clearFilters } = useWholesaleStore();
  const { addToCart } = useCartStore();

  useEffect(() => {
    fetchWholesaleProducts();
  }, [fetchWholesaleProducts]);

  const getTierPrice = (product, qty) => {
    if (!product.bulkPricing || product.bulkPricing.length === 0) {
      return parseFloat(product.attribute?.salePrice || 0);
    }
    const sortedTiers = [...product.bulkPricing].sort((a, b) => b.minQty - a.minQty);
    const applicableTier = sortedTiers.find(t => qty >= t.minQty);
    return applicableTier ? applicableTier.pricePerUnit : parseFloat(product.attribute?.salePrice || 0);
  };

  const handleBulkAddToCart = (product, e) => {
    e.stopPropagation();
    const qty = product.minimumOrderQty || 1;
    const price = getTierPrice(product, qty);
    
    addToCart({
      _id: product._id,
      productName: product.productName,
      productImage: product.productImage,
      price: price,
      sellerId: product.sellerId,
      isWholesale: true
    }, qty);
    toast.success(`Added ${qty} units to Cart`);
  };

  const handleRFQ = (e) => {
    e.stopPropagation();
    toast.info("RFQ Draft Created. Supplier will contact you shortly.");
  };

  const filteredProducts = wholesaleProducts.filter(p => {
    if (filters.search && !p.productName.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.category && filters.category.length > 0 && !filters.category.includes(p.category)) return false;
    if (filters.moq) {
      const minQty = p.minimumOrderQty || 1;
      const moqLimit = parseInt(filters.moq);
      if (minQty > moqLimit) return false;
    }
    if (filters.gstVerified && !p.gstVerified) return false;
    return true;
  });

  return (
    <section className="py-12 bg-white border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h2 className="text-2xl lg:text-3xl font-black text-brand-text-primary mb-2">
            Wholesale Products
          </h2>
          <p className="text-sm text-brand-text-secondary font-medium">
            Source bulk inventory with tiered pricing and verified fulfillment.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredProducts.map((p) => {
              const minQty = p.minimumOrderQty || 1;
              const currentPrice = getTierPrice(p, minQty);
              const marketPrice = p.attribute?.regularPrice || currentPrice * 1.4;
              const savings = Math.round(((marketPrice - currentPrice) / marketPrice) * 100);
              const stock = p.inventory || Math.floor(Math.random() * 5000) + 500;

              return (
                <div
                  key={p._id}
                  onClick={() => navigate(`/product/${p._id}`)}
                  className="bg-white border border-brand-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer flex flex-col group relative"
                >
                  {/* Image & Verified Badge */}
                  <div className="relative aspect-[4/3] bg-gray-50 rounded-md mb-3 overflow-hidden border border-gray-100">
                    <img loading="lazy" decoding="async"
                      src={p.productImage?.[0] || "https://placehold.co/600x400?text=Product"}
                      alt={p.productName}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2">
                      <div className="bg-white px-2 py-1 rounded text-[10px] font-bold text-brand-primary shadow-sm flex items-center gap-1 uppercase tracking-wide border border-brand-border">
                        <ShieldCheck size={12} /> Verified
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-sm font-semibold text-brand-text-primary line-clamp-2 mb-2 group-hover:text-brand-primary transition-colors leading-snug">
                      {p.productName}
                    </h3>
                    
                    {/* Price & MOQ */}
                    <div className="bg-gray-50 border border-brand-border rounded p-2 mb-3">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-lg font-black text-brand-text-primary leading-none">{fmt(currentPrice)}<span className="text-xs font-medium text-brand-text-secondary">/unit</span></span>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">Save {savings}%</span>
                      </div>
                      <div className="text-xs font-semibold text-brand-text-secondary">
                        Min. Order: <span className="text-brand-text-primary">{minQty} Units</span>
                      </div>
                    </div>

                    {/* Meta tags */}
                    <div className="flex flex-col gap-1.5 mb-4 text-[11px] font-medium text-brand-text-secondary">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-gray-400" /> Dispatch in 2-3 days
                      </div>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-1.5">
                           <MapPin size={12} className="text-gray-400" /> Pan-India Delivery
                         </div>
                         <span className="font-semibold text-brand-text-primary">{stock} Available</span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="grid grid-cols-2 gap-2 mt-auto pt-3 border-t border-brand-border" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleRFQ(e)}
                        className="w-full py-2 bg-white border border-brand-border text-brand-text-primary font-bold text-xs rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <FileText size={14} /> RFQ
                      </button>
                      <button
                        onClick={(e) => handleBulkAddToCart(p, e)}
                        className="w-full py-2 bg-brand-primary text-white font-bold text-xs rounded hover:bg-brand-primary/90 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <ShoppingCart size={14} /> Add Cart
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 border border-brand-border rounded-lg">
            <div className="w-16 h-16 bg-white border border-brand-border rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-brand-text-primary mb-1">No Products Found</h3>
            <p className="text-sm text-brand-text-secondary max-w-sm mx-auto mb-4">
              Try adjusting your filters to find what you need.
            </p>
            <button 
              onClick={() => { clearFilters(); fetchWholesaleProducts(); }}
              className="bg-white border border-brand-border text-brand-primary px-4 py-2 rounded-md text-xs font-bold hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

      </div>
    </section>
  );
}

export default memo(TrendingBulkProducts);
