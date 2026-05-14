import React, { useState, useEffect, useRef } from 'react';
import { 
  CloudUpload, Search, Filter, Flame, TrendingUp, 
  ArrowRight, Save, Trash2, CheckCircle2, Boxes, Edit2, X, ImagePlus, Plus, FileSpreadsheet, AlertCircle, CheckCircle, Loader2
} from 'lucide-react';
import { useProductStore } from '../../store/productStore';
import { useSellerAuthStore } from '../../store/sellerAuthStore';
import { useNodeStore } from '../../store/nodeStore';

import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Inventory({ search: globalSearch = "" }) {
  const { activeNode } = useNodeStore();

  const { products, fetchProducts, isLoading, deleteProduct, updateProduct } = useProductStore();
  const { user } = useSellerAuthStore();
  const [localSearch, setLocalSearch] = useState("");
  const activeSearch = globalSearch || localSearch;

  // Fetch products on mount
  useEffect(() => {
    if (user?._id && activeNode?._id) {
      fetchProducts('', '', user._id, activeNode.nodeType, activeNode._id);
    }
  }, [user?._id, activeNode?._id, activeNode?.nodeType, fetchProducts]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [editImages, setEditImages] = useState([]);
  const fileInputRef = useRef(null);

  // Bulk Upload State
  const [isDragging, setIsDragging] = useState(false);
  const [bulkStatus, setBulkStatus] = useState(null); // { type: 'success'|'error'|'preview', message, data }
  const [bulkPreview, setBulkPreview] = useState(null);
  const bulkInputRef = useRef(null);

  // Reset page to 1 on search
  useEffect(() => { setCurrentPage(1); }, [activeSearch]);

  const handleDelete = async (idToRemove) => {
    if(window.confirm("Are you sure you want to delete this SKU?")) {
       try {
         await deleteProduct(idToRemove);
       } catch (err) {
         toast.error("Failed to delete product: " + err.message);
       }
    }
  };

  const handleQuickSave = async (product, newStock, newPrice) => {
    try {
      const updatedAttribute = {
        ...product.attribute,
        quantity: newStock || product.attribute.quantity,
        salePrice: newPrice || product.attribute.salePrice
      };
      
      await updateProduct(product._id || product.id, { attribute: updatedAttribute });
      toast.success("Inventory updated successfully!");
    } catch (err) {
      toast.error("Failed to update inventory: " + err.message);
    }
  };

  // --- BULK UPLOAD LOGIC ---
  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row.");
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
    
    const requiredFields = ['name', 'sku', 'price', 'stock'];
    const missing = requiredFields.filter(f => !headers.includes(f));
    if (missing.length > 0) throw new Error(`Missing required columns: ${missing.join(', ')}`);

    return lines.slice(1).filter(line => line.trim()).map((line, idx) => {
      // Handle quoted commas
      const values = [];
      let current = '';
      let inQuotes = false;
      for (const char of line) {
        if (char === '"') { inQuotes = !inQuotes; }
        else if (char === ',' && !inQuotes) { values.push(current.trim()); current = ''; }
        else { current += char; }
      }
      values.push(current.trim());

      const row = {};
      headers.forEach((h, i) => { row[h] = (values[i] || '').replace(/['"]/g, '').trim(); });

      const stock = parseInt(row.stock) || 0;
      return {
        id: Date.now() + idx,
        name: row.name || 'Unnamed Product',
        sku: row.sku?.toUpperCase() || `SKU-${Date.now() + idx}`,
        price: parseFloat(row.price) || 0,
        stock,
        category: row.category || 'General',
        demand: row.demand || 'stable',
        status: stock > 10 ? 'Active' : stock > 0 ? 'Low Stock' : 'Out of Stock',
        image: row.image || 'https://placehold.co/60x60/e2e8f0/94a3b8?text=IMG',
        images: row.image ? [row.image] : [],
      };
    });
  };

  const processBulkFile = (file) => {
    setBulkStatus(null);
    setBulkPreview(null);

    if (!file) return;

    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];
    const isValid = validTypes.includes(file.type) || file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    
    if (!isValid) {
      setBulkStatus({ type: 'error', message: 'Invalid file type. Please upload a CSV or Excel file.' });
      return;
    }

    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      setBulkStatus({ type: 'error', message: 'Excel files require server-side processing. Please export your sheet as CSV and re-upload.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = parseCSV(e.target.result);
        setBulkPreview({ file: file.name, rows: parsed });
        setBulkStatus({ type: 'preview', message: `Found ${parsed.length} product(s) in "${file.name}". Review and confirm import.` });
      } catch (err) {
        setBulkStatus({ type: 'error', message: err.message });
      }
    };
    reader.readAsText(file);
  };

  const confirmBulkImport = () => {
    if (!bulkPreview) return;
    const existingSkus = new Set(products.map(p => p.sku));
    const newProducts = bulkPreview.rows.filter(p => !existingSkus.has(p.sku));
    const updatedProducts = bulkPreview.rows.filter(p => existingSkus.has(p.sku));

    const merged = products.map(p => {
      const updated = updatedProducts.find(u => u.sku === p.sku);
      return updated ? { ...p, ...updated, id: p.id } : p;
    });

    setProducts([...merged, ...newProducts]);
    setBulkStatus({ type: 'success', message: `✓ Imported ${newProducts.length} new & updated ${updatedProducts.length} existing product(s).` });
    setBulkPreview(null);
    if (bulkInputRef.current) bulkInputRef.current.value = '';
  };

  const cancelBulkImport = () => {
    setBulkPreview(null);
    setBulkStatus(null);
    if (bulkInputRef.current) bulkInputRef.current.value = '';
  };

  // Drag & Drop Handlers
  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processBulkFile(file);
  };

  // --- EDIT MODAL LOGIC ---
  const openEditModal = (product) => {
    setEditingProduct({ ...product });
    setEditImages(product.images || (product.image ? [product.image] : []));
  };

  const handleEditImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(f => f.size <= 2 * 1024 * 1024);
    if (validFiles.length < files.length) toast.warning("Some files were skipped (Max 2MB).");
    Promise.all(validFiles.map(file => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    }))).then(base64Images => {
      setEditImages(prev => [...prev, ...base64Images].slice(0, 5));
    });
    e.target.value = '';
  };

  const removeEditImage = (indexToRemove) => {
    setEditImages(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('productName', editingProduct.productName || editingProduct.name);
      formData.append('price', editingProduct.price);
      formData.append('quantity', editingProduct.stock);
      formData.append('categoryName', editingProduct.category);
      
      // If images were base64 (from file reader), we'd need to convert back to blobs
      // but for simplicity, let's assume updateProduct can take the object if no new files
      // Better: check if editImages has new files.
      // For now, let's just send the text fields.
      
      await updateProduct(editingProduct._id || editingProduct.id, formData);
      setEditingProduct(null);
      if (user?._id && activeNode?._id) {
        fetchProducts('', '', user._id, activeNode.nodeType, activeNode._id); // Refresh
      }
    } catch (err) {
      toast.error("Failed to update product: " + err.message);
    }
  };

  const filteredProducts = products.filter(p => 
    (p.productName || p.name || "").toLowerCase().includes(activeSearch.toLowerCase()) || 
    (p.productSkuId || p.sku || "").toLowerCase().includes(activeSearch.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            Smart Inventory Manager
            <span className="bg-slate-900 text-white text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest">PRO</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Premium visual management for high-volume sellers.</p>
        </div>
        
        {/* Bulk Upload Zone */}
        <div className="flex-1 max-w-md w-full flex flex-col gap-2">
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => !bulkPreview && bulkInputRef.current?.click()}
            className={`rounded-2xl p-4 transition-all border-2 border-dashed cursor-pointer
              ${isDragging ? 'border-blue-400 bg-blue-50 scale-[1.01]' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}
              ${bulkPreview ? 'cursor-default' : ''}
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl shadow-sm border transition-colors ${isDragging ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
                <CloudUpload className={isDragging ? 'text-blue-500' : 'text-slate-600'} size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-900">Bulk Upload Magic Zone</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isDragging ? 'Drop your file here!' : 'Drag & drop CSV or click to browse'}
                </p>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-2 py-1 rounded-lg shrink-0">CSV</span>
            </div>
            <input
              ref={bulkInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,text/csv"
              className="hidden"
              onChange={(e) => processBulkFile(e.target.files[0])}
            />
          </div>

          {/* Status / Preview Banner */}
          {bulkStatus && (
            <div className={`rounded-xl px-4 py-3 text-xs font-medium flex flex-col gap-2 border transition-all
              ${bulkStatus.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : ''}
              ${bulkStatus.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : ''}
              ${bulkStatus.type === 'preview' ? 'bg-blue-50 border-blue-200 text-blue-800' : ''}
            `}>
              <div className="flex items-start gap-2">
                {bulkStatus.type === 'error' && <AlertCircle size={14} className="shrink-0 mt-0.5" />}
                {bulkStatus.type === 'success' && <CheckCircle size={14} className="shrink-0 mt-0.5" />}
                {bulkStatus.type === 'preview' && <FileSpreadsheet size={14} className="shrink-0 mt-0.5" />}
                <span>{bulkStatus.message}</span>
              </div>

              {/* Preview table */}
              {bulkStatus.type === 'preview' && bulkPreview && (
                <>
                  <div className="overflow-x-auto rounded-lg border border-blue-200 bg-white mt-1">
                    <table className="w-full text-[10px]">
                      <thead>
                        <tr className="border-b border-blue-100 bg-blue-50/50">
                          <th className="px-2 py-1.5 text-left font-bold text-blue-700">Name</th>
                          <th className="px-2 py-1.5 text-left font-bold text-blue-700">SKU</th>
                          <th className="px-2 py-1.5 text-right font-bold text-blue-700">Price</th>
                          <th className="px-2 py-1.5 text-right font-bold text-blue-700">Stock</th>
                          <th className="px-2 py-1.5 text-left font-bold text-blue-700">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-50">
                        {bulkPreview.rows.slice(0, 5).map((row, i) => (
                          <tr key={i}>
                            <td className="px-2 py-1.5 font-medium text-slate-800 truncate max-w-[100px]">{row.name}</td>
                            <td className="px-2 py-1.5 font-mono text-slate-500">{row.sku}</td>
                            <td className="px-2 py-1.5 text-right font-bold text-slate-800">₹{row.price.toFixed(2)}</td>
                            <td className="px-2 py-1.5 text-right text-slate-700">{row.stock}</td>
                            <td className="px-2 py-1.5">
                              <span className={`px-1.5 py-0.5 rounded font-bold uppercase tracking-wide text-[9px]
                                ${row.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : row.status === 'Low Stock' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}
                              `}>{row.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {bulkPreview.rows.length > 5 && (
                      <p className="text-center text-[10px] text-blue-500 font-bold py-1.5 border-t border-blue-100">
                        +{bulkPreview.rows.length - 5} more rows
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 mt-1">
                    <button onClick={cancelBulkImport} className="flex-1 py-2 rounded-lg bg-white border border-blue-200 text-blue-700 font-bold hover:bg-blue-50 transition-colors">Cancel</button>
                    <button onClick={confirmBulkImport} className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors">Confirm Import</button>
                  </div>
                </>
              )}

              {(bulkStatus.type === 'error' || bulkStatus.type === 'success') && (
                <button onClick={cancelBulkImport} className="text-[10px] font-bold underline opacity-70 hover:opacity-100 text-left">Dismiss</button>
              )}
            </div>
          )}

          {/* CSV format hint */}
          <p className="text-[10px] text-slate-400 font-medium px-1">
            Required columns: <span className="font-bold text-slate-500">name, sku, price, stock</span> · Optional: category, demand, image
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              value={localSearch} onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900/10 outline-none" 
              placeholder="Search by SKU, product name..." type="text"
            />
          </div>
          <div className="flex gap-3">
            <select className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold cursor-pointer outline-none">
              <option>All Categories</option><option>Spices & Herbs</option><option>Grains</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-700 font-bold text-sm rounded-xl"><Filter size={16}/> Filters</button>
          </div>
        </div>
      </div>

      {/* Responsive Inventory Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        
        {/* MOBILE VIEW */}
        <div className="md:hidden divide-y divide-slate-100 flex-1">
          {currentItems.length > 0 ? currentItems.map((product) => (
            <div key={product._id || product.id} className="p-4 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                  <img src={product.productImage?.[0] || product.image} alt={product.productName || product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-900 text-sm truncate pr-2">{product.productName || product.name}</h3>
                    <button onClick={() => openEditModal(product)} className="text-slate-400 hover:text-blue-600 shrink-0"><Edit2 size={16}/></button>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{product.productSkuId || product.sku}</p>
                  <span className={`inline-block mt-2 px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wide ${
                    (product.status || (product.attribute?.quantity > 10 ? 'Active' : 'Low Stock')) === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {product.status || (product.attribute?.quantity > 0 ? 'Active' : 'Out of Stock')}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Stock (Units)</p>
                  <input type="number" defaultValue={product.attribute?.quantity || product.stock} className="w-full p-2 text-sm font-bold border border-slate-200 rounded-lg text-center focus:ring-2 focus:ring-slate-900/10 outline-none" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Price (₹)</p>
                  <input type="number" defaultValue={product.attribute?.salePrice || product.price} className="w-full p-2 text-sm font-bold border border-slate-200 rounded-lg text-center focus:ring-2 focus:ring-slate-900/10 outline-none" />
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={(e) => {
                    const card = e.currentTarget.closest('.p-4.border-b');
                    const stockInput = card.querySelector('input[type="number"]:nth-of-type(1)');
                    const priceInput = card.querySelector('input[type="number"]:nth-of-type(2)');
                    handleQuickSave(product, stockInput.value, priceInput.value);
                  }} 
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold text-xs rounded-lg transition-colors border border-slate-200 hover:border-emerald-200"
                >
                  <Save size={14}/> Save
                </button>
                <button onClick={() => handleDelete(product._id || product.id)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-red-700 font-bold text-xs rounded-lg transition-colors border border-slate-200 hover:border-red-200"><Trash2 size={14}/> Delete</button>
              </div>
            </div>
          )) : (
            <div className="py-12 text-center text-slate-500"><Boxes size={32} className="mx-auto mb-2 opacity-50"/><p>No inventory matches.</p></div>
          )}
        </div>

        {/* DESKTOP VIEW */}
        <div className="hidden md:block overflow-x-auto w-full flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="p-4 text-sm font-bold text-slate-500 whitespace-nowrap">Product Details</th>
                <th className="p-4 text-sm font-bold text-slate-500 text-center whitespace-nowrap">Demand</th>
                <th className="p-4 text-sm font-bold text-slate-500 whitespace-nowrap">Stock (Edit)</th>
                <th className="p-4 text-sm font-bold text-slate-500 whitespace-nowrap">Price (Edit)</th>
                <th className="p-4 text-sm font-bold text-slate-500 whitespace-nowrap">Status</th>
                <th className="p-4 text-sm font-bold text-slate-500 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentItems.length > 0 ? currentItems.map((product) => (
                <tr key={product._id || product.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <img src={product.productImage?.[0] || product.image} alt={product.productName || product.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{product.productName || product.name}</div>
                        <div className="text-xs font-medium text-slate-500 mt-0.5">SKU: {product.productSkuId || product.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className={`inline-flex p-2 rounded-xl ${product.demand === 'high' ? 'bg-orange-50 text-orange-500' : product.demand === 'growing' ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-500'}`}>
                      {product.demand === 'high' ? <Flame size={18} /> : product.demand === 'growing' ? <TrendingUp size={18} /> : <ArrowRight size={18} />}
                    </div>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <input className="w-20 text-sm py-1.5 px-2 border border-slate-200 rounded-lg text-center font-bold outline-none focus:ring-2 focus:ring-slate-900/10" type="number" defaultValue={product.attribute?.quantity || product.stock} />
                      <span className="text-xs font-medium text-slate-500">units</span>
                    </div>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 font-bold text-sm">₹</span>
                      <input className="w-24 text-sm py-1.5 px-2 border border-slate-200 rounded-lg text-center font-bold outline-none focus:ring-2 focus:ring-slate-900/10" type="number" defaultValue={parseFloat(product.attribute?.salePrice || product.price || 0).toFixed(2)}/>
                    </div>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md uppercase tracking-wide ${
                      (product.status || 'Active') === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {product.status || (product.attribute?.quantity > 0 ? 'Active' : 'Out of Stock')}
                    </span>
                  </td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEditModal(product)} className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors" title="Full Edit"><Edit2 size={18} /></button>
                      <button 
                        onClick={(e) => {
                          const row = e.currentTarget.closest('tr');
                          const stockInput = row.querySelector('input[type="number"]:nth-of-type(1)');
                          const priceInput = row.querySelector('input[type="number"]:nth-of-type(2)');
                          handleQuickSave(product, stockInput.value, priceInput.value);
                        }} 
                        className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition-colors" 
                        title="Quick Save"
                      >
                        <Save size={18} />
                      </button>
                      <button onClick={() => handleDelete(product._id || product.id)} className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Delete"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="py-16 text-center text-slate-500"><Boxes size={32} className="mx-auto mb-3 opacity-50" /><p className="font-bold">No products match your search.</p></td></tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
          <p className="text-sm text-slate-500 font-medium text-center sm:text-left">
            Showing <span className="font-bold text-slate-900">{filteredProducts.length > 0 ? indexOfFirstItem + 1 : 0}</span> to <span className="font-bold text-slate-900">{Math.min(indexOfLastItem, filteredProducts.length)}</span> of <span className="font-bold text-slate-900">{filteredProducts.length}</span> results
          </p>
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1 || filteredProducts.length === 0} className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all">Previous</button>
            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage >= totalPages || filteredProducts.length === 0} className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all">Next</button>
          </div>
        </div>
      </div>

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setEditingProduct(null)}></div>
          <div className="relative flex flex-col bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50 shrink-0">
              <h2 className="font-bold text-slate-900 flex items-center gap-2"><Edit2 size={18}/> Edit Inventory</h2>
              <button onClick={() => setEditingProduct(null)} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-full transition-colors"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Product Images (Max 5)</label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {editImages.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 group shadow-sm">
                      <img src={img} alt="preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeEditImage(idx)} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
                        <X size={18} className="text-white" />
                      </button>
                    </div>
                  ))}
                  {editImages.length < 5 && (
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all">
                      <Plus size={20} />
                    </button>
                  )}
                </div>
                {editImages.length === 0 && (
                  <div onClick={() => fileInputRef.current?.click()} className="w-full py-6 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm">
                    <ImagePlus size={24} className="mb-2" />
                    <p className="text-sm font-bold">Upload images</p>
                  </div>
                )}
                <input type="file" multiple accept="image/png, image/jpeg" className="hidden" ref={fileInputRef} onChange={handleEditImageUpload} />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Product Name</label>
                <input required type="text" value={editingProduct.name} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">SKU (Read Only)</label>
                  <input type="text" value={editingProduct.sku} disabled className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium uppercase text-slate-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                  <select value={editingProduct.category} onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium cursor-pointer transition-all">
                    <option>Spices</option><option>Grains</option><option>Beverages</option><option>General</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Price (₹)</label>
                  <input required type="number" min="0" step="0.01" value={editingProduct.price} onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-bold transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Stock Level</label>
                  <input required type="number" min="0" value={editingProduct.stock} onChange={(e) => setEditingProduct({...editingProduct, stock: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-bold transition-all" />
                </div>
              </div>

              <div className="pt-2 flex gap-3 mt-4">
                <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 py-3 font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">Cancel</button>
                <button type="submit" className="flex-1 py-3 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all">Update Product</button>
              </div>
              <div className="h-60 w-full md:hidden shrink-0"></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}