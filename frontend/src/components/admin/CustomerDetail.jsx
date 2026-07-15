export default function CustomerDetail({ customer }) {
  if (!customer) {
    return (
      <div className="bg-white border rounded-2xl p-4 sm:p-6 text-center text-gray-400">
        Select a customer to view details
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-2xl p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">
          {customer.name[0]}
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-bold">{customer.name}</h2>
          <p className="text-sm text-gray-500 break-all sm:break-normal">
            {customer.email}
          </p>
          <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            Active
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MiniStat title="Total Spend" value="₹45,000" />
        <MiniStat title="Orders" value="12" />
        <MiniStat title="Avg Order" value="₹3,750" />
      </div>

      {/* Order History */}
      <h3 className="font-semibold mb-2">Order History</h3>
      <ul className="text-sm space-y-2">
        <li className="flex justify-between gap-4">
          <span>#ORD-4291</span>
          <span className="text-green-600">Delivered</span>
        </li>
        <li className="flex justify-between gap-4">
          <span>#ORD-4102</span>
          <span className="text-green-600">Delivered</span>
        </li>
        <li className="flex justify-between gap-4">
          <span>#ORD-3988</span>
          <span className="text-blue-600">Shipped</span>
        </li>
      </ul>
    </div>
  );
}

function MiniStat({ title, value }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 text-center">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
}
