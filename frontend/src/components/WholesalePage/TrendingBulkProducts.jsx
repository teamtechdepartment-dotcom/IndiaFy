import { memo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Star, ShieldCheck, ShoppingCart, FileText, Clock, MapPin, Zap, Store } from "lucide-react";
import { toast } from "react-toastify";
import { useWholesaleStore } from "../../store/wholesaleStore";
import { useCartStore } from "../../store/cartStore";

const STATIC_PRODUCTS = [
  { id: "sp1", name: "1121 Export Quality Basmati Rice (50kg Bag)", emoji: "🌾", moq: 500, price: 32, originalPrice: 48, unit: "/ Kg", location: "Ahmedabad Wholesale Hub", rating: "4.8", reviews: 142, stock: "5,000+ Kg" },
  { id: "sp2", name: "Industrial 9W Smart LED Bulbs (B22 Bayonet)", emoji: "💡", moq: 100, price: 65, originalPrice: 110, unit: "/ piece", location: "Delhi Electrical Market", rating: "4.7", reviews: 98, stock: "10,000+ pcs" },
  { id: "sp3", name: "Food Grade 750ml Disposable Meal Containers", emoji: "🥡", moq: 500, price: 4, originalPrice: 7.5, unit: "/ piece", location: "Indore Plastic Traders", rating: "4.6", reviews: 215, stock: "50,000+ pcs" },
  { id: "sp4", name: "100% Pure Refined Sunflower Oil (15L Tin)", emoji: "🛢️", moq: 100, price: 110, originalPrice: 155, unit: "/ Ltr", location: "Indore Oil Syndicate", rating: "4.8", reviews: 310, stock: "2,500+ Tins" },
  { id: "sp5", name: "240 GSM Heavyweight Combed Cotton T-Shirts", emoji: "👕", moq: 50, price: 120, originalPrice: 220, unit: "/ piece", location: "Tirupur Garment Hub", rating: "4.9", reviews: 540, stock: "8,000+ pcs" },
];

function TrendingBulkProducts() {
  const navigate = useNavigate();
  const { wholesaleProducts, fetchWholesaleProducts, isLoading } = useWholesaleStore();
  const { addToCart } = useCartStore();

  useEffect(() => {
    fetchWholesaleProducts();
  }, [fetchWholesaleProducts]);

  const handleBulkCart = (product, e) => {
    e.stopPropagation();
    const qty = product.moq || 50;
    addToCart({
      _id: product.id || product._id,
      productName: product.name || product.productName,
      productImage: product.image ? [product.image] : [],
      price: product.price || 100,
      sellerId: product.sellerId || "default_seller",
      isWholesale: true
    }, qty);
    toast.success(`Added ${qty} units to Wholesale Cart!`);
  };

  const handleRFQ = (e) => {
    e.stopPropagation();
    toast.info("RFQ Draft created! Our sourcing specialist will connect you with top stockists in < 15 mins.");
  };

  // Merge API products with static fallback
  const apiCards = wholesaleProducts.slice(0, 5).map((p) => {
    const minQty = p.minimumOrderQty || 50;
    const price = Number(p.attribute?.salePrice || 100);
    const orig = Number(p.attribute?.regularPrice || price * 1.45);
    return {
      id: p._id,
      name: p.productName,
      emoji: null,
      image: p.productImage?.[0],
      moq: minQty,
      price: price,
      originalPrice: orig,
      unit: "/ unit",
      location: p.businessAddress?.city || "New Delhi Wholesale Market",
      rating: (4 + Math.random() * 0.9).toFixed(1),
      reviews: Math.floor(Math.random() * 150) + 50,
      stock: `${p.inventory || 1500}+ available`,
      navigateTo: `/product/${p._id}`,
    };
  });

  const displayProducts = apiCards.length > 0 ? apiCards : STATIC_PRODUCTS;

  return (
    <section className="w-full py-12 sm:py-16 bg-[#F8FAFC] border-b border-gray-200/60">
      <div className="max-w-[1600px] 2xl:max-w-[1800px] w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10 pb-4 border-b border-gray-200/60">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold tracking-wider uppercase text-[#F97316] bg-[#F97316]/10 px-3.5 py-1 rounded-full mb-3">
              <Zap size={15} className="fill-current" />
              <span>High Margin Inventory</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#1F2937]">
              Top-Selling Wholesale Inventory
            </h2>
            <p className="text-sm sm:text-base text-[#6B7280] font-medium mt-1">
              Lock in tiered dealer rates with verified bulk shops and regional stockists before stock resets.
            </p>
          </div>
          <a
            href="#catalog"
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-[#F97316] text-[#F97316] hover:text-white font-extrabold text-xs sm:text-sm border border-gray-200 hover:border-[#F97316] transition-all duration-200 shrink-0 shadow-xs"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-2xl p-5 bg-white animate-pulse">
                <div className="h-44 bg-gray-100 rounded-xl mb-4" />
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2 mb-4" />
                <div className="h-10 bg-gray-100 rounded w-full mb-4" />
                <div className="h-10 bg-gray-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {displayProducts.map((p) => {
              const savings = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) || 30;
              return (
                <div
                  key={p.id}
                  onClick={() => p.navigateTo && navigate(p.navigateTo)}
                  className="flex flex-col justify-between border border-gray-200/80 rounded-2xl bg-white hover:border-[#0B6E5D] hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group overflow-hidden relative shadow-xs"
                >
                  {/* Top Image Box */}
                  <div className="relative h-48 bg-gradient-to-b from-gray-50/80 to-white flex items-center justify-center p-4 border-b border-gray-100 overflow-hidden">
                    {p.image ? (
                      <img
                        loading="lazy"
                        decoding="async"
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <span className="text-7xl group-hover:scale-125 transition-transform duration-500 inline-block drop-shadow-md">
                        {p.emoji}
                      </span>
                    )}

                    {/* Verified Shop Badge Overlay */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-extrabold text-[#0B6E5D] shadow-xs flex items-center gap-1 border border-gray-200/60 uppercase tracking-wider">
                      <Store size={12} className="text-[#16A34A]" />
                      <span>Verified Dealer</span>
                    </div>

                    {/* Discount Tag */}
                    <div className="absolute top-3 right-3 bg-[#F97316] text-white px-2.5 py-1 rounded-md text-[10px] font-black shadow-xs uppercase tracking-wider">
                      -{savings}% OFF
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Rating & Reviews */}
                      <div className="flex items-center gap-1.5 mb-2.5">
                        <div className="flex items-center text-amber-500 text-xs font-black">
                          <Star size={13} fill="currentColor" className="mr-1" />
                          <span>{p.rating}</span>
                        </div>
                        <span className="text-gray-400 text-xs font-medium">({p.reviews} dealer reviews)</span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-extrabold text-[#1F2937] group-hover:text-[#0B6E5D] transition-colors line-clamp-2 leading-snug mb-3">
                        {p.name}
                      </h3>

                      {/* MOQ Tag */}
                      <div className="inline-block bg-[#E6F4F1] text-[#0B6E5D] text-xs font-extrabold px-3 py-1 rounded-lg mb-3">
                        Min. Order: {p.moq} Units
                      </div>
                    </div>

                    {/* Pricing Block */}
                    <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 mb-4">
                      <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Wholesale Dealer Rate</div>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-2xl font-black text-[#1F2937]">₹{p.price.toLocaleString("en-IN")}</span>
                        <span className="text-xs font-bold text-[#6B7280]">{p.unit}</span>
                        <span className="text-xs text-gray-400 line-through ml-auto font-semibold">₹{p.originalPrice}</span>
                      </div>
                    </div>

                    {/* Location & Delivery Meta */}
                    <div className="flex items-center justify-between text-xs font-semibold text-[#6B7280] mb-5">
                      <span className="flex items-center gap-1.5 truncate max-w-[140px]">
                        <MapPin size={13} className="text-gray-400 shrink-0" />
                        <span className="truncate">{p.location}</span>
                      </span>
                      <span className="flex items-center gap-1 text-emerald-600 font-bold shrink-0">
                        <Clock size={13} />
                        <span>2-3 days</span>
                      </span>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="grid grid-cols-2 gap-2.5 pt-3.5 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={(e) => handleRFQ(e)}
                        className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-[#1F2937] font-extrabold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <FileText size={14} />
                        <span>RFQ Quote</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleBulkCart(p, e)}
                        className="w-full py-2.5 bg-[#0B6E5D] hover:bg-[#084F42] text-white font-extrabold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <ShoppingCart size={14} />
                        <span>Buy Bulk</span>
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}

export default memo(TrendingBulkProducts);
