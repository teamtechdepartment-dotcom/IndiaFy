import { memo } from "react";
import { Send, PhoneCall, Building2, Package } from "lucide-react";
import { toast } from "react-toastify";

function PostRequirement() {
  const handleToast = (e) => {
    e.preventDefault();
    toast.success("Request received. A procurement manager will contact you shortly.");
  };

  return (
    <section className="py-16 bg-blue-50 border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white border border-brand-primary/20 rounded-2xl p-8 lg:p-12 shadow-sm flex flex-col lg:flex-row items-center gap-10">
          
          {/* Left Text */}
          <div className="flex-1">
            <h2 className="text-3xl lg:text-4xl font-black text-brand-text-primary mb-4 leading-tight">
              Need <span className="text-brand-primary">Custom Bulk Pricing?</span>
            </h2>
            <p className="text-base text-brand-text-secondary font-medium mb-8 max-w-lg">
              Can't find exactly what you're looking for? Submit an RFQ and our sourcing engine will connect you with top verified manufacturers within 24 hours.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                   <Building2 size={20} className="text-brand-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-brand-text-primary">Direct Factory</p>
                  <p className="text-xs font-semibold text-brand-text-secondary">Negotiated Rates</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                   <Package size={20} className="text-brand-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-brand-text-primary">Custom Orders</p>
                  <p className="text-xs font-semibold text-brand-text-secondary">Low MOQ Options</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
               <button 
                 onClick={handleToast}
                 className="flex items-center gap-2 bg-brand-primary text-white font-bold py-3 px-8 rounded-md hover:bg-brand-primary/90 transition-colors shadow-sm"
               >
                 <Send size={18} /> Request Quotation
               </button>
               <button 
                 onClick={handleToast}
                 className="flex items-center gap-2 bg-white text-brand-text-primary border border-brand-border font-bold py-3 px-8 rounded-md hover:bg-gray-50 transition-colors"
               >
                 <PhoneCall size={18} /> Talk to Supplier
               </button>
            </div>
          </div>

          {/* Right Visual/Form placeholder */}
          <div className="flex-1 w-full bg-gray-50 border border-brand-border rounded-xl p-6 lg:p-8">
            <h3 className="text-lg font-bold text-brand-text-primary mb-6">Quick RFQ Form</h3>
            <form className="space-y-4" onSubmit={handleToast}>
              <div>
                <label className="block text-xs font-semibold text-brand-text-secondary uppercase mb-1.5">Product Details</label>
                <input type="text" placeholder="e.g. 5000 units of Cotton T-Shirts" required className="w-full bg-white border border-brand-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-text-secondary uppercase mb-1.5">Target Qty</label>
                  <input type="number" placeholder="5000" required className="w-full bg-white border border-brand-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text-secondary uppercase mb-1.5">Target Price</label>
                  <input type="number" placeholder="₹150" className="w-full bg-white border border-brand-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary" />
                </div>
              </div>
              <button type="submit" className="w-full bg-brand-primary text-white font-bold text-sm py-3 rounded-md hover:bg-brand-primary/90 transition-colors mt-2">
                Submit RFQ
              </button>
            </form>
          </div>

        </div>

      </div>
    </section>
  );
}

export default memo(PostRequirement);
