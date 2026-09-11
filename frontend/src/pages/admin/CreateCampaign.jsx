import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Flame,
  Search,
  Check,
  Package,
  Store,
  Layers,
  Calendar,
  Sparkles,
  RefreshCw,
  X,
  AlertCircle,
  HelpCircle,
  UploadCloud,
  Image as ImageIcon,
} from "lucide-react";
import Header from "../../components/admin/Header";
import Sidebar from "../../components/admin/Sidebar";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

const BANNER_PRESETS = [
  {
    title: "Diwali Festive",
    url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=2000&auto=format&fit=crop",
  },
  {
    title: "Electronics Mega",
    url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop",
  },
  {
    title: "Fashion Deals",
    url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
  },
  {
    title: "Grocery Mart",
    url: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop",
  }
];

export default function CreateCampaign() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  // Campaign Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState(10);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [badgeText, setBadgeText] = useState("Mega Sale");
  const [status, setStatus] = useState("active");
  const [bannerImage, setBannerImage] = useState("");

  // Selected Products Map: Map<productId, { productId, sellerId, productName, originalPrice, salePrice }>
  const [selectedMap, setSelectedMap] = useState(new Map());

  // Product Selector State
  const [eligibleProducts, setEligibleProducts] = useState([]);
  const [sellersList, setSellersList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sellerFilter, setSellerFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [productsLoading, setProductsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  // Load existing campaign data if in edit mode
  useEffect(() => {
    if (isEdit) {
      const loadCampaign = async () => {
        try {
          const res = await axiosInstance.get(`/admin/management/campaigns/${id}`);
          const c = res?.data?.data || res?.data || res;
          if (c) {
            setName(c.name || "");
            setDescription(c.description || "");
            setDiscountType(c.discountType || "percentage");
            setDiscountValue(c.discountValue || 10);
            if (c.startDate) setStartDate(new Date(c.startDate).toISOString().slice(0, 16));
            if (c.endDate) setEndDate(new Date(c.endDate).toISOString().slice(0, 16));
            setBadgeText(c.badgeText || "Mega Sale");
            setStatus(c.status || "active");
            if (c.bannerImage) setBannerImage(c.bannerImage);

            // Populate selected map
            const newMap = new Map();
            (c.products || []).forEach((p) => {
              const pId = p.productId?._id || p.productId;
              const sId = p.sellerId?._id || p.sellerId;
              if (pId) {
                newMap.set(String(pId), {
                  productId: pId,
                  sellerId: sId,
                  productName: p.productName || "Selected Product",
                  originalPrice: p.originalPrice || 0,
                  salePrice: p.salePrice || 0,
                });
              }
            });
            setSelectedMap(newMap);
          }
        } catch (err) {
          toast.error("Failed to load campaign for editing");
          navigate("/admin/campaigns");
        } finally {
          setInitialLoading(false);
        }
      };
      loadCampaign();
    }
  }, [id, isEdit, navigate]);

  // Fetch eligible seller products
  const fetchEligibleProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await axiosInstance.get(
        "/admin/management/campaigns/products/eligible",
        {
          params: {
            search: searchQuery,
            sellerId: sellerFilter,
            categoryName: categoryFilter,
            discountValue,
            discountType,
            page,
            limit: 50,
          },
        }
      );
      const data = res?.data?.products !== undefined ? res.data : (res?.data?.data || res || {});
      if (data) {
        setEligibleProducts(data.products || []);
        if (data.sellers && data.sellers.length > 0) setSellersList(data.sellers);
        if (data.categories && data.categories.length > 0) setCategoriesList(data.categories);
        if (data.pagination?.pages) setTotalPages(data.pagination.pages);
      }
    } catch (err) {
      console.error("Failed to fetch eligible products:", err);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEligibleProducts();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, sellerFilter, categoryFilter, discountValue, discountType, page]);

  // Toggle single product selection
  const toggleSelect = (prod) => {
    setSelectedMap((prev) => {
      const next = new Map(prev);
      const key = String(prod._id);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.set(key, {
          productId: prod._id,
          sellerId: prod.sellerId,
          productName: prod.productName,
          originalPrice: prod.originalPrice,
          salePrice: prod.salePrice,
          thumbnail: prod.thumbnail,
        });
      }
      return next;
    });
  };

  // Select all visible on current page
  const selectAllVisible = () => {
    setSelectedMap((prev) => {
      const next = new Map(prev);
      eligibleProducts.forEach((prod) => {
        next.set(String(prod._id), {
          productId: prod._id,
          sellerId: prod.sellerId,
          productName: prod.productName,
          originalPrice: prod.originalPrice,
          salePrice: prod.salePrice,
          thumbnail: prod.thumbnail,
        });
      });
      return next;
    });
  };

  // Deselect all visible on current page
  const deselectAllVisible = () => {
    setSelectedMap((prev) => {
      const next = new Map(prev);
      eligibleProducts.forEach((prod) => {
        next.delete(String(prod._id));
      });
      return next;
    });
  };

  // Clear all selections
  const clearAllSelected = () => {
    setSelectedMap(new Map());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      return toast.error("Campaign name is required");
    }

    const numDiscount = Number(discountValue);
    if (isNaN(numDiscount) || numDiscount <= 0 || numDiscount > 100) {
      return toast.error("Discount percentage must be between 1 and 100");
    }

    if (new Date(endDate) <= new Date(startDate)) {
      return toast.error("End date must be strictly after start date");
    }

    if (selectedMap.size === 0) {
      if (!window.confirm("No products are selected for this campaign yet. Do you want to save it as draft without products?")) {
        return;
      }
    }

    setSubmitting(true);

    const payload = {
      name: name.trim(),
      description: description.trim(),
      discountType,
      discountValue: numDiscount,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      badgeText: badgeText.trim() || "Sale",
      bannerImage: bannerImage.trim(),
      status,
      products: Array.from(selectedMap.values()).map((p) => ({
        productId: p.productId,
        sellerId: p.sellerId,
      })),
    };

    try {
      if (isEdit) {
        await axiosInstance.put(`/admin/management/campaigns/${id}`, payload);
        toast.success(`Campaign "${name}" updated successfully!`);
      } else {
        await axiosInstance.post("/admin/management/campaigns", payload);
        toast.success(`Campaign "${name}" created successfully!`);
      }
      navigate("/admin/campaigns");
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Failed to save campaign");
    } finally {
      setSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <RefreshCw size={32} className="animate-spin text-[#2874F0]" />
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen text-slate-900 dark:text-slate-100"
      style={{
        background:
          "radial-gradient(ellipse at 20% 50%, rgba(40,116,240,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(251,100,27,0.04) 0%, transparent 60%), linear-gradient(135deg, #050811 0%, #080C1A 50%, #050811 100%)",
      }}
    >
      <Sidebar />

      <div className="admin-main flex-1 flex flex-col min-h-screen">
        <Header />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto w-full">
          {/* HEADER NAVIGATION */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/admin/campaigns")}
                className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {isEdit ? "Edit Campaign" : "Create Promotional Campaign"}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure promotional campaign rules and select participating seller products
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/admin/campaigns")}
                className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#2874F0] to-[#1a5bbf] text-white rounded-2xl text-xs font-black shadow-lg shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer disabled:opacity-50"
              >
                <Check size={16} />
                {submitting ? "Saving..." : isEdit ? "Update Campaign" : "Publish Campaign"}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* TOP GRID: CAMPAIGN CONFIGURATION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Essential Details */}
              <div className="lg:col-span-2 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-[#2874F0]">
                    <Flame size={18} />
                  </div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    1. Campaign Details
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Campaign Name */}
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5 block">
                      Campaign Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Big Billion Days, Diwali Mega Sale"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#2874F0]"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5 block">
                      Description / Marketing Copy
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Brief description of the promotional event for customers and audit logs"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#2874F0]"
                    />
                  </div>

                  {/* Discount Configuration */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5 block">
                        Discount Type
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setDiscountType("percentage")}
                          className={`flex-1 py-2.5 rounded-xl border text-xs font-black transition cursor-pointer ${
                            discountType === "percentage"
                              ? "bg-[#2874F0] text-white border-[#2874F0] shadow-sm"
                              : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          Percentage (%)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5 block">
                        Discount Value <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          required
                          min={1}
                          max={100}
                          step={1}
                          value={discountValue}
                          onChange={(e) => setDiscountValue(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-black text-slate-900 dark:text-white focus:outline-none focus:border-[#2874F0]"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm">
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5 block">
                        Start Date & Time <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#2874F0]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5 block">
                        End Date & Time <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#2874F0]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Display & Status Rules */}
              <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                    <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                      <Sparkles size={18} />
                    </div>
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      2. Presentation & State
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {/* Badge Text */}
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5 block">
                        Storefront Badge Text
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. BBD Deal, Special Offer"
                        value={badgeText}
                        onChange={(e) => setBadgeText(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#2874F0]"
                      />
                    </div>

                    {/* Campaign Banner Image Upload */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
                          Campaign Hero Banner
                        </label>
                        <span className="text-[10px] text-slate-400 font-semibold">Hero Slider & Sale Page</span>
                      </div>

                      {bannerImage ? (
                        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-[21/9] bg-slate-900 group shadow-md">
                          <img
                            src={bannerImage}
                            alt="Campaign Banner Preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setBannerImage("")}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition flex items-center gap-1.5"
                            >
                              <X size={14} /> Remove Banner
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#2874F0] dark:hover:border-[#2874F0] rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition bg-slate-50/70 dark:bg-slate-950/70 hover:bg-blue-50/20">
                            <div className="p-2 rounded-full bg-blue-500/10 text-[#2874F0]">
                              <UploadCloud size={20} />
                            </div>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                              Upload Banner from Computer
                            </span>
                            <span className="text-[10px] text-slate-400">
                              JPG, PNG or WEBP (Max 5MB)
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (file.size > 5 * 1024 * 1024) {
                                    return toast.error("Image file must be less than 5MB");
                                  }
                                  const reader = new FileReader();
                                  reader.onload = () => setBannerImage(reader.result);
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>

                          <input
                            type="url"
                            placeholder="Or paste banner image URL..."
                            value={bannerImage}
                            onChange={(e) => setBannerImage(e.target.value)}
                            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#2874F0]"
                          />

                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block mb-1.5">
                              Or choose high-res curated festive preset:
                            </span>
                            <div className="grid grid-cols-4 gap-1.5">
                              {BANNER_PRESETS.map((preset, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setBannerImage(preset.url)}
                                  className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 aspect-[16/9] hover:ring-2 hover:ring-[#2874F0] cursor-pointer group shadow-sm"
                                  title={preset.title}
                                >
                                  <img src={preset.url} alt={preset.title} className="w-full h-full object-cover" />
                                  <span className="absolute inset-x-0 bottom-0 bg-black/70 text-[8px] text-white font-bold truncate px-1 py-0.5 text-center">
                                    {preset.title}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Status */}
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5 block">
                        Initial Activation Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#2874F0]"
                      >
                        <option value="active">Active (Enable Discounts)</option>
                        <option value="draft">Draft (Save for Review)</option>
                        <option value="disabled">Disabled (Pause)</option>
                      </select>
                    </div>

                    {/* Non-Destructive Price Notice */}
                    <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-black text-[#2874F0]">
                        <Check size={14} />
                        Non-Destructive Guarantee
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        Seller base prices will remain untouched in the database. When the campaign finishes, prices automatically revert to original values.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Selected Counter Box */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Selected Products
                      </span>
                      <span className="text-xl font-black text-slate-900 dark:text-white">
                        {selectedMap.size} Products
                      </span>
                    </div>
                    {selectedMap.size > 0 && (
                      <button
                        type="button"
                        onClick={clearAllSelected}
                        className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: PRODUCT SELECTOR TABLE */}
            <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                    <Package size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      3. Select Participating Products ({selectedMap.size} Selected)
                    </h2>
                    <p className="text-xs text-slate-400">
                      Browse seller catalog, preview calculated sale price, and toggle inclusion
                    </p>
                  </div>
                </div>

                {/* Bulk selection shortcuts */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAllVisible}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Select Visible
                  </button>
                  <button
                    type="button"
                    onClick={deselectAllVisible}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Deselect Visible
                  </button>
                </div>
              </div>

              {/* FILTERS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Search */}
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Search product or SKU..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2874F0]"
                  />
                </div>

                {/* Filter by Seller */}
                <div>
                  <select
                    value={sellerFilter}
                    onChange={(e) => {
                      setSellerFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2874F0]"
                  >
                    <option value="">All Sellers</option>
                    {sellersList.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name || s.businessName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter by Category */}
                <div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => {
                      setCategoryFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2874F0]"
                  >
                    <option value="">All Categories</option>
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* PRODUCTS SELECTOR TABLE */}
              <div className="overflow-x-auto border border-slate-200/60 dark:border-slate-800/60 rounded-2xl">
                {productsLoading ? (
                  <div className="p-12 text-center space-y-2">
                    <RefreshCw size={24} className="animate-spin mx-auto text-[#2874F0]" />
                    <p className="text-xs font-bold text-slate-400">Loading catalog items...</p>
                  </div>
                ) : eligibleProducts.length === 0 ? (
                  <div className="p-12 text-center text-xs text-slate-400">
                    No active products found matching your filters.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800/60 text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-slate-950/30">
                        <th className="p-3 pl-4 w-10 text-center">✓</th>
                        <th className="p-3">Product</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Seller</th>
                        <th className="p-3">Original Price</th>
                        <th className="p-3">Discount</th>
                        <th className="p-3 pr-4 font-black text-slate-900 dark:text-white">Sale Price Preview</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                      {eligibleProducts.map((prod) => {
                        const isSelected = selectedMap.has(String(prod._id));
                        return (
                          <tr
                            key={prod._id}
                            onClick={() => toggleSelect(prod)}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-blue-500/10 hover:bg-blue-500/15 dark:bg-blue-500/10"
                                : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                            }`}
                          >
                            <td className="p-3 pl-4 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}} // handled by row click
                                className="w-4 h-4 rounded text-[#2874F0] border-slate-300 focus:ring-0 cursor-pointer"
                              />
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                                  <img
                                    src={
                                      prod.thumbnail ||
                                      "https://ui-avatars.com/api/?name=P&size=80"
                                    }
                                    alt={prod.productName}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <span className="font-bold text-slate-900 dark:text-white block truncate max-w-[200px]">
                                    {prod.productName}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-400 block">
                                    SKU: {prod.productSkuId || "N/A"}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-400">
                                {prod.categoryName}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-[150px]">
                                {prod.sellerBusinessName || prod.sellerName}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="font-bold text-slate-500 line-through">
                                ₹{prod.originalPrice?.toLocaleString("en-IN")}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400">
                                -{discountValue}%
                              </span>
                            </td>
                            <td className="p-3 pr-4">
                              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                                ₹{prod.salePrice?.toLocaleString("en-IN")}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-400">
                    Page {page} of {totalPages}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold disabled:opacity-50 cursor-pointer"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold disabled:opacity-50 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
