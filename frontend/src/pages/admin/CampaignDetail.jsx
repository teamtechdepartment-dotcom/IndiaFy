import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Flame,
  Calendar,
  Package,
  Store,
  Power,
  Trash2,
  Edit,
  Plus,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Search,
  X,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";
import Header from "../../components/admin/Header";
import Sidebar from "../../components/admin/Sidebar";
import StatsCard from "../../components/admin/StatsCard";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [removingProductId, setRemovingProductId] = useState(null);
  const [searchFilter, setSearchFilter] = useState("");

  // Add more products modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [eligibleProducts, setEligibleProducts] = useState([]);
  const [modalSearch, setModalSearch] = useState("");
  const [modalSelected, setModalSelected] = useState(new Set());
  const [modalLoading, setModalLoading] = useState(false);
  const [addingProducts, setAddingProducts] = useState(false);

  const fetchCampaign = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/admin/management/campaigns/${id}`);
      const data = res?.data?.data || res?.data || res;
      setCampaign(data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load campaign details");
      navigate("/admin/campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!campaign) return;
    setToggling(true);
    const nextStatus = campaign.status === "active" ? "disabled" : "active";

    try {
      const res = await axiosInstance.patch(`/admin/management/campaigns/${id}/status`, {
        status: nextStatus,
      });
      toast.success(res.data?.message || "Status updated");
      fetchCampaign();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to toggle status");
    } finally {
      setToggling(false);
    }
  };

  const handleRemoveProduct = async (productId, productName) => {
    if (window.confirm(`Remove "${productName}" from this campaign?`)) {
      setRemovingProductId(productId);
      try {
        await axiosInstance.delete(`/admin/management/campaigns/${id}/products/${productId}`);
        toast.success(`Removed "${productName}" from campaign`);
        setCampaign((prev) => ({
          ...prev,
          products: prev.products.filter((p) => String(p.productId) !== String(productId)),
          productCount: Math.max(0, (prev.productCount || 1) - 1),
        }));
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to remove product");
      } finally {
        setRemovingProductId(null);
      }
    }
  };

  // Open add products modal
  const openAddModal = async () => {
    setShowAddModal(true);
    setModalLoading(true);
    setModalSelected(new Set());
    try {
      const res = await axiosInstance.get("/admin/management/campaigns/products/eligible", {
        params: {
          search: modalSearch,
          discountValue: campaign?.discountValue || 10,
          discountType: campaign?.discountType || "percentage",
          limit: 100,
        },
      });
      const rawProducts = res?.data?.products !== undefined ? res.data.products : (res?.data?.data?.products || res?.products || []);
      const existingIds = new Set((campaign?.products || []).map((p) => String(p.productId?._id || p.productId)));
      const filtered = (rawProducts || []).filter(
        (p) => !existingIds.has(String(p._id))
      );
      setEligibleProducts(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleAddSelectedProducts = async () => {
    if (modalSelected.size === 0) return;
    setAddingProducts(true);
    try {
      const productsPayload = Array.from(modalSelected).map((pId) => {
        const pObj = eligibleProducts.find((p) => String(p._id) === String(pId));
        return {
          productId: pId,
          sellerId: pObj?.sellerId,
        };
      });

      await axiosInstance.post(`/admin/management/campaigns/${id}/products`, {
        products: productsPayload,
      });

      toast.success(`${productsPayload.length} product(s) added!`);
      setShowAddModal(false);
      fetchCampaign();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add products");
    } finally {
      setAddingProducts(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <RefreshCw size={32} className="animate-spin text-[#2874F0]" />
      </div>
    );
  }

  if (!campaign) return null;

  const effectiveStatus = campaign.effectiveStatus || campaign.status;
  const isLive = effectiveStatus === "active";

  const displayedProducts = (campaign.products || []).filter((p) => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return (
      p.productName?.toLowerCase().includes(q) ||
      p.sellerName?.toLowerCase().includes(q) ||
      p.categoryName?.toLowerCase().includes(q) ||
      p.productSkuId?.toLowerCase().includes(q)
    );
  });

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
          {/* TOP BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/admin/campaigns")}
                className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {campaign.name}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                      isLive
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : effectiveStatus === "scheduled"
                        ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                        : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                    }`}
                  >
                    {effectiveStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {campaign.description || "No promotional description provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleStatus}
                disabled={toggling}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer disabled:opacity-50 border ${
                  isLive
                    ? "bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20"
                    : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"
                }`}
              >
                <Power size={14} className={toggling ? "animate-spin" : ""} />
                {isLive ? "Disable Campaign" : "Activate Campaign"}
              </button>

              <Link
                to={`/campaign/${id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 rounded-2xl text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition cursor-pointer"
              >
                <ExternalLink size={14} />
                View Live Sale
              </Link>

              <Link
                to={`/admin/campaigns/${id}/edit`}
                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer"
              >
                <Edit size={14} />
                Edit
              </Link>
            </div>
          </div>

          {/* BANNER PREVIEW / UPLOAD PROMPT */}
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ImageIcon size={16} className="text-slate-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Campaign Banner Image
                </h3>
              </div>
              <Link
                to={`/admin/campaigns/${id}/edit`}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                {campaign.bannerImage ? "Change Banner" : "+ Add Banner"}
              </Link>
            </div>
            {campaign.bannerImage ? (
              <div className="relative rounded-2xl overflow-hidden aspect-[21/7] max-h-56 w-full border border-slate-200 dark:border-slate-800 shadow-inner bg-slate-950">
                <img
                  src={campaign.bannerImage}
                  alt={campaign.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider mb-1">
                      {campaign.badgeText || "Sale"}
                    </span>
                    <h4 className="text-white text-base font-black drop-shadow">{campaign.name}</h4>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-6 text-center space-y-2">
                <p className="text-xs font-bold text-slate-500">No banner image uploaded yet</p>
                <p className="text-[11px] text-slate-400">
                  A banner makes the campaign page visually attractive and also highlights it on the homepage carousel.
                </p>
                <Link
                  to={`/admin/campaigns/${id}/edit`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2874F0] text-white text-xs font-bold rounded-xl hover:bg-[#1a5bbf] transition cursor-pointer"
                >
                  <Plus size={14} /> Add Campaign Banner
                </Link>
              </div>
            )}
          </div>

          {/* STATS OVERVIEW */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Discount Rate"
              value={`${campaign.discountValue}% OFF`}
              accent="orange"
              icon={<Flame size={18} />}
            />
            <StatsCard
              title="Products Enrolled"
              value={(campaign.productCount || campaign.products?.length || 0).toString()}
              accent="blue"
              icon={<Package size={18} />}
            />
            <StatsCard
              title="Sellers Participating"
              value={(campaign.sellerCount || 0).toString()}
              accent="purple"
              icon={<Store size={18} />}
            />
            <StatsCard
              title="Campaign Period"
              value={formatDate(campaign.startDate).split(",")[0]}
              accent="green"
              icon={<Calendar size={18} />}
            />
          </div>

          {/* PARTICIPATING PRODUCTS TABLE */}
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl shadow-xl overflow-hidden space-y-4 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  Participating Seller Products ({campaign.products?.length || 0})
                </h2>
                <p className="text-xs text-slate-400">
                  Manage individual product inclusion, monitor discounts, and inspect effective sale prices
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative min-w-[220px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter products..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#2874F0]"
                  />
                </div>

                <button
                  onClick={openAddModal}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#2874F0] text-white rounded-xl text-xs font-bold hover:bg-[#1a5bbf] transition cursor-pointer"
                >
                  <Plus size={14} /> Add Products
                </button>
              </div>
            </div>

            {displayedProducts.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                No products found. Use "Add Products" above to enroll seller products.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800/60 text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-slate-950/30">
                      <th className="p-3 pl-4">Product</th>
                      <th className="p-3">Seller</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Original Price</th>
                      <th className="p-3">Discount</th>
                      <th className="p-3 font-black text-slate-900 dark:text-white">Customer Sale Price</th>
                      <th className="p-3 pr-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                    {displayedProducts.map((p) => (
                      <tr
                        key={p.productId}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="p-3 pl-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                              <img
                                src={p.thumbnail || "https://ui-avatars.com/api/?name=P&size=80"}
                                alt={p.productName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 dark:text-white block truncate max-w-[220px]">
                                {p.productName}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                SKU: {p.productSkuId || "N/A"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-[140px]">
                            {p.sellerBusinessName || p.sellerName}
                          </span>
                        </td>

                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-400">
                            {p.categoryName || "General"}
                          </span>
                        </td>

                        <td className="p-3">
                          <span className="font-bold text-slate-500 line-through">
                            ₹{p.originalPrice?.toLocaleString("en-IN")}
                          </span>
                        </td>

                        <td className="p-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400">
                            -{campaign.discountValue}%
                          </span>
                        </td>

                        <td className="p-3">
                          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                            ₹{p.salePrice?.toLocaleString("en-IN")}
                          </span>
                        </td>

                        <td className="p-3 pr-4 text-right">
                          <button
                            onClick={() => handleRemoveProduct(p.productId, p.productName)}
                            disabled={removingProductId === p.productId}
                            title="Remove from campaign"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
                          >
                            <Trash2 size={14} className={removingProductId === p.productId ? "animate-spin" : ""} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ADD PRODUCTS MODAL */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-[#2874F0]">
                      <Package size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        Add Products to Campaign
                      </h3>
                      <p className="text-xs text-slate-400">
                        Select eligible seller products to enroll into "{campaign.name}"
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="relative">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search eligible products..."
                      value={modalSearch}
                      onChange={(e) => setModalSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#2874F0]"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {modalLoading ? (
                    <div className="p-12 text-center">
                      <RefreshCw size={24} className="animate-spin mx-auto text-[#2874F0]" />
                    </div>
                  ) : eligibleProducts.length === 0 ? (
                    <div className="p-12 text-center text-xs text-slate-400">
                      All eligible products are already enrolled or none matched the search.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {eligibleProducts.map((prod) => {
                        const isChecked = modalSelected.has(String(prod._id));
                        return (
                          <div
                            key={prod._id}
                            onClick={() => {
                              setModalSelected((prev) => {
                                const next = new Set(prev);
                                if (next.has(String(prod._id))) next.delete(String(prod._id));
                                else next.add(String(prod._id));
                                return next;
                              });
                            }}
                            className={`flex items-center justify-between p-3 rounded-2xl border transition cursor-pointer ${
                              isChecked
                                ? "bg-blue-500/10 border-[#2874F0]"
                                : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="w-4 h-4 rounded text-[#2874F0] cursor-pointer"
                              />
                              <div className="min-w-0">
                                <span className="font-bold text-xs text-slate-900 dark:text-white block truncate max-w-[280px]">
                                  {prod.productName}
                                </span>
                                <span className="text-[10px] text-slate-400 block">
                                  {prod.sellerBusinessName || prod.sellerName} • {prod.categoryName}
                                </span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">
                                ₹{prod.salePrice?.toLocaleString("en-IN")}
                              </span>
                              <span className="text-[10px] text-slate-400 line-through">
                                ₹{prod.originalPrice?.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">
                    {modalSelected.size} products selected
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={modalSelected.size === 0 || addingProducts}
                      onClick={handleAddSelectedProducts}
                      className="px-5 py-2 bg-[#2874F0] text-white rounded-xl text-xs font-black hover:bg-[#1a5bbf] transition cursor-pointer disabled:opacity-50"
                    >
                      {addingProducts ? "Adding..." : "Add to Campaign"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
