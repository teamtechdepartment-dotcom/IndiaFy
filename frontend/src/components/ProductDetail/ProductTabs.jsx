/* eslint-disable react/prop-types */
import { memo, useState } from "react";
import { Star } from "lucide-react";

function ProductTabs({ product }) {
  const [activeTab, setActiveTab] = useState("description");

  const TABS = [
    { id: "description", label: "Description" },
    { id: "specifications", label: "Specifications" },
    { id: "reviews", label: "Customer Reviews" },
    { id: "seller", label: "Seller Info" }
  ];

  return (
    <div className="mt-8 border-t border-gray-200 pt-8">
      <div className="flex border-b border-gray-100 overflow-x-auto custom-scrollbar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-6 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab.id 
                ? "border-[#2874F0] text-[#2874F0]" 
                : "border-transparent text-gray-500 hover:text-[#212121]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="py-6 text-[#212121]">
        {activeTab === "description" && (
          <div className="prose prose-sm max-w-none">
            <h3 className="text-lg font-bold mb-4">Product Description</h3>
            <p className="leading-relaxed break-words">{product.description}</p>
          </div>
        )}

        {activeTab === "specifications" && (
          <div>
            <h3 className="text-lg font-bold mb-4">Product Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0 border-t border-gray-200">
              {product.specs.map((s, i) => (
                <div key={i} className="flex py-2 border-b border-gray-200">
                  <span className="w-1/3 text-[#565959] text-sm font-bold bg-[#f3f3f3] p-2">{s.label}</span>
                  <span className="w-2/3 text-sm p-2">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div>
            <h3 className="text-lg font-bold mb-4">Customer Reviews</h3>
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-[#FFA41C]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} />
                ))}
              </div>
              <span className="text-lg font-bold">{product.rating} out of 5</span>
              <span className="text-sm text-[#565959] ml-2">{product.reviewCount} global ratings</span>
            </div>
            
            <div className="space-y-6">
              {product.reviews.map((rev) => (
                <div key={rev.id}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-medium">
                      {rev.avatar}
                    </div>
                    <span className="text-sm font-medium">{rev.user}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex text-[#FFA41C]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < rev.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                    <span className="text-sm font-bold">{rev.title}</span>
                  </div>
                  <p className="text-xs text-[#565959] mb-2">Reviewed in India on {rev.date}</p>
                  <p className="text-xs text-[#10B981] font-bold mb-2">Verified Purchase</p>
                  <p className="text-sm mb-3 text-gray-700 break-words leading-relaxed">{rev.body}</p>
                  <p className="text-xs text-gray-500 mb-3">{rev.helpful} people found this helpful</p>
                  <div className="flex gap-4">
                    <button className="border border-gray-200 rounded-lg px-4 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors">Helpful</button>
                    <button className="text-xs text-gray-500 hover:text-[#FB641B] hover:underline font-medium pt-1.5">Report</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "seller" && (
          <div>
            <h3 className="text-lg font-bold mb-4">Seller Information</h3>
            <div className="bg-[#F0F2F2] p-4 rounded border border-gray-200">
              <h4 className="font-bold text-lg">{product.seller.name}</h4>
              <p className="text-sm mt-1">{product.seller.rating} out of 5 stars</p>
              <p className="text-sm mt-1">Distance: {product.seller.distance}</p>
              {product.seller.verified && (
                 <p className="text-sm text-[#007600] font-bold mt-2">Verified Seller</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(ProductTabs);
