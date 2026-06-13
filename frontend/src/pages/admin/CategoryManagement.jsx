import React, { useState, useEffect } from 'react';
import { Layers, Plus, Save, Trash2, Eye, EyeOff, Search, Settings, HelpCircle, ArrowRight } from 'lucide-react';
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
    try {
      const res = await axiosInstance.get("/admin/management/categories");
      const data = res.data || res;
      setCategories(data || []);
    } catch (err) {
      toast.error("Failed to load nested categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!categoryName || !skuId) {
      toast.error("Name and SKU prefix are required");
      return;
    }

    try {
      await axiosInstance.post("/admin/management/categories", {
        categoryName,
        categoryImage: categoryImage || "https://placehold.co/400",
        skuId,
        parentId: parentId || null,
        visible,
        seoTitle,
        seoDescription,
        seoKeywords
      });

      toast.success("Category node created successfully!");
      // Reset basic values
      setCategoryName("");
      setCategoryImage("");
      setSkuId("");
      setParentId("");
      setSeoTitle("");
      setSeoDescription("");
      setSeoKeywords("");
      fetchCategories();
    } catch (err) {
      toast.error("Failed to create category");
    }
  };

  const handleToggleVisibility = async (cat) => {
    try {
      await axiosInstance.put(`/admin/management/categories/${cat._id}`, {
        visible: !cat.visible
      });
      toast.success(`Category visibility set to ${!cat.visible}`);
      fetchCategories();
    } catch (err) {
      toast.error("Failed to toggle visibility");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category? All child items might become orphaned.")) {
      try {
        await axiosInstance.delete(`/admin/management/categories/${id}`);
        toast.success("Category deleted");
        fetchCategories();
      } catch (err) {
        toast.error("Failed to delete category");
      }
    }
  };

  // Build a tree view from flat categories array
  const buildTree = (flatList, parentId = null) => {
    return flatList
      .filter(node => {
        if (parentId === null) return !node.parentId;
        return node.parentId === parentId;
      })
      .map(node => ({
        ...node,
        children: buildTree(flatList, node._id)
      }));
  };

  const categoryTree = buildTree(categories);

  // Recursive tree renderer component
  const TreeItem = ({ item, depth = 0 }) => {
    return (
      <div className="space-y-2">
        <div 
          className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl hover:border-[#10B981]/30 hover:bg-slate-100/30 transition-all shadow-xs"
          style={{ marginLeft: `${depth * 24}px` }}
        >
          <div className="flex items-center gap-3">
            {depth > 0 && <ArrowRight size={14} className="text-[#10B981]" />}
            {item.categoryImage && (
              <img src={item.categoryImage} alt={item.categoryName} className="w-8 h-8 rounded-lg object-cover border border-slate-200" />
            )}
            <div>
              <p className="font-extrabold text-slate-800 text-xs sm:text-sm">{item.categoryName}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">SKU PREFIX: {item.skuId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleToggleVisibility(item)}
              className={`p-2 rounded-xl transition ${item.visible ? "text-slate-400 hover:text-slate-600" : "text-[#10B981] bg-[#10B981]/10"}`}
              title="Toggle visibility"
            >
              {item.visible ? <Eye size={16} /> : <EyeOff size={16} />}
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

        {item.children?.map(child => (
          <TreeItem key={child._id} item={child} depth={depth + 1} />
        ))}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-hero-gradient text-slate-800 font-sans selection:bg-[#10B981] selection:text-white relative overflow-hidden">
      <Sidebar />

      {/* Decorative Blur Blobs */}
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-emerald-100/30 to-teal-100/10 rounded-full blur-3xl -z-0 pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-100/20 to-indigo-100/5 rounded-full blur-3xl -z-0 pointer-events-none" aria-hidden="true" />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        <Header />

        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8">
          <div className="max-w-7xl mx-auto space-y-8 pb-20">
            
            {/* Page Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#10B981]/10 border border-[#10B981]/25 text-[#10B981] text-xs font-bold uppercase tracking-widest mb-2">
                <Layers size={14} /> Unlimited nested levels
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Category tree</h1>
              <p className="text-slate-500 font-medium">
                Organize nested categories, allocate drag-and-drop order indexes, and specify localized SEO tags.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Tree Viewer */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-5 min-h-[300px] space-y-3 shadow-md">
                  <h3 className="font-extrabold text-[#10B981] text-sm mb-3">Live Taxonomy Tree</h3>
                  {loading ? (
                    <p className="text-xs text-gray-400 text-center py-10">Loading catalog tree...</p>
                  ) : categoryTree.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-10">No categories created yet. Create one on the right form.</p>
                  ) : (
                    categoryTree.map(node => (
                      <TreeItem key={node._id} item={node} />
                    ))
                  )}
                </div>
              </div>

              {/* Right Category Creator Form */}
              <div className="lg:col-span-1">
                <form onSubmit={handleCreate} className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 shadow-md space-y-5">
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
                        className="w-full h-11 px-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl outline-none"
                      >
                        <option value="">-- Root Node --</option>
                        {categories.map(c => (
                          <option key={c._id} value={c._id}>{c.categoryName}</option>
                        ))}
                      </select>
                    </div>

                    <hr className="border-slate-100" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#10B981]">SEO Metadata Settings</p>

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
                        placeholder="Brief listing synopsis for index search engines..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none font-medium text-slate-900 focus:bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-[#10B981] text-white hover:opacity-90 font-bold rounded-xl text-xs transition active:scale-95 shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5"
                  >
                    <Plus size={16} className="text-white" /> Create Node
                  </button>
                </form>
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
