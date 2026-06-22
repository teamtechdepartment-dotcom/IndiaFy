import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, ChevronLeft, ChevronRight, Save, Send } from "lucide-react";
import toast from "react-hot-toast";

const STORAGE_KEY = "gurugram_survey_draft";

const ROLES = ["Customer", "Shop Owner", "Retailer", "Supplier", "Distributor", "Wholesaler", "Delivery Partner"];
const BUSINESS_TYPES = ["Grocery", "Electronics", "Fashion", "Beauty", "Pharmacy", "Food", "Home Essentials", "Wholesale", "Other"];
const SECTORS = ["Sector 14", "Sector 15", "Sector 17", "Sector 29", "Sector 31", "Sector 44", "Sector 45", "Sector 46", "Sector 47", "Sector 50", "Sector 54", "Sector 55", "Sector 56", "DLF Phase 1", "DLF Phase 2", "DLF Phase 3", "DLF Phase 4", "DLF Phase 5", "Sushant Lok", "Golf Course Road", "Sohna Road", "Udyog Vihar", "Other"];
const PREFERRED_PLATFORMS = ["Blinkit", "Zepto", "Swiggy", "Amazon", "Flipkart", "Local Market"];

const initialState = {
  // Common
  "Full Name": "", "Mobile Number": "", "Email": "", "Role": "",
  
  // Location
  "Full Address": "", "Gurugram Sector": "", "Area": "", "Landmark": "", "Pincode": "",
  
  // Business Common
  "Business Name": "", "GST Number": "", "Challenges": "", "Interested in Joining IndiaFy": "",
  
  // Retailer Specific
  "Business Type": "", "Years in Business": "", "Team Size": "",
  "Products Sold": "", "Delivery Radius": "", "Current Daily Orders": "", 
  
  // Supplier Specific
  "Company Name": "", "Product Categories": "", "MOQ": "", "Supply Areas": "", 
  "Inventory Capacity": "", "Delivery Capabilities": "", "Monthly Supply Volume": "",
  
  // Delivery Partner Specific
  "Vehicle Type": "", "Delivery Experience": "", "Areas Covered": "", 
  "Daily Deliveries": "", "Working Hours": "",
  
  // Customer Specific
  "Customer Purchase Categories": "", "Order Frequency": "", "Preferred Platforms": [],
  "Delivery Problems": "", "Missing Products": "", "Want IndiaFy in Area": ""
};

const getStepsConfig = (role) => {
  if (role === "Customer") {
    return [
      { id: "personal", title: "Personal Info" },
      { id: "customer_location", title: "Location Details" },
      { id: "customer_behavior", title: "Shopping Behavior" },
      { id: "customer_pain", title: "Pain Points" }
    ];
  } else if (role === "Shop Owner" || role === "Retailer") {
    return [
      { id: "personal", title: "Personal Info" },
      { id: "retailer_business", title: "Business Details" },
      { id: "retailer_ops", title: "Operations" },
      { id: "retailer_intelligence", title: "Market Intelligence" }
    ];
  } else if (role === "Supplier" || role === "Distributor" || role === "Wholesaler") {
    return [
      { id: "personal", title: "Personal Info" },
      { id: "supplier_company", title: "Company Details" },
      { id: "supplier_ops", title: "Supply Operations" },
      { id: "supplier_intelligence", title: "Market Intelligence" }
    ];
  } else if (role === "Delivery Partner") {
    return [
      { id: "personal", title: "Personal Info" },
      { id: "delivery_details", title: "Delivery Details" },
      { id: "delivery_ops", title: "Operations" },
      { id: "delivery_intelligence", title: "Market Intelligence" }
    ];
  }
  return [{ id: "personal", title: "Personal Info" }];
};

export default function GurugramSurvey() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialState);
  const [startedAt, setStartedAt] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const steps = getStepsConfig(formData["Role"]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const draft = localStorage.getItem(STORAGE_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormData(parsed.formData || initialState);
        setCurrentStep(parsed.currentStep || 0);
        setStartedAt(parsed.startedAt || new Date().toISOString());
        if (parsed.currentStep > 0 || Object.values(parsed.formData).some(v => v !== "" && v.length !== 0)) {
            toast.success("Draft restored!");
        }
      } catch (e) {
        setStartedAt(new Date().toISOString());
      }
    } else {
      setStartedAt(new Date().toISOString());
    }
  }, []);

  useEffect(() => {
    if (startedAt && !isSuccess) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ formData, currentStep, startedAt }));
    }
  }, [formData, currentStep, startedAt, isSuccess]);

  const handleRoleChange = (newRole) => {
    setFormData((prev) => ({
      ...initialState,
      "Full Name": prev["Full Name"],
      "Mobile Number": prev["Mobile Number"],
      "Email": prev["Email"],
      "Role": newRole
    }));
    setCurrentStep(0);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === "Role") {
      handleRoleChange(value);
      return;
    }

    if (type === "checkbox") {
      setFormData((prev) => {
        const arr = prev[name] ? [...prev[name]] : [];
        if (checked) {
          if (!arr.includes(value)) arr.push(value);
        } else {
          const idx = arr.indexOf(value);
          if (idx > -1) arr.splice(idx, 1);
        }
        return { ...prev, [name]: arr };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (!formData["Full Name"] || !formData["Mobile Number"] || !formData["Role"]) {
        toast.error("Please fill required fields (Name, Mobile, Role)");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    window.scrollTo(0, 0);
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo(0, 0);
  };

  const sendDataToWebhook = async (status, dropOffStepStr) => {
    const webhookUrl = import.meta.env.VITE_GURUGRAM_SURVEY_WEBHOOK;
    if (!webhookUrl) {
      console.warn("Webhook URL not found in env. Data not sent.");
      return;
    }

    const payload = {
      "Timestamp": new Date().toISOString(),
      "Started At": startedAt,
      "Completed At": status === "Completed" ? new Date().toISOString() : "",
      "Submission Status": status,
      "Drop-off Step": dropOffStepStr,
      ...formData,
      "Preferred Platforms": formData["Preferred Platforms"].join(", ")
    };

    try {
      await fetch(webhookUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error("Webhook error", e);
      throw e;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await sendDataToWebhook("Completed", "None");
      setIsSuccess(true);
      localStorage.removeItem(STORAGE_KEY);
      toast.success("Survey submitted successfully!");
      window.scrollTo(0, 0);
    } catch (error) {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (label, name, type = "text", placeholder = "", required = false) => (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-[#212121] mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label>
      <input
        type={type}
        name={name}
        value={formData[name] || ""}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2874F0]/50 focus:border-[#2874F0] transition-colors"
      />
    </div>
  );

  const renderSelect = (label, name, options, required = false) => (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-[#212121] mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label>
      <select
        name={name}
        value={formData[name] || ""}
        onChange={handleChange}
        required={required}
        className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2874F0]/50 focus:border-[#2874F0] transition-colors appearance-none"
      >
        <option value="">Select {label}</option>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );

  const renderCheckboxes = (label, name, options) => (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-[#212121] mb-2">{label}</label>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg border border-[#E0E0E0] hover:bg-[#F8FAFC] transition-colors">
            <input
              type="checkbox"
              name={name}
              value={opt}
              checked={formData[name]?.includes(opt)}
              onChange={handleChange}
              className="w-4 h-4 text-[#2874F0] rounded border-[#E0E0E0] focus:ring-[#2874F0]"
            />
            <span className="text-sm font-medium text-[#212121]">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl max-w-lg w-full text-center border border-[#E0E0E0]">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-bold text-[#212121] mb-4">
            Thank you for helping IndiaFy build Gurugram’s next commerce ecosystem.
          </h2>
          <p className="text-gray-500 mb-8 font-medium">Your submission has been securely recorded.</p>
          <div className="flex flex-col gap-3">
            <Link to="/" className="w-full bg-[#2874F0] text-white py-3 rounded-xl font-bold shadow-md hover:bg-blue-700 transition-colors inline-block">
              Back to Home
            </Link>
            <Link to="/search" className="w-full bg-[#F8FAFC] text-[#2874F0] border border-[#2874F0] py-3 rounded-xl font-bold hover:bg-[#2874F0] hover:text-white transition-colors inline-block">
              Explore IndiaFy
            </Link>
            <Link to="/become-seller-info" className="w-full text-[#FB641B] py-3 font-bold hover:underline inline-block">
              Become a Seller
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeStepConfig = steps[currentStep];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 font-sans text-[#212121]">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#212121] mb-3">Gurugram Market Intelligence</h1>
          <p className="text-gray-500 font-medium">Help us build the most powerful local commerce network in Gurugram.</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-xs font-bold text-[#2874F0] uppercase tracking-wider">Step {currentStep + 1} of {steps.length}</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{activeStepConfig.title}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#2874F0] h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#E0E0E0] p-6 md:p-8 overflow-hidden relative">
          
          <form onSubmit={handleSubmit} className="relative">
            
            {/* STEP 1: PERSONAL INFO (Common) */}
            <div className={`transition-opacity duration-300 ${activeStepConfig.id === "personal" ? "block opacity-100" : "hidden opacity-0 h-0 overflow-hidden"}`}>
              <h2 className="text-xl font-bold mb-6 border-b pb-2">Personal Information</h2>
              {renderInput("Full Name", "Full Name", "text", "John Doe", true)}
              {renderInput("Mobile Number", "Mobile Number", "tel", "+91 xxxxx xxxxx", true)}
              {renderInput("Email Address", "Email", "email", "john@example.com")}
              {renderSelect("Role", "Role", ROLES, true)}
            </div>

            {/* CUSTOMER FLOW */}
            <div className={`transition-opacity duration-300 ${activeStepConfig.id === "customer_location" ? "block opacity-100" : "hidden opacity-0 h-0 overflow-hidden"}`}>
              <h2 className="text-xl font-bold mb-6 border-b pb-2">Location Details</h2>
              {renderInput("Area", "Area", "text", "e.g. DLF Phase 1")}
              {renderSelect("Sector", "Gurugram Sector", SECTORS)}
              {renderInput("Pincode", "Pincode", "text", "122001")}
            </div>
            <div className={`transition-opacity duration-300 ${activeStepConfig.id === "customer_behavior" ? "block opacity-100" : "hidden opacity-0 h-0 overflow-hidden"}`}>
              <h2 className="text-xl font-bold mb-6 border-b pb-2">Shopping Behavior</h2>
              {renderInput("What do you buy most?", "Customer Purchase Categories", "text", "e.g. Groceries, Medicines")}
              {renderSelect("How often do you order online?", "Order Frequency", ["Daily", "Weekly", "Monthly", "Rarely"])}
              {renderCheckboxes("Preferred Platforms", "Preferred Platforms", PREFERRED_PLATFORMS)}
            </div>
            <div className={`transition-opacity duration-300 ${activeStepConfig.id === "customer_pain" ? "block opacity-100" : "hidden opacity-0 h-0 overflow-hidden"}`}>
              <h2 className="text-xl font-bold mb-6 border-b pb-2">Pain Points</h2>
              {renderInput("Biggest delivery problems", "Delivery Problems", "text", "e.g. Late delivery")}
              {renderInput("Missing products in your area", "Missing Products", "text", "e.g. Fresh organic milk")}
              {renderSelect("Want IndiaFy in your area?", "Want IndiaFy in Area", ["Yes", "No", "Maybe"])}
            </div>

            {/* SHOP OWNER / RETAILER FLOW */}
            <div className={`transition-opacity duration-300 ${activeStepConfig.id === "retailer_business" ? "block opacity-100" : "hidden opacity-0 h-0 overflow-hidden"}`}>
              <h2 className="text-xl font-bold mb-6 border-b pb-2">Business & Location</h2>
              {renderInput("Business Name", "Business Name", "text", "Store Name")}
              {renderSelect("Business Type", "Business Type", BUSINESS_TYPES)}
              {renderInput("GST Number (Optional)", "GST Number", "text")}
              {renderInput("Years in Business", "Years in Business", "number", "e.g. 5")}
              {renderInput("Team Size", "Team Size", "number", "e.g. 3")}
              {renderSelect("Sector", "Gurugram Sector", SECTORS)}
              {renderInput("Area", "Area", "text", "e.g. MG Road")}
              {renderInput("Pincode", "Pincode", "text", "122001")}
            </div>
            <div className={`transition-opacity duration-300 ${activeStepConfig.id === "retailer_ops" ? "block opacity-100" : "hidden opacity-0 h-0 overflow-hidden"}`}>
              <h2 className="text-xl font-bold mb-6 border-b pb-2">Operations & Products</h2>
              {renderInput("Current Daily Orders", "Current Daily Orders", "number", "e.g. 50")}
              {renderInput("Delivery Radius (km)", "Delivery Radius", "number", "e.g. 3")}
              {renderInput("Products Sold", "Products Sold", "text", "e.g. Daily Needs, Snacks")}
            </div>
            <div className={`transition-opacity duration-300 ${activeStepConfig.id === "retailer_intelligence" ? "block opacity-100" : "hidden opacity-0 h-0 overflow-hidden"}`}>
              <h2 className="text-xl font-bold mb-6 border-b pb-2">Market Intelligence</h2>
              {renderInput("Biggest Challenges", "Challenges", "text", "e.g. High competition")}
              {renderSelect("Interested in Joining IndiaFy?", "Interested in Joining IndiaFy", ["Yes", "Maybe", "No"])}
            </div>

            {/* SUPPLIER / DISTRIBUTOR / WHOLESALER FLOW */}
            <div className={`transition-opacity duration-300 ${activeStepConfig.id === "supplier_company" ? "block opacity-100" : "hidden opacity-0 h-0 overflow-hidden"}`}>
              <h2 className="text-xl font-bold mb-6 border-b pb-2">Company Details</h2>
              {renderInput("Company Name", "Company Name", "text", "Supplier Corp")}
              {renderInput("Product Categories", "Product Categories", "text", "e.g. FMCG")}
              {renderInput("GST Number", "GST Number", "text")}
              {renderSelect("Sector", "Gurugram Sector", SECTORS)}
              {renderInput("Area", "Area", "text", "e.g. Udyog Vihar")}
              {renderInput("Pincode", "Pincode", "text", "122016")}
            </div>
            <div className={`transition-opacity duration-300 ${activeStepConfig.id === "supplier_ops" ? "block opacity-100" : "hidden opacity-0 h-0 overflow-hidden"}`}>
              <h2 className="text-xl font-bold mb-6 border-b pb-2">Supply Operations</h2>
              {renderInput("Minimum Order Quantity (MOQ)", "MOQ", "text", "e.g. ₹5000")}
              {renderInput("Supply Areas", "Supply Areas", "text", "e.g. All Gurugram")}
              {renderInput("Inventory Capacity", "Inventory Capacity", "text", "e.g. 5000 sq ft")}
              {renderInput("Delivery Capabilities", "Delivery Capabilities", "text", "e.g. Self-owned trucks")}
              {renderInput("Monthly Supply Volume", "Monthly Supply Volume", "text", "e.g. ₹50 Lakhs")}
            </div>
            <div className={`transition-opacity duration-300 ${activeStepConfig.id === "supplier_intelligence" ? "block opacity-100" : "hidden opacity-0 h-0 overflow-hidden"}`}>
              <h2 className="text-xl font-bold mb-6 border-b pb-2">Market Intelligence</h2>
              {renderInput("Biggest Challenges", "Challenges", "text", "e.g. Payment delays")}
              {renderSelect("Interested in Joining IndiaFy?", "Interested in Joining IndiaFy", ["Yes", "Maybe", "No"])}
            </div>

            {/* DELIVERY PARTNER FLOW */}
            <div className={`transition-opacity duration-300 ${activeStepConfig.id === "delivery_details" ? "block opacity-100" : "hidden opacity-0 h-0 overflow-hidden"}`}>
              <h2 className="text-xl font-bold mb-6 border-b pb-2">Delivery Details</h2>
              {renderSelect("Vehicle Type", "Vehicle Type", ["Bike", "Scooter", "E-Rickshaw", "Van", "Truck", "None"])}
              {renderInput("Delivery Experience", "Delivery Experience", "text", "e.g. 2 years")}
              {renderInput("Areas Covered", "Areas Covered", "text", "e.g. Sector 14, 15")}
              {renderSelect("Base Sector", "Gurugram Sector", SECTORS)}
              {renderInput("Pincode", "Pincode", "text", "122001")}
            </div>
            <div className={`transition-opacity duration-300 ${activeStepConfig.id === "delivery_ops" ? "block opacity-100" : "hidden opacity-0 h-0 overflow-hidden"}`}>
              <h2 className="text-xl font-bold mb-6 border-b pb-2">Operations</h2>
              {renderInput("Daily Deliveries Capability", "Daily Deliveries", "number", "e.g. 40")}
              {renderInput("Preferred Working Hours", "Working Hours", "text", "e.g. 9 AM - 6 PM")}
            </div>
            <div className={`transition-opacity duration-300 ${activeStepConfig.id === "delivery_intelligence" ? "block opacity-100" : "hidden opacity-0 h-0 overflow-hidden"}`}>
              <h2 className="text-xl font-bold mb-6 border-b pb-2">Market Intelligence</h2>
              {renderInput("Biggest Challenges", "Challenges", "text", "e.g. Unpredictable orders")}
              {renderSelect("Interested in Joining IndiaFy?", "Interested in Joining IndiaFy", ["Yes", "Maybe", "No"])}
            </div>

            {/* Navigation Actions */}
            <div className={`mt-8 pt-6 border-t flex items-center justify-between ${currentStep === 0 ? 'justify-end' : ''}`}>
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold transition-colors text-[#212121] hover:bg-gray-100"
                >
                  <ChevronLeft size={18} /> Back
                </button>
              )}
              
              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-[#2874F0] text-white rounded-xl font-bold shadow-md hover:bg-blue-700 transition-colors ml-auto"
                >
                  Next <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.Role}
                  className="flex items-center gap-2 px-8 py-2.5 bg-[#FB641B] text-white rounded-xl font-bold shadow-lg hover:bg-[#e55a18] transition-colors disabled:opacity-70 ml-auto"
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">Submitting...</span>
                  ) : (
                    <>Submit <Send size={18} /></>
                  )}
                </button>
              )}
            </div>
            
          </form>
        </div>
        
        <div className="text-center mt-6 flex items-center justify-center gap-1.5 text-gray-400 text-sm font-medium">
          <Save size={14} /> Draft auto-saved locally
        </div>
      </div>
    </div>
  );
}
