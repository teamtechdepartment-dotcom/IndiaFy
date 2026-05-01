import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Boxes, ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { useProductStore } from '../../store/productStore';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';

export default function Products() {
  const { products, fetchProducts, createProduct, isLoading } = useProductStore();
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: "", 
    sku: "", 
    category: "General", 
    salePrice: "", 
    mrpPrice: "",
    stock: "",
    shortDescription: "",
    description: "",
    weight: "500g"
  });
  
  // NEW: State to hold multiple images (actual file objects)
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Fetch products on mount and every 30s for inventory updates
  useEffect(() => {
    if (user?._id) {
      fetchProducts('', '', user._id);
      
      const interval = setInterval(() => {
        fetchProducts('', '', user._id);
      }, 30000); // 30s refresh
      
      return () => clearInterval(interval);
    }
  }, [user?._id, fetchProducts]);

  // Reset to page 1 when searching
  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  // --- IMAGE UPLOAD LOGIC ---
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file sizes (Max 2MB per file)
    const validFiles = files.filter(f => f.size <= 2 * 1024 * 1024);
    if (validFiles.length < files.length) {
      toast.warning("Some files were skipped because they exceed the 2MB size limit.");
    }

    setNewImageFiles(prev => [...prev, ...validFiles].slice(0, 5));

    // Create previews
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews].slice(0, 5));

    // Reset input
    e.target.value = '';
  };

  const removeImage = (indexToRemove) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== indexToRemove));
    setImagePreviews(prev => {
      // Revoke the URL to avoid memory leaks
      URL.revokeObjectURL(prev[indexToRemove]);
      return prev.filter((_, i) => i !== indexToRemove);
    });
  };

  // --- FORM SUBMISSION ---
  const handleAddProduct = async (e) => {
    if (e) e.preventDefault();
    
    if (newImageFiles.length === 0) {
      toast.error("At least one product image is required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('productName', newProduct.name);
      formData.append('productSkuId', newProduct.sku.toUpperCase());
      formData.append('categoryName', newProduct.category);
      formData.append('shortDescription', newProduct.shortDescription || newProduct.name);
      formData.append('description', newProduct.description || newProduct.name);
      
      const attribute = {
        salePrice: newProduct.salePrice,
        mrpPrice: newProduct.mrpPrice || newProduct.salePrice,
        weight: newProduct.weight,
        quantity: newProduct.stock
      };
      formData.append('attribute', JSON.stringify(attribute));

      // Append all images
      newImageFiles.forEach(file => {
        formData.append('productImage', file);
      });

      await createProduct(formData);
      toast.success("Product created successfully!");
      
      // Reset Everything
      setNewProduct({ 
        name: "", sku: "", category: "General", salePrice: "", 
        mrpPrice: "", stock: "", shortDescription: "", description: "", weight: "500g" 
      });
      setNewImageFiles([]);
      setImagePreviews([]);
      setIsModalOpen(false);
      
      // Refresh list
      fetchProducts('', '', user._id);
    } catch (err) {
      toast.error(err.message || "Failed to create product");
    }
  };

  // Filter & Pagination Logic
  const filteredProducts = products.filter(p => 
    (p.productName || p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.productSkuId || p.sku || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Products <span className="bg-slate-900 text-white text-xs px-2.5 py-1 rounded-full">{filteredProducts.length}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage your storefront catalog.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900/10 outline-none shadow-sm"
            />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-sm w-full sm:w-auto">
            <Plus size={16}/> Add Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        
        {/* MOBILE VIEW (Cards) */}
        <div className="md:hidden divide-y divide-slate-100">
          {currentItems.length > 0 ? currentItems.map((p) => (
            <div key={p._id || p.id} className="p-4 flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                <img src={p.productImage?.[0] || p.image} alt={p.productName || p.name} className="w-full h-full object-cover"/>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 truncate">{p.productName || p.name}</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{p.productSkuId || p.sku}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-slate-900">₹{parseFloat(p.attribute?.salePrice || p.price || 0).toFixed(2)}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide ${
                      (p.status || (p.attribute?.quantity > 10 ? 'Active' : 'Low Stock')) === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>{p.status || (p.attribute?.quantity > 0 ? 'Active' : 'Out of Stock')}</span>
                    <button 
                      onClick={() => {
                        if(window.confirm("Delete this product?")) {
                          useProductStore.getState().deleteProduct(p._id || p.id);
                          toast.success("Product deleted");
                        }
                      }}
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="py-12 text-center text-slate-500"><Boxes size={32} className="mx-auto mb-2 opacity-50"/><p>No products found.</p></div>
          )}
        </div>

        {/* DESKTOP VIEW (Table) */}
        <div className="hidden md:block overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="p-4 text-sm font-bold text-slate-500">Product Name</th>
                <th className="p-4 text-sm font-bold text-slate-500">SKU</th>
                <th className="p-4 text-sm font-bold text-slate-500">Price</th>
                <th className="p-4 text-sm font-bold text-slate-500">Stock</th>
                <th className="p-4 text-sm font-bold text-slate-500">Status</th>
                <th className="p-4 text-sm font-bold text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentItems.length > 0 ? currentItems.map((p) => (
                <tr key={p._id || p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200"><img src={p.productImage?.[0] || p.image} alt={p.productName || p.name} className="w-full h-full object-cover"/></div>
                      <div>
                        <p className="font-bold text-slate-900">{p.productName || p.name}</p>
                        <p className="text-xs font-bold text-slate-500 bg-slate-100 w-fit px-1.5 py-0.5 rounded mt-0.5">{p.subCategoryId?.subCategoryName || p.category || 'General'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-medium text-slate-500">{p.productSkuId || p.sku}</td>
                  <td className="p-4 text-base font-bold text-slate-900">₹{parseFloat(p.attribute?.salePrice || p.price || 0).toFixed(2)}</td>
                  <td className="p-4 text-sm font-bold text-slate-700">{p.attribute?.quantity || p.stock || 0} <span className="text-slate-400 font-medium">units</span></td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md uppercase tracking-wide ${
                      (p.status || 'Active') === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>{p.status || (p.attribute?.quantity > 0 ? 'Active' : 'Out of Stock')}</span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => {
                        if(window.confirm("Delete this product?")) {
                          useProductStore.getState().deleteProduct(p._id || p.id);
                          toast.success("Product deleted");
                        }
                      }}
                      className="text-slate-400 hover:text-red-600 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="py-16 text-center text-slate-500"><Boxes size={32} className="mx-auto mb-3 opacity-50" /><p className="font-bold">No products found.</p></td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FUNCTIONAL PAGINATION */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
          <p className="text-sm text-slate-500 font-medium text-center sm:text-left">
            Showing <span className="font-bold text-slate-900">{filteredProducts.length > 0 ? indexOfFirstItem + 1 : 0}</span> to <span className="font-bold text-slate-900">{Math.min(indexOfLastItem, filteredProducts.length)}</span> of <span className="font-bold text-slate-900">{filteredProducts.length}</span> products
          </p>
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || filteredProducts.length === 0}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all active:scale-95 disabled:active:scale-100"
            >Previous</button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages || filteredProducts.length === 0}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all active:scale-95 disabled:active:scale-100"
            >Next</button>
          </div>
        </div>
      </div>

      {/* --- ADD PRODUCT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative flex flex-col bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50 shrink-0">
              <h2 className="font-bold text-slate-900 text-lg">Add New Product</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-full transition-colors"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleAddProduct} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              {/* --- IMAGE UPLOAD SECTION --- */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Product Images (Max 5)</label>
                
                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {imagePreviews.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 group shadow-sm">
                        <img src={img} alt="preview" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => removeImage(idx)}
                          className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]"
                        >
                          <X size={20} className="text-white" />
                        </button>
                      </div>
                    ))}
                    {/* Plus button to add more if under limit */}
                    {imagePreviews.length < 5 && (
                      <button 
                        type="button" 
                        onClick={() => document.getElementById('product-image-upload').click()}
                        className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all"
                      >
                        <Plus size={24} />
                      </button>
                    )}
                  </div>
                )}

                {/* Big Upload Area (Shows if no images exist) */}
                {imagePreviews.length === 0 && (
                  <div 
                    onClick={() => document.getElementById('product-image-upload').click()}
                    className="w-full py-10 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer group shadow-sm"
                  >
                    <div className="p-4 bg-slate-100 rounded-full group-hover:bg-slate-200 transition-colors mb-3">
                      <ImagePlus size={28} className="text-slate-500 group-hover:text-slate-700" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">Click to upload images</p>
                    <p className="text-xs font-medium mt-1">PNG, JPG up to 2MB (Max 5)</p>
                  </div>
                )}
                
                {/* Hidden File Input */}
                <input 
                  id="product-image-upload" 
                  type="file" 
                  multiple 
                  accept="image/png, image/jpeg, image/jpg" 
                  className="hidden" 
                  onChange={handleImageUpload} 
                />
              </div>

              {/* --- STANDARD FORM FIELDS --- */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Product Name</label>
                  <input required type="text" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium transition-all shadow-sm" placeholder="e.g. Premium Saffron"/>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">SKU ID</label>
                    <input required type="text" value={newProduct.sku} onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium uppercase transition-all shadow-sm" placeholder="IND-SP-001"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                    <select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium cursor-pointer transition-all shadow-sm">
                      <option>Spices</option><option>Grains</option><option>Beverages</option><option>General</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Short Description</label>
                  <input required type="text" value={newProduct.shortDescription} onChange={(e) => setNewProduct({...newProduct, shortDescription: e.target.value})} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium transition-all shadow-sm" placeholder="Brief catchphrase for the product"/>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Sale Price (₹)</label>
                    <input required type="number" min="0" step="0.01" value={newProduct.salePrice} onChange={(e) => setNewProduct({...newProduct, salePrice: e.target.value})} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-bold transition-all shadow-sm" placeholder="0.00"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">MRP Price (₹)</label>
                    <input required type="number" min="0" step="0.01" value={newProduct.mrpPrice} onChange={(e) => setNewProduct({...newProduct, mrpPrice: e.target.value})} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-bold transition-all shadow-sm" placeholder="0.00"/>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Stock Quantity</label>
                    <input required type="number" min="0" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-bold transition-all shadow-sm" placeholder="100"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Weight (e.g. 500g)</label>
                    <input required type="text" value={newProduct.weight} onChange={(e) => setNewProduct({...newProduct, weight: e.target.value})} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium transition-all shadow-sm" placeholder="500g"/>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Description</label>
                  <textarea rows="3" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium transition-all shadow-sm resize-none" placeholder="Detailed product specifications..."></textarea>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-2xl transition-all active:scale-95 shadow-sm">Cancel</button>
                <button type="submit" disabled={isLoading} className="flex-1 py-4 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-2xl shadow-xl shadow-slate-900/20 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2">
                  {isLoading ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : "Save Product"}
                </button>
              </div>
              
              {/* Extra spacing for mobile safari */}
              <div className="h-10 w-full md:hidden shrink-0"></div>
            </form>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #94a3b8; }
      `}} />
    </div>
  );
}
