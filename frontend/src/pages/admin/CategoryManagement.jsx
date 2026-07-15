import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Eye, EyeOff, ArrowRight, RefreshCw, AlertTriangle } from 'lucide-react';
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import AdminErrorBoundary from "../../components/admin/AdminErrorBoundary";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Forms state
  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState("");
  const [skuId, setSkuId] = useState("");
  const [parentId, setParentId] = useState("");
  const [visible, setVisible] = useState(true);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/admin/management/categories");
      const raw = res?.data?.categories ?? res?.data ?? res ?? [];
      const safeData = Array.isArray(raw) ? raw : [];
      setCategories(safeData);
    } catch (_err) {
      console.error("Error fetching categories:", _err);
      setError("Failed to load nested categories tree.");
      toast.error("Failed to load nested categories");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!categoryName?.trim() || !skuId?.trim()) {
      toast.error("Name and SKU prefix are required");
      return;
    }

    try {
      await axiosInstance.post("/admin/management/categories", {
        categoryName: categoryName.trim(),
        categoryImage: categoryImage?.trim() || "https://placehold.co/400",
        skuId: skuId.trim(),
        parentId: parentId || null,
        visible,
        seoTitle: seoTitle?.trim() ?? "",
        seoDescription: seoDescription?.trim() ?? "",
        seoKeywords: seoKeywords?.trim() ?? ""
      });

      toast.success("Category node created successfully!");
      setCategoryName("");
      setCategoryImage("");
      setSkuId("");
      setParentId("");
      setSeoTitle("");
      setSeoDescription("");
      setSeoKeywords("");
      fetchCategories();
    } catch (_err) {
      toast.error("Failed to create category");
    }
  };

  const handleToggleVisibility = async (cat) => {
    if (!cat?._id) return;
    try {
      await axiosInstance.put(`/admin/management/categories/${cat._id}`, {
        visible: !cat.visible
      });
      toast.success(`Category visibility updated`);
      fetchCategories();
    } catch (_err) {
      toast.error("Failed to toggle visibility");
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (window.confirm("Are you sure you want to delete this category node?")) {
      try {
        await axiosInstance.delete(`/admin/management/categories/${id}`);
        toast.success("Category deleted");
        fetchCategories();
      } catch (_err) {
        toast.error("Failed to delete category");
      }
    }
  };

  // Safe Tree Builder
  const buildTree = (flatList, pId = null) => {
    if (!Array.isArray(flatList)) return [];
    return flatList
      .filter((node) => {
        if (!node) return false;
        if (pId === null) return !node.parentId;
        return node.parentId === pId;
      })
      .map((node) => ({
        ...node,
        children: buildTree(flatList, node._id),
      }));
  };

  const safeFlatCategories = Array.isArray(categories) ? categories : [];
  const categoryTree = buildTree(safeFlatCategories);

  // Tree item renderer
  const TreeItem = ({ item, depth = 0 }) => {
    if (!item) return null;
    const safeId = item._id || Math.random().toString();
    const cName = item.categoryName ?? "Untitled Category";
    const cSku = item.skuId ?? "N/A";
    const isVisible = item.visible !== false;

    return (
      <div className="space-y-2">
        <div 
          className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl hover:border-[#10B981]/30 hover:bg-slate-100/30 transition-all shadow-xs"
          style={{ marginLeft: `${Math.min(depth * 24, 96)}px` }}
        >
          <div className="flex items-center gap-3">
            {depth > 0 && <ArrowRight size={14} className="text-[#2874F0] shrink-0" />}
            {item.categoryImage ? (
              <img
                src={item.categoryImage}
                alt={cName}
                className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            ) : null}
            <div>
              <p className="font-extrabold text-slate-800 text-xs sm:text-sm">{cName}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">SKU PREFIX: {cSku}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleToggleVisibility(item)}
              className={`p-2 rounded-xl transition ${isVisible ? "text-slate-400 hover:text-slate-600" : "text-[#2874F0] bg-[#10B981]/10"}`}
              title="Toggle visibility"
            >
              {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
            <button 
              onClick={() => handleDelete(item._id)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition"
              title="Delete node"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {Array.isArray(item.children) && item.children.map(child => (
          <TreeItem key={child._id || Math.random()} item={child} depth={depth + 1} />
        ))}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen font-sans" style={{background:"radial-gradient(ellipse at 20% 50%, rgba(40,116,240,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(251,100,27,0.04) 0%, transparent 60%), linear-gradient(135deg, #050811 0%, #080C1A 50%, #050811 100%)"}}>
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 p-4 sm:p-8">
          <div className="max-w-7xl mx-auto space-y-8 pb-20">
            
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#10B981]/10 border border-[#10B981]/25 text-[#2874F0] text-xs font-bold uppercase tracking-widest mb-2">
                  <Layers size={14} /> Unlimited nested levels
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Category Tree</h1>
                <p className="text-slate-500 font-medium">
                  Organize nested categories, allocate drag-and-drop order indexes, and specify localized SEO tags.
                </p>
              </div>

              <button
                onClick={fetchCategories}
                className="flex items-center justify-center gap-2 bg-white border border-slate-200 px-4 py-3 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-xs self-start sm:self-auto"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                Refresh Tree
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
                <button onClick={fetchCategories} className="underline hover:text-red-900">Retry</button>
              </div>
            )}

            {/* Content Grid wrapped in Error Boundary */}
            <AdminErrorBoundary title="Unable to load nested category taxonomy">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Tree Viewer */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="rounded-3xl p-6 min-h-[300px] space-y-3" style={{background:"linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",border:"1px solid rgba(255,255,255,0.07)",boxShadow:"0 0 0 1px rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.4)",backdropFilter:"blur(16px)"}}>
                    <h3 className="font-extrabold text-[#2874F0] text-sm mb-3">Live Taxonomy Tree</h3>
                    {loading ? (
                      <p className="text-xs text-slate-400 text-center py-12">Loading catalog tree...</p>
                    ) : categoryTree.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-12">No categories created yet. Create one on the form.</p>
                    ) : (
                      categoryTree.map(node => (
                        <TreeItem key={node._id || Math.random()} item={node} />
                      ))
                    )}
                  </div>
                </div>

                {/* Right Category Creator Form */}
                <div className="lg:col-span-1">
                  <form onSubmit={handleCreate} className="rounded-3xl p-6 space-y-5" style={{background:"linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",border:"1px solid rgba(255,255,255,0.07)",boxShadow:"0 0 0 1px rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.4)",backdropFilter:"blur(16px)"}}>
                    <h3 className="font-extrabold text-slate-800 text-sm">Add Category Node</h3>
                    
                    <div className="space-y-4 text-xs font-semibold text-slate-700">
                      <div>
                        <label className="block text-slate-400 mb-1">Category Name</label>
                        <input 
                          type="text" 
                          value={categoryName}
                          onChange={(e) => setCategoryName(e.target.value)}
                          placeholder="e.g. Handmade Shawls"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none font-medium text-slate-900 focus:bg-white focus:border-[#10B981]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">SKU ID Prefix</label>
                        <input 
                          type="text" 
                          value={skuId}
                          onChange={(e) => setSkuId(e.target.value)}
                          placeholder="e.g. HW-SHWL"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none font-medium text-slate-900 focus:bg-white focus:border-[#10B981]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Banner Image URL</label>
                        <input 
                          type="text" 
                          value={categoryImage}
                          onChange={(e) => setCategoryImage(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none font-medium text-slate-900 focus:bg-white focus:border-[#10B981]"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Parent Category (None for root)</label>
                        <select 
                          value={parentId}
                          onChange={(e) => setParentId(e.target.value)}
                          className="w-full h-11 px-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl outline-none font-medium"
                        >
                          <option value="">-- Root Node --</option>
                          {safeFlatCategories.map(c => (
                            <option key={c._id} value={c._id}>{c.categoryName ?? "Category"}</option>
                          ))}
                        </select>
                      </div>

                      <hr className="border-slate-100" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#2874F0]">SEO Metadata Settings</p>

                      <div>
                        <label className="block text-slate-400 mb-1">SEO Title Tag</label>
                        <input 
                          type="text" 
                          value={seoTitle}
                          onChange={(e) => setSeoTitle(e.target.value)}
                          placeholder="Meta SEO title"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none font-medium text-slate-900 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Meta Description</label>
                        <textarea 
                          value={seoDescription}
                          onChange={(e) => setSeoDescription(e.target.value)}
                          rows="2"
                          placeholder="Brief listing synopsis for search engines..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none font-medium text-slate-900 focus:bg-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-slate-900 text-white hover:bg-black font-bold rounded-xl text-xs transition active:scale-95 shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Plus size={16} /> Create Node
                    </button>
                  </form>
                </div>

              </div>
            </AdminErrorBoundary>

          </div>
        </main>
      </div>
    </div>
  );
}
