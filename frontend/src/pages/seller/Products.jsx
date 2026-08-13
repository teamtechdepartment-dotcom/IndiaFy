import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';
import { 
  Search, Plus, X, Boxes, ImagePlus, Loader2, Trash2, Eye, Edit2, 
  Tag, CheckCircle2, AlertTriangle, XCircle, Award, Flame, Filter, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { useProductStore } from '../../store/productStore';
import { useSellerAuthStore } from '../../store/sellerAuthStore';
import { useNodeStore } from '../../store/nodeStore';
import { toast } from 'react-toastify';

export default function Products() {
  const { nodeId: paramNodeId } = useParams();
  const { activeNode } = useNodeStore();
  const { products, fetchProducts, createProduct, updateProduct, deleteProduct, isLoading } = useProductStore();
  const { user } = useSellerAuthStore();
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  // Selected products for view / edit
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Filters, Search & Sorting States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedStockStatus, setSelectedStockStatus] = useState("All");
  const [selectedBadge, setSelectedBadge] = useState("All");
  const [sortBy, setSortBy] = useState("default");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Body Scroll Lock side-effect
  const anyModalOpen = isModalOpen || isEditModalOpen || isViewModalOpen;
  useEffect(() => {
    if (anyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [anyModalOpen]);

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: "", 
    sku: "", 
    category: "Grocery", 
    brand: "",
    barcode: "",
    hsnCode: "",
    salePrice: "", 
    mrpPrice: "",
    stock: "",
    shortDescription: "",
    description: "",
    weight: "500g",
    unit: "pcs",
    isFeatured: false,
    isBestseller: false
  });

  // Image Upload State for Create Form
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);


  // Image URL state for Edit Form
  const [editImageUrls, setEditImageUrls] = useState("");

  // Fetch products on mount and every 30s for inventory updates
  useEffect(() => {
    const currentNodeId = activeNode?._id || paramNodeId;
    const currentNodeType = activeNode?.nodeType || '';
    if (user?._id && currentNodeId) {
      fetchProducts('', '', user._id, currentNodeType, currentNodeId);
    }
  }, [user?._id, activeNode?._id, activeNode?.nodeType, paramNodeId, fetchProducts]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedBrand, selectedStockStatus, selectedBadge, sortBy]);

  // Extract unique brands & categories dynamically from products list
  const uniqueBrands = ["All", ...new Set(products.map(p => p.brand).filter(Boolean))];
  const categoriesList = ["All", ...new Set(products.map(p => p.categoryName).filter(Boolean))];

  // --- IMAGE UPLOAD LOGIC ---
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(f => f.size <= 2 * 1024 * 1024);
    if (validFiles.length < files.length) {
      toast.warning("Some files were skipped because they exceed the 2MB size limit.");
    }
    setNewImageFiles(prev => [...prev, ...validFiles].slice(0, 5));
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews].slice(0, 5));
    e.target.value = '';
  };

  const removeImage = (indexToRemove) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== indexToRemove));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[indexToRemove]);
      return prev.filter((_, i) => i !== indexToRemove);
    });
  };



  // --- FORM SUBMISSIONS ---
  const handleAddProduct = async (e) => {
    if (e) e.preventDefault();

    const targetNodeId = activeNode?._id || paramNodeId;
    const targetNodeType = activeNode?.nodeType || 'HOME_ESSENTIALS';

    // Validate required fields
    if (!newProduct.name?.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!newProduct.salePrice || Number(newProduct.salePrice) <= 0) {
      toast.error("Selling price is required");
      return;
    }
    if (!newProduct.stock || Number(newProduct.stock) <= 0) {
      toast.error("Stock quantity is required");
      return;
    }
    if (!targetNodeId) {
      toast.error("No active store node found. Please go back to Seller Hub and select a node.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('productName', newProduct.name.trim());
      formData.append('productSkuId', (newProduct.sku || `SKU-${Date.now()}`).toUpperCase());
      formData.append('categoryName', newProduct.category || 'Grocery');
      formData.append('brand', newProduct.brand || '');
      formData.append('barcode', newProduct.barcode || `890${Math.floor(100000000 + Math.random() * 900000000)}`);
      formData.append('hsnCode', newProduct.hsnCode || "00000000");
      formData.append('shortDescription', newProduct.shortDescription || newProduct.name.trim());
      formData.append('description', newProduct.description || newProduct.name.trim());
      formData.append('unit', newProduct.unit || 'pcs');
      formData.append('isFeatured', newProduct.isFeatured ? 'true' : 'false');
      formData.append('isBestseller', newProduct.isBestseller ? 'true' : 'false');
      formData.append('stock', String(newProduct.stock));
      
      formData.append('nodeType', targetNodeType);
      formData.append('nodeId', targetNodeId);
      
      const attribute = {
        salePrice: Number(newProduct.salePrice),
        mrpPrice: Number(newProduct.mrpPrice) || Number(newProduct.salePrice),
        weight: newProduct.weight || "500g",
        quantity: String(newProduct.stock)
      };
      formData.append('attribute', JSON.stringify(attribute));
      formData.append('discountPercentage', String(Math.round(((attribute.mrpPrice - attribute.salePrice) / attribute.mrpPrice) * 100) || 0));

      // Append upload files — field name must match multer's upload.array("images", 10)
      if (newImageFiles.length > 0) {
        newImageFiles.forEach(file => {
          formData.append('images', file);
        });
      }

      // Append pasted URLs as fallback or extra images
      const pastedUrls = imagePreviews.filter(p => typeof p === 'string' && p.startsWith('http'));

      if (pastedUrls.length > 0) {
        formData.append('pastedImages', JSON.stringify(pastedUrls));
      }

      // If no images at all, add a default placeholder
      if (newImageFiles.length === 0 && pastedUrls.length === 0) {
        formData.append('pastedImages', JSON.stringify([
          `https://ui-avatars.com/api/?name=${encodeURIComponent(newProduct.name.trim())}&size=400&background=f1f5f9&color=334155&bold=true&format=png`
        ]));
      }

      console.log("[Add Product] Submitting product:", newProduct.name, "to node:", targetNodeId, targetNodeType);
      await createProduct(formData);
      toast.success("Product created successfully!");
      
      // Reset Form and Filters so new product is immediately visible in the list
      setNewProduct({ 
        name: "", sku: "", category: "Grocery", brand: "", barcode: "", hsnCode: "",
        salePrice: "", mrpPrice: "", stock: "", shortDescription: "", description: "",
        weight: "500g", unit: "pcs", isFeatured: false, isBestseller: false
      });
      setNewImageFiles([]);
      setImagePreviews([]);
      setNewImageUrls("");
      setIsModalOpen(false);
      setSelectedCategory("All");
      setSelectedBrand("All");
      setSelectedStockStatus("All");
      setSelectedBadge("All");
      setSearchTerm("");
      
      // Refresh list from server
      if (user?._id && targetNodeId) {
        await fetchProducts('', '', user._id, targetNodeType, targetNodeId);
      }
    } catch (_err) {
      console.error("[Add Product] Error:", _err);
      toast.error(_err?.message || "Failed to create product. Check console for details.");
    }
  };

  const handleEditProductSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      const discountVal = Math.round(((editingProduct.attribute.mrpPrice - editingProduct.attribute.salePrice) / editingProduct.attribute.mrpPrice) * 100);
      
      const payload = {
        productName: editingProduct.productName,
        categoryName: editingProduct.categoryName,
        brand: editingProduct.brand,
        barcode: editingProduct.barcode,
        hsnCode: editingProduct.hsnCode,
        unit: editingProduct.unit,
        shortDescription: editingProduct.shortDescription,
        description: editingProduct.description,
        isFeatured: editingProduct.isFeatured,
        isBestseller: editingProduct.isBestseller,
        stock: Number(editingProduct.stock),
        attribute: {
          salePrice: Number(editingProduct.attribute.salePrice),
          mrpPrice: Number(editingProduct.attribute.mrpPrice),
          weight: editingProduct.attribute.weight,
          quantity: editingProduct.stock.toString()
        },
        discountPercentage: discountVal >= 0 ? discountVal : 0,
        productImage: editingProduct.productImage
      };

      await updateProduct(editingProduct._id || editingProduct.id, payload);
      toast.success("Product updated successfully!");
      setIsEditModalOpen(false);
      
      // Refresh list
      if (user?._id && activeNode?._id) {
        fetchProducts('', '', user._id, activeNode.nodeType, activeNode._id);
      }
    } catch (_err) {
      toast.error(_err?.message || "Failed to update product");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product? This action is irreversible.")) {
      try {
        await deleteProduct(id);
        toast.success("Product deleted successfully");
      } catch (_err) {
        toast.error(_err?.message || "Failed to delete product");
      }
    }
  };

  // --- FILTERING AND SORTING LOGIC ---
  const filteredProducts = products.filter(p => {
    // Node filter: Ensure product strictly belongs to the active node
    const targetNodeId = activeNode?._id || paramNodeId;
    const pNodeId = p.nodeId?._id ? String(p.nodeId._id) : (p.nodeId ? String(p.nodeId) : null);
    if (targetNodeId && pNodeId && String(pNodeId) !== String(targetNodeId)) {
      return false;
    }

    // Search filter
    const matchesSearch = 
      (p.productName || p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
      (p.productSkuId || p.sku || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.brand || "").toLowerCase().includes(searchTerm.toLowerCase());

    // Category filter
    const matchesCategory = selectedCategory === "All" || p.categoryName === selectedCategory;

    // Brand filter
    const matchesBrand = selectedBrand === "All" || p.brand === selectedBrand;

    // Stock Status filter
    const stockQty = p.stock !== undefined ? Number(p.stock) : Number(p.attribute?.quantity || 0);
    let matchesStock = true;
    if (selectedStockStatus === "Active") matchesStock = stockQty > 20;
    else if (selectedStockStatus === "Low") matchesStock = stockQty > 5 && stockQty <= 20;
    else if (selectedStockStatus === "Critical") matchesStock = stockQty > 0 && stockQty <= 5;
    else if (selectedStockStatus === "Out") matchesStock = stockQty === 0;

    // Badges filter
    let matchesBadge = true;
    if (selectedBadge === "Featured") matchesBadge = p.isFeatured === true;
    else if (selectedBadge === "Bestseller") matchesBadge = p.isBestseller === true;

    return matchesSearch && matchesCategory && matchesBrand && matchesStock && matchesBadge;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aPrice = Number(a.attribute?.salePrice || a.price || 0);
    const bPrice = Number(b.attribute?.salePrice || b.price || 0);
    const aStock = a.stock !== undefined ? Number(a.stock) : Number(a.attribute?.quantity || 0);
    const bStock = b.stock !== undefined ? Number(b.stock) : Number(b.attribute?.quantity || 0);
    const aName = (a.productName || a.name || "").toLowerCase();
    const bName = (b.productName || b.name || "").toLowerCase();
    const aDiscount = Number(a.discountPercentage || 0);
    const bDiscount = Number(b.discountPercentage || 0);

    if (sortBy === "price_asc") return aPrice - bPrice;
    if (sortBy === "price_desc") return bPrice - aPrice;
    if (sortBy === "stock_asc") return aStock - bStock;
    if (sortBy === "stock_desc") return bStock - aStock;
    if (sortBy === "name_asc") return aName.localeCompare(bName);
    if (sortBy === "name_desc") return bName.localeCompare(aName);
    if (sortBy === "discount_desc") return bDiscount - aDiscount;
    return 0; // Default
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);

  // Stock Badge Render Helpers
  const getStockBadge = (qty) => {
    const num = Number(qty);
    if (num === 0) {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
          <XCircle size={12} className="text-rose-600" />
          Out of Stock
        </span>
      );
    } else if (num <= 5) {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-755 border border-rose-100 animate-pulse">
          <XCircle size={12} className="text-rose-600" />
          {num} Units Left (Critical)
        </span>
      );
    } else if (num <= 20) {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
          <AlertTriangle size={12} className="text-amber-600" />
          {num} Units (Low Stock)
        </span>
      );
    } else {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
          <CheckCircle2 size={12} className="text-emerald-600" />
          {num} Units (In Stock)
        </span>
      );
    }
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            Products Catalog 
            <span className="bg-slate-900 text-white text-xs px-3 py-1 rounded-full font-bold">
              {filteredProducts.length}
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage and audit your localized store inventory items.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, SKU, brand..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900/10 outline-none shadow-sm transition-all"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-md shrink-0 w-full sm:w-auto"
          >
            <Plus size={18}/> Add Product
          </button>
        </div>
      </div>

      {/* FILTER BAR - Premium Design */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
          <Filter size={16} className="text-slate-500" />
          Filter & Sort Inventory
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Category Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none cursor-pointer focus:ring-2 focus:ring-slate-900/10"
            >
              {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          {/* Brand Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Brand</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none cursor-pointer focus:ring-2 focus:ring-slate-900/10"
            >
              {uniqueBrands.map(br => <option key={br} value={br}>{br}</option>)}
            </select>
          </div>

          {/* Stock Level Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Stock Status</label>
            <select
              value={selectedStockStatus}
              onChange={(e) => setSelectedStockStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none cursor-pointer focus:ring-2 focus:ring-slate-900/10"
            >
              <option value="All">All Stock Levels</option>
              <option value="Active">In Stock (&gt;20)</option>
              <option value="Low">Low Stock (6-20)</option>
              <option value="Critical">Critical (&le;5)</option>
              <option value="Out">Out of Stock (0)</option>
            </select>
          </div>

          {/* Badges Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Badges</label>
            <select
              value={selectedBadge}
              onChange={(e) => setSelectedBadge(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none cursor-pointer focus:ring-2 focus:ring-slate-900/10"
            >
              <option value="All">All Badges</option>
              <option value="Featured">Featured</option>
              <option value="Bestseller">Bestseller</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none cursor-pointer focus:ring-2 focus:ring-slate-900/10"
            >
              <option value="default">Default</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="stock_asc">Stock: Low to High</option>
              <option value="stock_desc">Stock: High to Low</option>
              <option value="discount_desc">Discount: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* CATALOG CONTAINER */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        
        {/* SKELETON LOADERS WHILE FETCHING */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500 pl-6">Product Details</th>
                <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500">SKU</th>
                <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500">Category</th>
                <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500">Brand</th>
                <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500">Price (MRP / Sale)</th>
                <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500">Stock status</th>
                <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500">Badges</th>
                <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                // Render 5 Skeleton Rows
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-200 shrink-0"></div>
                        <div className="space-y-1.5 flex-1">
                          <div className="h-4 bg-slate-200 rounded w-36"></div>
                          <div className="h-3 bg-slate-200 rounded w-20"></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="p-4"><div className="h-6 bg-slate-200 rounded-full w-24"></div></td>
                    <td className="p-4"><div className="h-5 bg-slate-200 rounded w-20"></div></td>
                    <td className="p-4 text-right pr-6"><div className="h-8 bg-slate-200 rounded w-20 ml-auto"></div></td>
                  </tr>
                ))
              ) : currentItems.length > 0 ? (
                currentItems.map((p) => {
                  const numStock = p.stock !== undefined ? Number(p.stock) : Number(p.attribute?.quantity || 0);
                  const salePrice = Number(p.attribute?.salePrice || p.price || 0);
                  const mrpPrice = Number(p.attribute?.mrpPrice || p.price || 0);
                  const discountVal = Number(p.discountPercentage || 0);

                  return (
                    <tr key={p._id || p.id} className="hover:bg-slate-50/50 transition-colors group">
                      {/* Product Details */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 shadow-sm relative">
                            <img 
                              loading="lazy" 
                              decoding="async" 
                              src={p.productImage?.[0] || p.image || 'https://ui-avatars.com/api/?name=Product&size=200&background=f1f5f9&color=64748b&bold=true&format=png'} 
                              alt={p.productName || p.name} 
                              className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "https://ui-avatars.com/api/?name=Product&size=200&background=f1f5f9&color=64748b&bold=true&format=png";
                              }}
                            />
                            {discountVal > 0 && (
                              <span className="absolute top-0.5 left-0.5 bg-rose-600 text-white font-black text-[8px] px-1 rounded-sm shadow-sm scale-90">
                                {discountVal}% OFF
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate max-w-[200px]" title={p.productName || p.name}>
                              {p.productName || p.name}
                            </p>
                            <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                              Weight: {p.attribute?.weight || p.weight || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="p-4 text-xs font-mono font-bold text-slate-600">
                        {p.productSkuId || p.sku || 'N/A'}
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200/50">
                          {p.categoryName || 'General'}
                        </span>
                      </td>

                      {/* Brand */}
                      <td className="p-4 text-sm font-semibold text-slate-800">
                        {p.brand || 'N/A'}
                      </td>

                      {/* Price */}
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900 text-sm">
                            ₹{salePrice.toFixed(2)}
                          </span>
                          {mrpPrice > salePrice && (
                            <span className="text-[10px] text-slate-400 line-through mt-0.5">
                              ₹{mrpPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock Status */}
                      <td className="p-4">
                        {getStockBadge(numStock)}
                      </td>

                      {/* Badges */}
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {p.isFeatured && (
                            <span className="inline-flex items-center gap-0.5 bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm border border-amber-200">
                              <Award size={8} /> FEAT
                            </span>
                          )}
                          {p.isBestseller && (
                            <span className="inline-flex items-center gap-0.5 bg-orange-100 text-orange-800 text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm border border-orange-200">
                              <Flame size={8} /> BEST
                            </span>
                          )}
                          {!p.isFeatured && !p.isBestseller && (
                            <span className="text-slate-400 text-xs font-medium">-</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right pr-6 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => { setSelectedProduct(p); setIsViewModalOpen(true); }}
                            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                            title="View details"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => { setEditingProduct({ ...p, stock: numStock }); setIsEditModalOpen(true); }}
                            className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(p._id || p.id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="py-20 text-center text-slate-500">
                    <Boxes size={48} className="mx-auto mb-4 opacity-30 text-slate-700" />
                    <p className="font-bold text-lg text-slate-700">No products found.</p>
                    <p className="text-sm text-slate-400 mt-1">Try resetting filters or adding new items manually.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION BAR */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
            <p className="text-sm text-slate-500 font-medium text-center sm:text-left">
              Showing <span className="font-bold text-slate-900">{indexOfFirstItem + 1}</span> to{" "}
              <span className="font-bold text-slate-900">{Math.min(indexOfLastItem, sortedProducts.length)}</span> of{" "}
              <span className="font-bold text-slate-900">{sortedProducts.length}</span> products
            </p>
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all flex items-center justify-center gap-1"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all flex items-center justify-center gap-1"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- ADD PRODUCT MODAL --- */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative flex flex-col bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50 shrink-0">
              <h2 className="font-black text-slate-900 text-lg">Add New Product to Catalog</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-full transition-colors"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleAddProduct} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              {/* Image Upload section */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Product Images (Max 5)</label>
                
                {imagePreviews.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {imagePreviews.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 group shadow-sm">
                        <img loading="lazy" decoding="async" src={img} alt="preview" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => removeImage(idx)}
                          className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]"
                        >
                          <X size={20} className="text-white" />
                        </button>
                      </div>
                    ))}
                    {imagePreviews.length < 5 && (
                      <button 
                        type="button" 
                        onClick={() => document.getElementById('product-image-upload-create').click()}
                        className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all"
                      >
                        <Plus size={24} />
                      </button>
                    )}
                  </div>
                )}

                {imagePreviews.length === 0 && (
                  <div 
                    onClick={() => document.getElementById('product-image-upload-create').click()}
                    className="w-full py-8 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer group shadow-sm mb-3"
                  >
                    <ImagePlus size={24} className="mb-2 text-slate-400" />
                    <p className="text-sm font-bold text-slate-700">Click to upload product images</p>
                    <p className="text-xs text-slate-400 mt-0.5">PNG, JPG up to 2MB (Max 5)</p>
                  </div>
                )}
                
                <input 
                  id="product-image-upload-create" 
                  type="file" 
                  multiple 
                  accept="image/png, image/jpeg, image/jpg" 
                  className="hidden" 
                  onChange={handleImageUpload} 
                />

              </div>

              {/* Form Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Product Name</label>
                  <input required type="text" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-semibold" placeholder="e.g. Aashirvaad Atta 5kg"/>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">SKU ID (Unique)</label>
                    <input type="text" value={newProduct.sku} onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-semibold uppercase" placeholder="SM-AAS-001 (Auto-generated if empty)"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Brand</label>
                    <input type="text" value={newProduct.brand} onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-semibold" placeholder="e.g. Aashirvaad"/>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                    <select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-semibold cursor-pointer">
                      <option value="Grocery">Grocery</option>
                      <option value="Dairy">Dairy</option>
                      <option value="Beverages">Beverages</option>
                      <option value="Snacks">Snacks</option>
                      <option value="Household">Household</option>
                      <option value="Personal Care">Personal Care</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Weight (e.g. 5kg, 750ml)</label>
                    <input type="text" value={newProduct.weight} onChange={(e) => setNewProduct({...newProduct, weight: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-semibold" placeholder="5kg"/>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Unit</label>
                    <select value={newProduct.unit} onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-semibold cursor-pointer">
                      <option value="pcs">pcs</option>
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="L">L</option>
                      <option value="ml">ml</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">MRP Price (₹)</label>
                    <input required type="number" min="0" step="0.01" value={newProduct.mrpPrice} onChange={(e) => setNewProduct({...newProduct, mrpPrice: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-bold" placeholder="0.00"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Selling Price (₹)</label>
                    <input required type="number" min="0" step="0.01" value={newProduct.salePrice} onChange={(e) => setNewProduct({...newProduct, salePrice: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-bold" placeholder="0.00"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Stock Quantity</label>
                    <input required type="number" min="0" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-bold" placeholder="100"/>
                  </div>
                </div>

                {/* Badges Toggles */}
                <div className="flex gap-6 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <label className="flex items-center gap-2 font-semibold text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newProduct.isFeatured}
                      onChange={(e) => setNewProduct({...newProduct, isFeatured: e.target.checked})}
                      className="rounded border-slate-350 focus:ring-slate-900 text-slate-950 w-4 h-4"
                    />
                    Featured Product
                  </label>
                  <label className="flex items-center gap-2 font-semibold text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newProduct.isBestseller}
                      onChange={(e) => setNewProduct({...newProduct, isBestseller: e.target.checked})}
                      className="rounded border-slate-350 focus:ring-slate-900 text-slate-950 w-4 h-4"
                    />
                    Bestseller Product
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Short Description</label>
                  <input type="text" value={newProduct.shortDescription} onChange={(e) => setNewProduct({...newProduct, shortDescription: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-semibold" placeholder="Brief tagline..."/>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Description</label>
                  <textarea rows="3" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-semibold resize-none" placeholder="Detailed product descriptions and ingredients..."></textarea>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-2xl transition-all shadow-sm cursor-pointer">Cancel</button>
                <button type="submit" disabled={isLoading} className="flex-1 py-3.5 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* --- EDIT PRODUCT MODAL --- */}
      {isEditModalOpen && editingProduct && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative flex flex-col bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50 shrink-0">
              <h2 className="font-black text-slate-900 text-lg">Edit Product Details</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-full transition-colors"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleEditProductSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              {/* Form Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Product Name</label>
                  <input required type="text" value={editingProduct.productName} onChange={(e) => setEditingProduct({...editingProduct, productName: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-slate-900/10 font-semibold" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">SKU (Read Only)</label>
                    <input type="text" value={editingProduct.productSkuId} disabled className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold uppercase text-slate-400 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Brand</label>
                    <input required type="text" value={editingProduct.brand} onChange={(e) => setEditingProduct({...editingProduct, brand: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-slate-900/10 font-semibold" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                    <select value={editingProduct.categoryName} onChange={(e) => setEditingProduct({...editingProduct, categoryName: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-slate-900/10 font-semibold">
                      <option value="Grocery">Grocery</option>
                      <option value="Dairy">Dairy</option>
                      <option value="Beverages">Beverages</option>
                      <option value="Snacks">Snacks</option>
                      <option value="Household">Household</option>
                      <option value="Personal Care">Personal Care</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Weight (e.g. 5kg, 750ml)</label>
                    <input required type="text" value={editingProduct.attribute.weight} onChange={(e) => setEditingProduct({
                      ...editingProduct, 
                      attribute: { ...editingProduct.attribute, weight: e.target.value }
                    })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-slate-900/10 font-semibold" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Barcode</label>
                    <input type="text" value={editingProduct.barcode || ''} onChange={(e) => setEditingProduct({...editingProduct, barcode: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-slate-900/10 font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">HSN Code</label>
                    <input type="text" value={editingProduct.hsnCode || ''} onChange={(e) => setEditingProduct({...editingProduct, hsnCode: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-slate-900/10 font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Unit</label>
                    <select value={editingProduct.unit || 'pcs'} onChange={(e) => setEditingProduct({...editingProduct, unit: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-slate-900/10 font-semibold cursor-pointer">
                      <option value="pcs">pcs</option>
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="L">L</option>
                      <option value="ml">ml</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">MRP Price (₹)</label>
                    <input required type="number" min="0" step="0.01" value={editingProduct.attribute.mrpPrice} onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      attribute: { ...editingProduct.attribute, mrpPrice: Number(e.target.value) }
                    })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Selling Price (₹)</label>
                    <input required type="number" min="0" step="0.01" value={editingProduct.attribute.salePrice} onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      attribute: { ...editingProduct.attribute, salePrice: Number(e.target.value) }
                    })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Stock Quantity</label>
                    <input required type="number" min="0" value={editingProduct.stock} onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      stock: Number(e.target.value)
                    })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white font-bold" />
                  </div>
                </div>

                {/* Badges Toggles */}
                <div className="flex gap-6 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <label className="flex items-center gap-2 font-semibold text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProduct.isFeatured || false}
                      onChange={(e) => setEditingProduct({...editingProduct, isFeatured: e.target.checked})}
                      className="rounded border-slate-350 focus:ring-slate-900 text-slate-950 w-4 h-4"
                    />
                    Featured Product
                  </label>
                  <label className="flex items-center gap-2 font-semibold text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProduct.isBestseller || false}
                      onChange={(e) => setEditingProduct({...editingProduct, isBestseller: e.target.checked})}
                      className="rounded border-slate-350 focus:ring-slate-900 text-slate-950 w-4 h-4"
                    />
                    Bestseller Product
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Short Description</label>
                  <input required type="text" value={editingProduct.shortDescription || ''} onChange={(e) => setEditingProduct({...editingProduct, shortDescription: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white font-semibold" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Description</label>
                  <textarea rows="3" value={editingProduct.description || ''} onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white font-semibold resize-none"></textarea>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3.5 font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl transition-all shadow-sm">Cancel</button>
                <button type="submit" disabled={isLoading} className="flex-1 py-3.5 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2">
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* --- VIEW PRODUCT MODAL --- */}
      {isViewModalOpen && selectedProduct && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setIsViewModalOpen(false)}></div>
          <div className="relative flex flex-col bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <h2 className="font-black text-slate-900 text-lg">Product Specifications</h2>
                <span className="text-xs font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">
                  {selectedProduct.productSkuId || selectedProduct.sku}
                </span>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-full transition-colors"><X size={18} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              {/* Product Cover and Gallery */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="w-full aspect-square bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-inner flex items-center justify-center">
                  <img 
                    loading="lazy" 
                    decoding="async" 
                    src={selectedProduct.productImage?.[0] || selectedProduct.image || 'https://placehold.co/400x400?text=Product'} 
                    alt={selectedProduct.productName} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedProduct.brand || 'No Brand'}</span>
                    <h3 className="text-xl font-black text-slate-900 mt-1 leading-tight">{selectedProduct.productName || selectedProduct.name}</h3>
                    <p className="text-slate-500 text-xs font-semibold italic mt-1 leading-relaxed">{selectedProduct.shortDescription || 'No short description available.'}</p>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 font-bold uppercase">MRP Price</span>
                      <span className="text-sm text-slate-500 font-bold line-through">
                        ₹{(Number(selectedProduct.attribute?.mrpPrice || selectedProduct.price || 0)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
                      <span className="text-xs text-slate-500 font-bold uppercase">Selling Price</span>
                      <span className="text-lg font-black text-slate-900">
                        ₹{(Number(selectedProduct.attribute?.salePrice || selectedProduct.price || 0)).toFixed(2)}
                      </span>
                    </div>
                    {Number(selectedProduct.discountPercentage) > 0 && (
                      <div className="flex justify-between items-center text-rose-600 font-bold text-xs bg-rose-50 px-2 py-1 rounded">
                        <span>Save Amount (Discount)</span>
                        <span>{selectedProduct.discountPercentage}% OFF</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.isFeatured && (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-bold px-3 py-1 rounded-full border border-amber-200">
                        <Award size={10} /> Featured Product
                      </span>
                    )}
                    {selectedProduct.isBestseller && (
                      <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 text-[10px] font-bold px-3 py-1 rounded-full border border-orange-200">
                        <Flame size={10} /> Bestseller Product
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Gallery Images List */}
              {selectedProduct.productImage && selectedProduct.productImage.length > 1 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Gallery</h4>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {selectedProduct.productImage.map((img, idx) => (
                      <div key={idx} className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shrink-0 shadow-sm">
                        <img loading="lazy" decoding="async" src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Spec sheet */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Audit & Metadata Specifications</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-sm">
                  <div className="space-y-2.5">
                    <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                      <span className="text-slate-500 font-medium">Category:</span>
                      <span className="font-bold text-slate-900">{selectedProduct.categoryName || 'General'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                      <span className="text-slate-500 font-medium">SKU ID:</span>
                      <span className="font-bold text-slate-900 font-mono">{selectedProduct.productSkuId || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                      <span className="text-slate-500 font-medium">Barcode:</span>
                      <span className="font-bold text-slate-900 font-mono">{selectedProduct.barcode || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                      <span className="text-slate-500 font-medium">GST %:</span>
                      <span className="font-bold text-slate-900">{selectedProduct.gstPercentage || 0}%</span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                      <span className="text-slate-500 font-medium">Weight:</span>
                      <span className="font-bold text-slate-900">{selectedProduct.attribute?.weight || selectedProduct.weight || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                      <span className="text-slate-500 font-medium">Unit of Measure:</span>
                      <span className="font-bold text-slate-900 uppercase">{selectedProduct.unit || 'pcs'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                      <span className="text-slate-500 font-medium">HSN Code:</span>
                      <span className="font-bold text-slate-900 font-mono">{selectedProduct.hsnCode || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                      <span className="text-slate-500 font-medium">Stock count:</span>
                      <span className="font-bold text-slate-900">
                        {selectedProduct.stock !== undefined ? selectedProduct.stock : (selectedProduct.attribute?.quantity || 0)} units
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Description</h4>
                <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  {selectedProduct.description || 'No detailed description provided.'}
                </div>
              </div>
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-100 shrink-0 text-right">
              <button 
                type="button" 
                onClick={() => setIsViewModalOpen(false)} 
                className="px-6 py-2.5 font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl transition-all shadow-sm"
              >
                Close Specifications
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Custom scrollbar style */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #94a3b8; }
      `}} />
    </div>
  );
}
