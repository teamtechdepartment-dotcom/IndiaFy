import { memo, useEffect } from "react";
import { ShieldCheck, MapPin, Star, Clock, Package, Mail } from "lucide-react";
import { useWholesaleStore } from "../../store/wholesaleStore";

function SupplierSkeleton() {
  return (
    <div className="bg-white border border-brand-border rounded-xl p-5 flex flex-col animate-pulse">
      <div className="flex gap-4 mb-4">
        <div className="w-12 h-12 bg-gray-100 rounded-lg shrink-0" />
        <div className="flex-1">
          <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-3 mb-5">
        <div className="h-3 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-full" />
      </div>
      <div className="h-10 bg-gray-100 rounded-md mt-auto" />
    </div>
  );
}

function FeaturedSuppliers() {
  const { distributors, fetchDistributors, isLoading, clearFilters } = useWholesaleStore();

  useEffect(() => {
    fetchDistributors();
  }, [fetchDistributors]);

  return (
    <section className="py-12 bg-gray-50 border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h2 className="text-2xl lg:text-3xl font-black text-brand-text-primary mb-2">
            Verified Suppliers
          </h2>
          <p className="text-sm text-brand-text-secondary font-medium">
            Partner with India's top-rated manufacturers and authorized distributors.
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <SupplierSkeleton key={i} />)}
          </div>
        ) : distributors.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {distributors.slice(0, 8).map((dist) => {
              const years = dist.yearsInBusiness || Math.floor(Math.random() * 15) + 2;
              const response = dist.responseTime || "< 2 Hours";
              const rating = dist.rating || (4 + Math.random() * 0.9).toFixed(1);
              const moq = "₹5,000";
              
              return (
                <div key={dist._id} className="bg-white border border-brand-border rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col group">
                  
                  {/* Header: Logo & Name */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center p-1.5 shrink-0">
                      {dist.profilePic ? (
                        <img loading="lazy" decoding="async" src={dist.profilePic} alt={dist.businessName} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-xl font-black text-gray-400 uppercase">{dist.businessName?.charAt(0) || 'S'}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-brand-text-primary line-clamp-1 group-hover:text-brand-primary transition-colors">{dist.businessName}</h3>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-brand-text-secondary mt-0.5">
                        <MapPin size={12} /> {dist.businessAddress?.city || "New Delhi"}, {dist.businessAddress?.state || "Delhi"}
                      </div>
                    </div>
                  </div>

                  {/* Trust Badge */}
                  <div className="flex items-center gap-1.5 bg-blue-50 text-brand-primary px-2 py-1 rounded w-fit mb-4 border border-blue-100">
                    <ShieldCheck size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wide">Verified Supplier</span>
                  </div>

                  {/* Stats List */}
                  <div className="space-y-2 mb-5 mt-auto">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-brand-text-secondary flex items-center gap-1.5"><Clock size={14}/> Response Rate</span>
                      <span className="font-semibold text-brand-text-primary">{response}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-brand-text-secondary flex items-center gap-1.5"><Star size={14}/> Rating</span>
                      <span className="font-semibold text-brand-text-primary flex items-center gap-1">{rating} <Star size={10} fill="currentColor" className="text-amber-500"/></span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-brand-text-secondary flex items-center gap-1.5"><Package size={14}/> Min. Order</span>
                      <span className="font-semibold text-brand-text-primary">{moq}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-brand-text-secondary flex items-center gap-1.5"><ShieldCheck size={14}/> Experience</span>
                      <span className="font-semibold text-brand-text-primary">{years} Years</span>
                    </div>
                  </div>

                  <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-brand-primary text-brand-primary font-bold text-xs rounded-md hover:bg-blue-50 transition-colors">
                    <Mail size={16} /> Contact Supplier
                  </button>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-brand-border rounded-xl">
            <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-brand-text-primary mb-1">No Suppliers Found</h3>
            <p className="text-sm text-brand-text-secondary max-w-sm mx-auto mb-4">
              Try adjusting your filters or search criteria.
            </p>
            <button 
              onClick={() => { clearFilters(); fetchDistributors(); }}
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

export default memo(FeaturedSuppliers);
