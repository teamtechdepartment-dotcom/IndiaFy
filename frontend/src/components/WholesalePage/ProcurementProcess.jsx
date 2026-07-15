import { memo } from "react";
import { motion } from "framer-motion";
import { Search, FileText, ShieldCheck, Video, Truck, Package } from "lucide-react";

const STEPS = [
  { id: 1, title: "Browse Products", desc: "Search through 12k+ verified SKUs.", icon: Search },
  { id: 2, title: "Request Quote", desc: "Get custom bulk pricing instantly.", icon: FileText },
  { id: 3, title: "Verification", desc: "Escrow funds locked safely.", icon: ShieldCheck },
  { id: 4, title: "Video Proof", desc: "Mandatory packing recording.", icon: Video },
  { id: 5, title: "Dispatch", desc: "Handover to national logistics.", icon: Truck },
  { id: 6, title: "Delivery", desc: "Final inspection & payout.", icon: Package },
];

function ProcurementProcess() {
  return (
    <section className="py-20 lg:py-32 bg-brand-primary text-white border-b border-brand-border overflow-hidden">
      <div className="section-container relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
          <h2 className="text-3xl lg:text-5xl font-display font-black mb-6 tracking-tight">
            The <span className="text-brand-accent">Indiafy</span> Workflow
          </h2>
          <p className="text-lg text-brand-text-secondary font-medium">
            A frictionless, escrow-protected B2B procurement pipeline designed for absolute trust.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 rounded-full overflow-hidden">
             <motion.div 
               initial={{ x: "-100%" }}
               whileInView={{ x: "100%" }}
               viewport={{ once: true }}
               transition={{ duration: 4, ease: "linear" }}
               className="w-full h-full bg-brand-accent shadow-[0_0_20px_#10B981]"
             />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-4 relative z-10">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2, type: "spring" }}
                  className="relative flex flex-col items-center text-center group"
                >
                  <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center mb-6 group-hover:bg-brand-accent group-hover:border-brand-accent transition-colors shadow-xl">
                    <Icon size={28} className="text-white group-hover:text-brand-primary transition-colors" />
                  </div>
                  
                  <div className="absolute top-8 lg:top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5 border-t border-dashed border-white/20 hidden lg:block" />

                  <h3 className="text-sm lg:text-base font-black uppercase tracking-widest mb-2">{step.title}</h3>
                  <p className="text-xs font-bold text-brand-text-secondary leading-relaxed max-w-[150px]">{step.desc}</p>

                  <div className="mt-4 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black text-white/50">
                    {step.id}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
    </section>
  );
}

export default memo(ProcurementProcess);
