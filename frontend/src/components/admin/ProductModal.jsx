import { X, Upload } from "lucide-react";
import { useState, useEffect } from "react";

export default function ProductModal({
  isOpen,
  onClose,
  product,
  categories = ["Men's", "Women", "Kids Boy", "Kids Girl", "Accessories"],
}) {
  if (!isOpen) return null;

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
        ...product,
        imagePreview: product.image || "",
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
    const file = e.target.files[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);

    setForm((prev) => ({
      ...prev,
      image: file,
      imagePreview: previewURL,
    }));
  };

  /* ---------------- INPUT HANDLER ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-3 sm:px-6">
      <div className="bg-white w-full max-w-4xl rounded-2xl p-5 sm:p-6 md:p-8 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-5 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold">
            {product ? "Edit Product" : "Add Product"}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* IMAGE UPLOAD */}
          <div>
            <p className="text-sm font-medium mb-2">Product Image</p>

            <label className="border-2 border-dashed rounded-xl h-56 sm:h-64 md:h-80 flex items-center justify-center cursor-pointer overflow-hidden relative">
              {form.imagePreview ? (
                <img
                  src={form.imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <Upload size={24} className="sm:hidden" />
                  <Upload size={28} className="hidden sm:block" />
                  <span className="text-xs sm:text-sm mt-2">
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
              <label className="text-sm font-medium">Product Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-2 mt-1 text-sm sm:text-base"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Price</label>
                <input
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-2 mt-1 text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Stock</label>
                <input
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-2 mt-1 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* DYNAMIC CATEGORY */}
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-2 mt-1 text-sm sm:text-base"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
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
            className="px-5 py-2 rounded-xl border text-sm sm:text-base"
          >
            Cancel
          </button>

          <button className="px-6 py-2 rounded-xl bg-primary text-white font-semibold text-sm sm:text-base">
            Save Product
          </button>
        </div>
      </div>
    </div>
  );
}
