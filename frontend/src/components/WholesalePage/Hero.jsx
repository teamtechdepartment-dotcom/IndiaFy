import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Package, Grid, ArrowRight, ShieldCheck, FileText } from "lucide-react";

function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative w-full bg-brand-background pt-24 lg:pt-32 pb-12 overflow-hidden border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Text Content */}
          <div className="lg:col-span-7 flex flex-col pt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-blue-50 border border-blue-100 w-fit mb-5">
              <ShieldCheck size={16} className="text-brand-primary" />
              <span className="text-[12px] font-bold tracking-wide uppercase text-brand-primary">Verified B2B Procurement Platform</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] text-brand-text-primary mb-6">
              Source Wholesale Inventory <br className="hidden md:block"/>
              From <span className="text-brand-primary">Direct Manufacturers</span>
            </h1>

            <p className="text-base text-brand-text-secondary font-medium max-w-xl mb-8 leading-relaxed">
              Access wholesale pricing, verified suppliers, and bulk inventory across India. Dedicated procurement engine for retailers, distributors, and businesses.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <button 
                onClick={() => navigate("/search?type=wholesale")}
                className="flex items-center gap-2 bg-brand-primary text-white py-3 px-8 rounded-md font-semibold hover:bg-brand-primary/90 transition-colors shadow-sm"
              >
                Browse Catalog
                <ArrowRight size={18} />
              </button>
              <button 
                onClick={() => navigate("/post-requirement")}
                className="flex items-center gap-2 bg-white text-brand-text-primary border border-brand-border py-3 px-8 rounded-md font-semibold hover:bg-gray-50 transition-colors shadow-sm"
              >
                <FileText size={18} />
                Post RFQ
              </button>
              <button 
                onClick={() => navigate("/gurugram-market-survey")}
                className="flex items-center gap-2 bg-brand-accent text-white py-3 px-8 rounded-md font-semibold hover:bg-[#e05a18] transition-colors shadow-sm"
              >
                Become a Verified Supplier
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-6 mt-2 border-t border-brand-border/60 pt-6">
               <div className="flex flex-col">
                  <span className="text-2xl font-black text-brand-text-primary">12K+</span>
                  <span className="text-xs font-semibold text-brand-text-secondary uppercase">Active Buyers</span>
               </div>
               <div className="w-px h-10 bg-brand-border"></div>
               <div className="flex flex-col">
                  <span className="text-2xl font-black text-brand-text-primary">2,500+</span>
                  <span className="text-xs font-semibold text-brand-text-secondary uppercase">Verified Sellers</span>
               </div>
               <div className="w-px h-10 bg-brand-border"></div>
               <div className="flex flex-col">
                  <span className="text-2xl font-black text-brand-text-primary">₹50Cr+</span>
                  <span className="text-xs font-semibold text-brand-text-secondary uppercase">Volume Sourced</span>
               </div>
            </div>
          </div>

          {/* Right Sourcing Widget */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-white rounded-xl shadow-lg border border-brand-border p-6 relative">
               <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary rounded-t-xl"></div>
               <h2 className="text-xl font-bold text-brand-text-primary mb-6">Quick Sourcing</h2>
               
               <div className="space-y-4">
                 <div>
                   <label className="block text-xs font-semibold text-brand-text-secondary uppercase mb-1.5">What are you looking for?</label>
                   <div className="relative">
                     <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                     <input type="text" placeholder="Search suppliers, products or brands..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-brand-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary focus:bg-white transition-colors" />
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-semibold text-brand-text-secondary uppercase mb-1.5">Category</label>
                     <div className="relative">
                       <Grid size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                       <select className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-brand-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary focus:bg-white transition-colors appearance-none">
                         <option value="">All Categories</option>
                         <option value="fmcg">FMCG</option>
                         <option value="electronics">Electronics</option>
                         <option value="fashion">Fashion & Apparel</option>
                         <option value="hardware">Hardware & Tools</option>
                       </select>
                     </div>
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-brand-text-secondary uppercase mb-1.5">Min MOQ</label>
                     <div className="relative">
                       <Package size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                       <input type="number" placeholder="e.g. 50" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-brand-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary focus:bg-white transition-colors" />
                     </div>
                   </div>
                 </div>

                 <div>
                   <label className="block text-xs font-semibold text-brand-text-secondary uppercase mb-1.5">Delivery Location</label>
                   <div className="relative">
                     <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                     <input type="text" placeholder="Enter Pincode or City" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-brand-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary focus:bg-white transition-colors" />
                   </div>
                 </div>

                 <button className="w-full bg-brand-accent text-white py-3 rounded-md font-bold text-sm hover:bg-[#e05a18] transition-colors mt-2 shadow-sm">
                   Find Suppliers
                 </button>
               </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default memo(Hero);
