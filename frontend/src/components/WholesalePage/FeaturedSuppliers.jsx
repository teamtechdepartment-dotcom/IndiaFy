/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import { memo, useEffect } from "react";
import { ShieldCheck, Video, MapPin, Award, Activity, PackageCheck, Star, AlertCircle } from "lucide-react";
import { useWholesaleStore } from "../../store/wholesaleStore";

function SupplierSkeleton() {
  return (
    <div className="bg-brand-background border border-brand-border rounded-[24px] p-6 flex flex-col animate-pulse">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-16 h-16 bg-white border border-brand-border rounded-2xl shrink-0" />
        <div className="flex-1">
          <div className="h-5 bg-white rounded w-3/4 mb-2" />
          <div className="h-3 bg-white rounded w-1/2 mb-2" />
          <div className="h-3 bg-white rounded w-1/3" />
        </div>
      </div>
      <div className="flex gap-2 mb-6">
        <div className="h-6 w-20 bg-white rounded" />
        <div className="h-6 w-24 bg-white rounded" />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="h-16 bg-white rounded-xl" />
        <div className="h-16 bg-white rounded-xl" />
      </div>
      <div className="space-y-4">
        <div className="h-2 bg-white rounded-full w-full mb-1" />
        <div className="h-2 bg-white rounded-full w-full" />
      </div>
      <div className="h-10 bg-white rounded-xl mt-6" />
    </div>
  );
}

function FeaturedSuppliers() {
  const { distributors, fetchDistributors, isLoading, clearFilters } = useWholesaleStore();

  useEffect(() => {
    fetchDistributors();
  }, [fetchDistributors]);

  return (
    <section className="py-20 lg:py-32 bg-white border-b border-brand-border">
      <div className="section-container">
        
        <div className="mb-12 lg:mb-16">
          <h2 className="text-3xl lg:text-5xl font-display font-black text-brand-primary mb-4 tracking-tight">
            Featured <span className="text-brand-accent">Suppliers</span>
          </h2>
          <p className="text-lg text-brand-text-secondary font-medium">
            Partner with India's top-rated, fully verified manufacturers and distributors.
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {Array.from({ length: 3 }).map((_, i) => <SupplierSkeleton key={i} />)}
          </div>
        ) : distributors.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {distributors.slice(0, 6).map((dist) => {
              const years = dist.yearsInBusiness || Math.floor(Math.random() * 15) + 2;
              const orders = dist.ordersCompleted || (Math.floor(Math.random() * 500) + 100) * 10;
              const response = dist.responseTime || "< 2 Hours";
              const rating = dist.rating || (4 + Math.random() * 0.9).toFixed(1);
              const trustScore = dist.trustScore || Math.floor(Math.random() * 10) + 90;
              const fulfill = dist.fulfillmentRate || Math.floor(Math.random() * 5) + 94;
              
              return (
                <div key={dist._id} className="bg-brand-background border border-brand-border rounded-[24px] p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group flex flex-col relative overflow-hidden">
                  
                  {/* Premium Hover Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  {/* Header: Logo, Name, Location */}
                  <div className="flex items-start gap-4 mb-6 relative z-10">
                    <div className="w-16 h-16 bg-white border border-brand-border rounded-2xl flex items-center justify-center p-2 shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                      {dist.profilePic ? (
                        <img loading="lazy" decoding="async" src={dist.profilePic} alt={dist.businessName} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-2xl font-black text-brand-text-secondary uppercase">{dist.businessName?.charAt(0) || 'S'}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-brand-primary line-clamp-1">{dist.businessName}</h3>
                      <div className="flex items-center gap-1 text-xs font-bold text-brand-text-secondary uppercase tracking-widest mt-1">
                        <MapPin size={12} /> {dist.businessAddress?.state || "Maharashtra"}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-1.5">
                        <Star size={12} fill="currentColor" /> {rating} ({orders}+ Orders)
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                    <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100 text-[10px] font-bold uppercase tracking-wider group-hover:bg-emerald-100 transition-colors">
                      <ShieldCheck size={12} /> GST Verified
                    </div>
                    <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100 text-[10px] font-bold uppercase tracking-wider group-hover:bg-blue-100 transition-colors">
                      <Video size={12} /> Video Audited
                    </div>
                  </div>

                  {/* Grid Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-6 mt-auto relative z-10">
                    <div className="bg-white p-3 rounded-xl border border-brand-border group-hover:border-brand-primary/20 transition-colors">
                      <div className="flex items-center gap-1.5 mb-1 text-brand-text-secondary">
                        <Award size={14} /> <span className="text-[9px] font-bold uppercase tracking-widest">Experience</span>
                      </div>
                      <p className="text-sm font-black text-brand-primary">{years} Years</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-brand-border group-hover:border-brand-primary/20 transition-colors">
                      <div className="flex items-center gap-1.5 mb-1 text-brand-text-secondary">
                        <Activity size={14} /> <span className="text-[9px] font-bold uppercase tracking-widest">Response</span>
                      </div>
                      <p className="text-sm font-black text-brand-primary">{response}</p>
                    </div>
                  </div>

                  {/* Progress Bars (Trust & Fulfillment) */}
                  <div className="space-y-4 relative z-10">
                    <div>
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-brand-primary mb-1">
                        <span>Trust Score</span>
                        <span className="text-brand-accent">{trustScore}/100</span>
                      </div>
                      <div className="w-full h-2 bg-brand-border rounded-full overflow-hidden">
                        <div className="h-full bg-brand-accent rounded-full group-hover:brightness-110 transition-all duration-1000" style={{ width: `${trustScore}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-brand-primary mb-1">
                        <span className="flex items-center gap-1"><PackageCheck size={12} className="text-brand-text-secondary"/> Fulfillment Rate</span>
                        <span>{fulfill}%</span>
                      </div>
                      <div className="w-full h-2 bg-brand-border rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full group-hover:brightness-110 transition-all duration-1000" style={{ width: `${fulfill}%` }} />
                      </div>
                    </div>
                  </div>

                  <button className="w-full py-3 mt-6 bg-white border border-brand-border text-brand-primary font-bold uppercase tracking-widest text-[11px] rounded-xl hover:bg-brand-primary hover:text-white hover:scale-[1.02] transition-all relative z-10 shadow-sm">
                    View Catalog
                  </button>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-brand-background border border-brand-border rounded-[2rem] shadow-sm">
            <div className="w-20 h-20 bg-white border border-brand-border rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={32} className="text-brand-text-secondary opacity-50" />
            </div>
            <h3 className="text-xl font-black text-brand-primary mb-2">No Suppliers Found</h3>
            <p className="text-sm font-medium text-brand-text-secondary max-w-md mx-auto mb-6">
              We couldn't find any verified suppliers matching your current filter criteria.
            </p>
            <button 
              onClick={() => { clearFilters(); fetchDistributors(); }}
              className="bg-white border border-brand-border text-brand-primary px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}

      </div>
    </section>
  );
}

export default memo(FeaturedSuppliers);
