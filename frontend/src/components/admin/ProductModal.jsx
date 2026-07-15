import { X, Upload } from "lucide-react";
import { useState, useEffect } from "react";

export default function ProductModal({
  isOpen = false,
  onClose = () => {},
  product = null,
  categories = ["Men's", "Women", "Kids Boy", "Kids Girl", "Accessories"],
}) {
  if (!isOpen) return null;

  const safeCategories = Array.isArray(categories) ? categories : [];

  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    image: "",
    imagePreview: "",
  });

  /* ---------------- INIT FORM ---------------- */
  useEffect(() => {
    if (product) {
      setForm({
        name: product.name ?? product.productName ?? "",
        price: product.price ?? product.attribute?.salePrice ?? "",
        stock: product.stock ?? "",
        category: product.category ?? product.categoryName ?? "",
        image: product.image ?? (Array.isArray(product.productImage) ? product.productImage[0] : ""),
        imagePreview: product.image ?? (Array.isArray(product.productImage) ? product.productImage[0] : ""),
      });
    } else {
      setForm({
        name: "",
        price: "",
        stock: "",
        category: "",
        image: "",
        imagePreview: "",
      });
    }
  }, [product]);

  /* ---------------- IMAGE PREVIEW ---------------- */
  const handleImageChange = (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;

    try {
      const previewURL = URL.createObjectURL(file);
      setForm((prev) => ({
        ...prev,
        image: file,
        imagePreview: previewURL,
      }));
    } catch (err) {
      console.error("Error generating image preview:", err);
    }
  };

  /* ---------------- INPUT HANDLER ---------------- */
  const handleChange = (e) => {
    if (!e?.target) return;
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-3 sm:px-6">
      <div className="bg-white w-full max-w-4xl rounded-2xl p-5 sm:p-6 md:p-8 relative max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-5 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold">
            {product ? "Edit Product" : "Add Product"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition">
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* IMAGE UPLOAD */}
          <div>
            <p className="text-sm font-medium mb-2">Product Image</p>

            <label className="border-2 border-dashed border-slate-300 rounded-xl h-56 sm:h-64 md:h-80 flex items-center justify-center cursor-pointer overflow-hidden relative bg-slate-50 hover:bg-slate-100/50 transition">
              {form.imagePreview ? (
                <img
                  loading="lazy"
                  decoding="async"
                  src={form.imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <Upload size={28} />
                  <span className="text-xs sm:text-sm mt-2 font-medium">
                    Click to upload image
                  </span>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            <p className="text-xs text-gray-400 mt-2">
              Recommended: 1200×1500 JPG / PNG / WEBP
            </p>
          </div>

          {/* FORM */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Product Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter product name"
                className="w-full border border-slate-200 rounded-xl px-4 py-2 mt-1 text-sm sm:text-base outline-none focus:border-slate-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Price (₹)</label>
                <input
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 mt-1 text-sm sm:text-base outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Stock Quantity</label>
                <input
                  name="stock"
                  type="number"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 mt-1 text-sm sm:text-base outline-none focus:border-slate-400"
                />
              </div>
            </div>

            {/* DYNAMIC CATEGORY */}
            <div>
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-2 mt-1 text-sm sm:text-base outline-none focus:border-slate-400 bg-white"
              >
                <option value="">Select Category</option>
                {safeCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 sm:mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold hover:bg-slate-50 transition"
          >
            Cancel
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-black transition"
          >
            Save Product
          </button>
        </div>
      </div>
    </div>
  );
}
