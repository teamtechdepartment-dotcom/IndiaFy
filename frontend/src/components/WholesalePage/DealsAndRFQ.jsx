import { memo } from "react";
import { CheckCircle2, Zap, ShieldAlert, Sparkles, Send, ArrowRight, Clock, Truck } from "lucide-react";
import { toast } from "react-toastify";

function DealsAndRFQ() {
  const handlePostRFQ = () => {
    toast.success("RFQ broadcasted to 2,500+ verified wholesale shops! Check your dashboard for instant dealer quotes.");
  };

  return (
    <section className="w-full py-12 sm:py-16 bg-[#F8FAFC] border-b border-gray-200/60">
      <div className="max-w-[1600px] 2xl:max-w-[1800px] w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10 pb-4 border-b border-gray-200/60">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold tracking-wider uppercase text-[#7C3AED] bg-[#7C3AED]/10 px-3.5 py-1 rounded-full mb-3">
              <Sparkles size={15} />
              <span>Wholesale Deals &amp; RFQ</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#1F2937]">
              Flash Contracts &amp; Custom Requirement Posting
            </h2>
            <p className="text-sm sm:text-base text-[#6B7280] font-medium mt-1">
              Claim time-sensitive bulk dealer discounts or broadcast a custom quotation request to regional stockists.
            </p>
          </div>
        </div>

        {/* Grid: 7 Columns for Deals, 5 Columns for RFQ Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">

          {/* Left: 3 Deal Cards (7 Columns) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-5">
            
            {/* Deal 1 - Teal Gradient */}
            <div className="relative rounded-3xl p-6 sm:p-7 text-white min-h-[260px] flex flex-col justify-between bg-gradient-to-br from-[#084F42] via-[#0B6E5D] to-[#0E7A67] shadow-xl shadow-[#0B6E5D]/15 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden group">
              <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
              <div>
                <div className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider bg-black/20 backdrop-blur-md px-3 py-1 rounded-full mb-4 text-emerald-200 border border-white/15">
                  <Zap size={13} className="text-amber-400 fill-current" />
                  <span>Flash Deal</span>
                </div>
                <div className="text-2xl sm:text-3xl xl:text-4xl font-black leading-tight mb-2.5 tracking-tight">
                  Flat 18% OFF
                </div>
                <p className="text-xs sm:text-sm text-emerald-100 font-semibold leading-relaxed">
                  On your first bulk purchase from verified wholesale shops across FMCG &amp; Grocery.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/15 flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs text-emerald-200 font-bold">
                  <span className="flex items-center gap-1"><Clock size={13} /> Expiring Soon</span>
                  <span>Max Save ₹25,000</span>
                </div>
                <div className="inline-block bg-white/20 backdrop-blur-md text-white font-mono font-black text-xs sm:text-sm px-3.5 py-2 rounded-xl text-center border border-white/20 tracking-wider shadow-inner">
                  USE CODE: BULK18
                </div>
              </div>
            </div>

            {/* Deal 2 - Blue Gradient */}
            <div className="relative rounded-3xl p-6 sm:p-7 text-white min-h-[260px] flex flex-col justify-between bg-gradient-to-br from-[#1E40AF] via-[#2563EB] to-[#3B82F6] shadow-xl shadow-[#2563EB]/15 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden group">
              <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
              <div>
                <div className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider bg-black/20 backdrop-blur-md px-3 py-1 rounded-full mb-4 text-blue-200 border border-white/15">
                  <Truck size={13} className="text-blue-300" />
                  <span>Logistics Offer</span>
                </div>
                <div className="text-2xl sm:text-3xl xl:text-4xl font-black leading-tight mb-2.5 tracking-tight">
                  Free Shipping
                </div>
                <p className="text-xs sm:text-sm text-blue-100 font-semibold leading-relaxed">
                  100% free doorstep freight on all pan-India bulk orders above ₹50,000.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/15 flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs text-blue-200 font-bold">
                  <span>18+ States Covered</span>
                  <span>Insured Transit</span>
                </div>
                <div className="inline-block bg-white/20 backdrop-blur-md text-white font-sans font-black text-xs sm:text-sm px-3.5 py-2 rounded-xl text-center border border-white/20">
                  Auto-Applied at Checkout
                </div>
              </div>
            </div>

            {/* Deal 3 - Purple Gradient */}
            <div className="relative rounded-3xl p-6 sm:p-7 text-white min-h-[260px] flex flex-col justify-between bg-gradient-to-br from-[#5B21B6] via-[#7C3AED] to-[#8B5CF6] shadow-xl shadow-[#7C3AED]/15 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden group">
              <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
              <div>
                <div className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider bg-black/20 backdrop-blur-md px-3 py-1 rounded-full mb-4 text-purple-200 border border-white/15">
                  <ShieldAlert size={13} className="text-amber-400" />
                  <span>Credit Line</span>
                </div>
                <div className="text-2xl sm:text-3xl xl:text-4xl font-black leading-tight mb-2.5 tracking-tight">
                  0% Interest Credit
                </div>
                <p className="text-xs sm:text-sm text-purple-100 font-semibold leading-relaxed">
                  Up to ₹5 Lakhs instant business credit with 30-60 day flexible repayment terms.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/15 flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs text-purple-200 font-bold">
                  <span>No Collateral Required</span>
                  <span>2-Hr Approval</span>
                </div>
                <div className="inline-block bg-white/20 backdrop-blur-md text-white font-sans font-black text-xs sm:text-sm px-3.5 py-2 rounded-xl text-center border border-white/20">
                  For Verified GST Buyers
                </div>
              </div>
            </div>

          </div>

          {/* Right: RFQ Box (5 Columns) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-white via-gray-50/50 to-white border-2 border-[#0B6E5D]/25 rounded-3xl p-6 sm:p-8 xl:p-10 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#0B6E5D]/5 rounded-full blur-2xl pointer-events-none" />
            
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#F97316] bg-[#F97316]/10 px-3.5 py-1 rounded-full mb-4">
                <Send size={15} />
                <span>Instant Quotation Engine</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#1F2937] leading-tight mb-3">
                Can&apos;t find what you&apos;re looking for?
              </h3>
              <p className="text-sm sm:text-base text-[#6B7280] font-semibold leading-relaxed mb-8">
                Post your target product specifications, MOQ, and expected price. Our sourcing AI will match and broadcast your RFQ to top verified wholesale shops and stockists within 15 minutes.
              </p>

              <div className="space-y-3.5 mb-8">
                {[
                  "Get competing quotes from 5+ verified wholesale shops",
                  "Negotiate target dealer pricing and bulk packaging terms",
                  "Save an average of 25-40% compared to local brokers",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3.5 bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-xs">
                    <div className="w-6 h-6 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0 mt-0.5 font-extrabold text-sm">
                      ✓
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-[#1F2937] leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-5 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs sm:text-sm text-[#6B7280] font-bold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>100% Free Service for Retailers &amp; Resellers</span>
              </div>
              <button
                type="button"
                onClick={handlePostRFQ}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#D97706] text-white font-black text-sm rounded-xl shadow-lg shadow-[#F97316]/30 hover:shadow-xl hover:shadow-[#F97316]/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <span>Post RFQ Now</span>
                <ArrowRight size={18} />
              </button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

export default memo(DealsAndRFQ);
