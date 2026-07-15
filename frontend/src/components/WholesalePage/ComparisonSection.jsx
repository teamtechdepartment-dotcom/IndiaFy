import { memo } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

const FEATURES = [
  { name: "Video Verification", indiafy: true, indiamart: false, broker: false },
  { name: "GST Validation", indiafy: true, indiamart: true, broker: false },
  { name: "Supplier Trust Score", indiafy: true, indiamart: false, broker: false },
  { name: "Live Tracking", indiafy: true, indiamart: false, broker: false },
  { name: "Escrow Bulk Workflow", indiafy: true, indiamart: false, broker: false },
  { name: "Dedicated Support", indiafy: true, indiamart: false, broker: false },
];

function ComparisonSection() {
  return (
    <section className="py-20 lg:py-32 bg-white border-b border-brand-border">
      <div className="section-container">
        
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
          <h2 className="text-3xl lg:text-5xl font-display font-black text-brand-primary mb-6 tracking-tight">
            The New <span className="text-brand-accent">Standard</span>
          </h2>
          <p className="text-lg text-brand-text-secondary font-medium">
            See why modern procurement teams are switching from traditional directories to Indiafy's verified ecosystem.
          </p>
        </div>

        <div className="max-w-5xl mx-auto bg-brand-background border border-brand-border rounded-[2rem] overflow-hidden shadow-lg">
          {/* Table Header */}
          <div className="grid grid-cols-4 bg-white border-b border-brand-border p-6 text-center items-center">
            <div className="text-left">
              <span className="text-sm font-black uppercase tracking-widest text-brand-primary">Features</span>
            </div>
            <div>
              <span className="text-xl font-display font-black text-brand-accent">Indiafy</span>
            </div>
            <div>
              <span className="text-base font-bold text-brand-text-secondary">IndiaMART</span>
            </div>
            <div>
              <span className="text-base font-bold text-brand-text-secondary">Local Broker</span>
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-brand-border/50 bg-white/50">
            {FEATURES.map((feat, idx) => (
              <div key={idx} className="grid grid-cols-4 p-6 text-center items-center hover:bg-white transition-colors">
                <div className="text-left">
                  <span className="text-sm font-bold text-brand-primary">{feat.name}</span>
                </div>
                <div className="flex justify-center">
                  {feat.indiafy ? <CheckCircle2 size={24} className="text-brand-accent" /> : <XCircle size={24} className="text-red-300" />}
                </div>
                <div className="flex justify-center">
                  {feat.indiamart ? <CheckCircle2 size={24} className="text-brand-text-secondary" /> : <XCircle size={24} className="text-red-300" />}
                </div>
                <div className="flex justify-center">
                  {feat.broker ? <CheckCircle2 size={24} className="text-brand-text-secondary" /> : <XCircle size={24} className="text-red-300" />}
                </div>
              </div>
            ))}
          </div>
          
          {/* Footer CTA */}
          <div className="bg-brand-primary p-6 text-center">
             <p className="text-sm font-bold text-white uppercase tracking-widest mb-4">Stop guessing. Start sourcing securely.</p>
             <button className="bg-brand-accent text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-emerald-400 transition-colors">
               Create Free Account
             </button>
          </div>
        </div>

      </div>
    </section>
  );
}

export default memo(ComparisonSection);
