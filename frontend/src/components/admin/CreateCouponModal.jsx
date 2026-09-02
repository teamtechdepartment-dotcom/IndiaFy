import { X, TicketPercent, Sparkles } from "lucide-react";
import { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function CreateCouponModal({ open, onClose, onSuccess }) {
  if (!open) return null;

  const [discountType, setDiscountType] = useState("percentage");
  const [couponCode, setCouponCode] = useState("LUXE" + Math.floor(100 + Math.random() * 900));
  const [discountValue, setDiscountValue] = useState(20);
  const [minSpend, setMinSpend] = useState(true);
  const [minSpendAmount, setMinSpendAmount] = useState(1000);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (isActive = true) => {
    if (!couponCode.trim()) {
      toast.error("Coupon code is required");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post("/admin/management/coupons", {
        code: couponCode.trim().toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: minSpend ? Number(minSpendAmount) : 0,
        isActive,
      });

      toast.success(`Coupon ${couponCode} created successfully!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Failed to create coupon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Create Campaign Coupon
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure storefront promotional discounts and redemption rules
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 flex-1 overflow-y-auto">
          {/* LEFT FORM */}
          <div className="md:col-span-2 p-6 space-y-5">
            {/* Coupon Code */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5 block">Coupon Code</label>
              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold uppercase bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-[#2874F0]"
                />
                <button
                  type="button"
                  onClick={() =>
                    setCouponCode("FESTIVE" + Math.floor(100 + Math.random() * 900))
                  }
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  Auto-Generate
                </button>
              </div>
            </div>

            {/* Discount Type */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5 block">Discount Type & Amount</label>
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setDiscountType("percentage")}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    discountType === "percentage"
                      ? "bg-[#2874F0] text-white border-[#2874F0]"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  Percentage (%)
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType("fixed")}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    discountType === "fixed"
                      ? "bg-[#2874F0] text-white border-[#2874F0]"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  Fixed Amount (₹)
                </button>
              </div>

              <input
                type="number"
                min="1"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-[#2874F0]"
                placeholder={
                  discountType === "percentage" ? "% Discount" : "₹ Discount"
                }
              />
            </div>

            {/* Minimum Spend */}
            <div className="flex items-center justify-between border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Minimum Order Spend</p>
                <p className="text-[11px] text-slate-500">Apply coupon only on orders above a threshold</p>
              </div>
              <input
                type="checkbox"
                checked={minSpend}
                onChange={() => setMinSpend(!minSpend)}
                className="w-4 h-4 cursor-pointer"
              />
            </div>

            {minSpend && (
              <input
                type="number"
                min="0"
                value={minSpendAmount}
                onChange={(e) => setMinSpendAmount(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-[#2874F0]"
                placeholder="Min order amount (₹)"
              />
            )}

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSubmit(false)}
                className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Save as Inactive
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSubmit(true)}
                className="px-5 py-2.5 bg-[#2874F0] hover:bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition cursor-pointer"
              >
                {loading ? "Publishing..." : "Publish Coupon"}
              </button>
            </div>
          </div>

          {/* RIGHT PREVIEW */}
          <div className="bg-slate-50/60 dark:bg-slate-950/60 p-6 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Customer Card</p>

            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-[#2874F0] dark:text-[#FB641B]">
                <TicketPercent size={18} />
                <span className="font-black text-sm uppercase">{couponCode}</span>
              </div>

              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <li>
                  • {discountValue}
                  {discountType === "percentage" ? "%" : "₹"} Instant Off applied
                </li>
                {minSpend && <li>• Min. order amount ₹{minSpendAmount}</li>}
                <li>• Valid across IndiaFy pan-India store</li>
              </ul>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Audit Status</p>
              <p className="mt-1 font-bold text-xs flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <Sparkles size={14} /> Ready for Deployment
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
