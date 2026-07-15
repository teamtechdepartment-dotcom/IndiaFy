const customers = [
  {
    id: 1,
    name: "Rohan Verma",
    email: "rohan.v@example.com",
    orders: 14,
    spend: "₹24,500",
    status: "Active",
  },
  {
    id: 2,
    name: "Ananya Kapoor",
    email: "ananya.k@gmail.com",
    orders: 8,
    spend: "₹12,840",
    status: "Active",
  },
  {
    id: 3,
    name: "Siddharth Mehta",
    email: "sid.mehta@outlook.com",
    orders: 1,
    spend: "₹4,200",
    status: "Inactive",
  },
];

export default function CustomerTable({ onSelect }) {
  return (
    <div className="bg-white border rounded-2xl p-4 sm:p-6">
      <input
        placeholder="Search by name or email..."
        className="w-full mb-4 px-4 py-3 border rounded-xl text-sm"
      />

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="text-gray-500">
            <tr>
              <th className="pb-3 text-left">Customer</th>
              <th className="text-left">Email</th>
              <th className="text-left">Orders</th>
              <th className="text-left">Spend</th>
              <th className="text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((c) => (
              <tr
                key={c.id}
                onClick={() => onSelect(c)}
                className="border-t cursor-pointer hover:bg-gray-50"
              >
                <td className="py-3 font-semibold text-blue-600 whitespace-nowrap">
                  {c.name}
                </td>
                <td className="whitespace-nowrap">{c.email}</td>
                <td>{c.orders}</td>
                <td className="whitespace-nowrap">{c.spend}</td>
                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${
                      c.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
