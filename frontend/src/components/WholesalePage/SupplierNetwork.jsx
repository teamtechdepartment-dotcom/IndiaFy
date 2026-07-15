import { memo } from "react";
import { motion } from "framer-motion";
import { MapPin, Users, Truck } from "lucide-react";

const HUBS = [
  { name: "Delhi", top: "25%", left: "45%", label: "North Hub" },
  { name: "Mumbai", top: "55%", left: "30%", label: "West Hub" },
  { name: "Bangalore", top: "75%", left: "40%", label: "South Hub" },
  { name: "Ahmedabad", top: "45%", left: "25%", label: "Textile Node" },
  { name: "Jaipur", top: "35%", left: "35%", label: "Craft Node" },
  { name: "Kolkata", top: "45%", left: "70%", label: "East Hub" },
];

function SupplierNetwork() {
  return (
    <section className="w-full bg-white py-20 lg:py-32 border-b border-brand-border">
      <div className="section-container">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
          <h2 className="text-3xl lg:text-5xl font-display font-black text-brand-primary mb-6 tracking-tight">
            National <span className="text-brand-accent">Sourcing</span> Grid
          </h2>
          <p className="text-lg text-brand-text-secondary font-medium">
            Connect directly with verified manufacturers and primary distributors across India's largest industrial hubs.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Map Visualization */}
          <div className="lg:col-span-7 relative h-[400px] lg:h-[600px] bg-brand-background rounded-[2rem] border border-brand-border overflow-hidden p-8 flex items-center justify-center">
            {/* Abstract Map Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#10B981 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
            
            {/* Stylized Node Network replacing an actual map SVG for clean abstract UI */}
            <div className="relative w-[300px] h-[400px] lg:w-[400px] lg:h-[500px]">
              {HUBS.map((hub, i) => (
                <motion.div
                  key={hub.name}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, type: "spring" }}
                  className="absolute group flex flex-col items-center"
                  style={{ top: hub.top, left: hub.left }}
                >
                  <div className="relative">
                    <div className="w-4 h-4 bg-brand-accent rounded-full border-2 border-white shadow-md z-10 relative group-hover:scale-150 transition-transform cursor-pointer" />
                    <div className="absolute inset-0 bg-brand-accent rounded-full animate-ping opacity-40" />
                  </div>
                  <div className="absolute top-6 bg-white border border-brand-border px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                    <p className="text-xs font-bold text-brand-primary">{hub.name}</p>
                    <p className="text-[9px] font-semibold text-brand-accent uppercase">{hub.label}</p>
                  </div>
                </motion.div>
              ))}

              {/* Connecting Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none -z-0" opacity="0.3">
                <path d="M 135 100 L 90 180 L 120 220 L 210 180 L 135 100" fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="4 4" />
                <path d="M 120 220 L 160 300 L 210 180" fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="4 4" />
                <path d="M 105 140 L 135 100" fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="4 4" />
              </svg>
            </div>
          </div>

          {/* Right: Stats & Features */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4">
                <Users size={24} className="text-brand-accent" />
              </div>
              <h3 className="text-3xl font-display font-black text-brand-primary mb-2">2,500+</h3>
              <p className="text-sm font-bold text-brand-text-secondary uppercase tracking-widest">Active Verified Suppliers</p>
            </div>

            <div className="bg-brand-background rounded-2xl p-6 border border-brand-border">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4">
                <MapPin size={24} className="text-brand-primary" />
              </div>
              <h3 className="text-3xl font-display font-black text-brand-primary mb-2">18 States</h3>
              <p className="text-sm font-bold text-brand-text-secondary uppercase tracking-widest">Pan-India Coverage</p>
            </div>

            <div className="bg-brand-background rounded-2xl p-6 border border-brand-border">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4">
                <Truck size={24} className="text-brand-primary" />
              </div>
              <h3 className="text-3xl font-display font-black text-brand-primary mb-2">50+ Hubs</h3>
              <p className="text-sm font-bold text-brand-text-secondary uppercase tracking-widest">Distribution Centers</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default memo(SupplierNetwork);
