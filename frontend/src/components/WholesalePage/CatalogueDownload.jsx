import { memo } from "react";
import { DownloadCloud, FileText, CheckCircle2 } from "lucide-react";

function CatalogueDownload() {
  return (
    <section className="py-20 lg:py-32 bg-brand-primary text-white border-b border-brand-border overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-accent/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="section-container relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6 backdrop-blur-sm">
              <FileText size={14} className="text-brand-accent" />
              <span className="text-[11px] font-bold tracking-widest uppercase text-white">Sourcing Intelligence</span>
            </div>

            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-black mb-6 tracking-tight leading-[1.1]">
              The 2026 <br/> Wholesale <span className="text-brand-accent">Catalogue</span>
            </h2>
            
            <p className="text-lg text-brand-text-secondary font-medium mb-10 max-w-lg">
              Download our comprehensive 120-page sourcing guide featuring factory-direct pricing, MOQs, and market trends across India's top industrial hubs.
            </p>

            <ul className="space-y-4 mb-10">
              {['Top performing categories and SKUs', 'Profiles of 500+ verified suppliers', 'Historical pricing data & margin estimates', 'Import/Export compliance guidelines'].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-brand-accent shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-gray-300">{item}</span>
                </li>
              ))}
            </ul>

            <button className="bg-brand-accent text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-emerald-400 transition-colors flex items-center gap-3">
              <DownloadCloud size={20} />
              Download PDF (12MB)
            </button>
          </div>

          {/* Right Visual mock */}
          <div className="lg:col-span-6 relative">
             <div className="relative w-full aspect-[4/5] max-w-[400px] mx-auto bg-white rounded-3xl p-6 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-white/10 rotate-2 hover:rotate-0 transition-transform duration-500">
               <div className="w-full h-full border border-brand-border rounded-xl bg-brand-background overflow-hidden relative">
                 <img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=600" alt="Cover" className="w-full h-1/2 object-cover" />
                 <div className="p-6">
                    <p className="text-[10px] font-black text-brand-accent uppercase tracking-widest mb-2">B2B Procurement</p>
                    <h3 className="text-3xl font-black text-brand-primary leading-tight mb-4">Sourcing <br/> India 2026</h3>
                    <div className="w-12 h-1 bg-brand-primary mb-4" />
                    <p className="text-xs font-bold text-brand-text-secondary">Exclusive pricing insights and verified supplier network directory.</p>
                 </div>
               </div>
               
               {/* Decorative elements */}
               <div className="absolute -top-6 -right-6 bg-brand-primary text-white p-4 rounded-2xl shadow-xl border border-brand-border/20 rotate-12">
                 <p className="text-[10px] font-black uppercase tracking-widest text-brand-accent mb-1">Updated</p>
                 <p className="text-xl font-black">Q3 '26</p>
               </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default memo(CatalogueDownload);
