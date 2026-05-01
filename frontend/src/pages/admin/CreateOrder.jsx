import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import { ChevronLeft, X, Plus } from "lucide-react";

export default function CreateOrder() {
  const navigate = useNavigate();
  const [showProducts, setShowProducts] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Right Layout */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />

        {/* Main */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* TOP BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="text-gray-400" />
              <h1 className="text-lg sm:text-xl font-bold">Create New Order</h1>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button className="px-4 py-2 rounded-xl border text-sm font-semibold w-full sm:w-auto">
                Discard Draft
              </button>
              <button className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold w-full sm:w-auto">
                Save Draft
              </button>
            </div>
          </div>

          {/* CONTENT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT */}
            <div className="lg:col-span-7 space-y-6">
              <Card title="Customer Identity">
                <input
                  className="input"
                  placeholder="Search by name, email or phone..."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="First Name" value="Julian" />
                  <Field label="Last Name" value="Hakes" />
                </div>

                <Field label="Email Address" value="aamirf.khan@gmail.com" />
              </Card>

              <Card
                title="Shipping Details"
                right={
                  <button className="text-xs text-primary font-semibold">
                    EDIT ADDRESS
                  </button>
                }
              >
                <Field label="Street Address" value="South Delhi, Delhi" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="City" value="Delhi" />
                  <Field label="ZIP / Postcode" value="110025" />
                </div>

                <Field label="Country" value="India" />

                <div className="flex items-center gap-2 text-sm">
                  <input type="checkbox" defaultChecked />
                  <span>Billing address same as shipping</span>
                </div>
              </Card>
            </div>

            {/* RIGHT */}
            <div className="lg:col-span-5 space-y-6">
              <Card title="Order Items">
                <input
                  className="input"
                  placeholder="Quick find product by SKU or name..."
                  onFocus={() => setShowProducts(true)}
                />

                <Item
                  onClick={() => setShowProducts(true)}
                  name="Vintage Denim Jacket"
                  sku="SKU: VDJ-2023-M"
                  color="Midnight Blue"
                  qty="1"
                  price="₹89.00"
                />

                <Item
                  onClick={() => setShowProducts(true)}
                  name="Premium Cotton Tee"
                  sku="SKU: PCT-092-L"
                  color="Soft White"
                  qty="2"
                  price="₹50.00"
                />

                <div className="text-sm space-y-2 pt-4 border-t">
                  <Row label="Subtotal" value="₹139.00" />
                  <Row label="Shipping Fee" value="₹12.00" />
                  <Row label="Estimated Tax (8%)" value="₹11.12" />

                  <div className="flex justify-between font-bold pt-3 text-base">
                    <span>Total Amount</span>
                    <span className="text-primary">₹162.12</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* FOOTER */}
          <div className="mt-8 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between bg-white border rounded-2xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row gap-4">
              <select className="input h-10">
                <option>Mark as Paid</option>
              </select>
              <input className="input h-10" placeholder="Promo code..." />
            </div>

            <button className="bg-primary text-white px-6 py-3 rounded-xl font-semibold w-full lg:w-auto">
              Create Order & Notify Customer
            </button>
          </div>
        </main>
      </div>

      {/* PRODUCT MODAL */}
      {showProducts && <ProductModal onClose={() => setShowProducts(false)} />}
    </div>
  );
}

/* ================= COMPONENTS ================= */

function Card({ title, children, right }) {
  return (
    <section className="bg-white border rounded-2xl p-4 sm:p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-sm">{title}</h3>
        {right}
      </div>
      {children}
    </section>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <div className="border rounded-xl px-3 py-2 text-sm bg-gray-50">
        {value}
      </div>
    </div>
  );
}

function Item({ name, sku, color, qty, price, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border rounded-xl p-4 cursor-pointer hover:bg-gray-50"
    >
      <div>
        <p className="font-semibold">{name}</p>
        <p className="text-xs text-gray-400">{sku}</p>
        <p className="text-xs text-primary mt-1">{color}</p>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4">
        <div className="flex items-center border rounded-lg">
          <button className="px-2">−</button>
          <span className="px-3 text-sm font-bold">{qty}</span>
          <button className="px-2">+</button>
        </div>
        <p className="font-semibold">{price}</p>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

/* ================= MODAL ================= */

function ProductModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl rounded-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">Select Products</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <input
          className="input mb-6"
          placeholder="Search product name, SKU, or tag..."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border rounded-2xl p-4">
              <div className="h-32 bg-gray-100 rounded-xl mb-3" />
              <p className="font-semibold">Sample Product</p>
              <p className="text-xs text-gray-400">SKU: SKU-00{i}</p>
              <div className="flex justify-between items-center mt-3">
                <span className="font-bold">$49.00</span>
                <button className="bg-primary text-white p-2 rounded-lg">
                  <Plus size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-5 py-2 border rounded-xl">
            Cancel
          </button>
          <button className="px-5 py-2 bg-primary text-white rounded-xl">
            Add to Order
          </button>
        </div>
      </div>
    </div>
  );
}
