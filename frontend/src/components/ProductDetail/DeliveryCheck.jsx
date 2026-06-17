import { memo, useState } from "react";
import { MapPin } from "lucide-react";

function DeliveryCheck() {
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState(null);

  const handleCheck = () => {
    if (pincode.length === 6 && !isNaN(pincode)) {
      setResult({
        valid: true,
        message: "Delivery available to this location.",
        eta: "FREE delivery Thursday, 21 June. Order within 10 hrs 30 mins."
      });
    } else {
      setResult({
        valid: false,
        message: "Please enter a valid 6-digit PIN code."
      });
    }
  };

  return (
    <div className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
      <div className="flex items-center gap-1.5 text-sm font-bold text-[#212121] mb-2">
        <MapPin size={16} className="text-[#2874F0]" />
        Deliver to Gurugram - 122001
      </div>
      
      {result?.valid && (
        <p className="text-sm font-bold text-[#212121] mb-3">
          {result.eta} <a href="#" className="text-[#2874F0] font-normal hover:text-[#FB641B] hover:underline">Details</a>
        </p>
      )}

      <div className="flex items-center gap-2 max-w-sm mt-3">
        <input 
          type="text" 
          maxLength="6"
          placeholder="Enter pincode" 
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
          className="flex-1 border border-gray-200 rounded-lg p-2.5 text-sm focus:border-[#2874F0] focus:ring-1 focus:ring-[#2874F0] focus:outline-none transition-shadow"
        />
        <button 
          onClick={handleCheck}
          className="bg-white border border-[#2874F0] text-[#2874F0] hover:bg-[#2874F0] hover:text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all"
        >
          Check
        </button>
      </div>
      
      {result && (
        <p className={`text-xs mt-3 font-bold ${result.valid ? "text-[#10B981]" : "text-[#FB641B]"}`}>
          {result.message}
        </p>
      )}
    </div>
  );
}

export default memo(DeliveryCheck);
