
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, StatCard, Button, DataTable } from '../../components/SharedUI';
import { 
  ArrowRight, 
  Package, 
  AlertCircle, 
  TrendingUp, 
  Clock, 
  Video,
  CheckCircle2,
  Search
} from 'lucide-react';
import { useOrderStore } from '../../store/orderStore';

export default function Dashboard() {
  // Local state for the dashboard snapshot search
  const [searchTerm, setSearchTerm] = useState("");

  const { sellerOrders, fetchSellerOrders } = useOrderStore();

  useEffect(() => {
    fetchSellerOrders();
  }, [fetchSellerOrders]);

  // Format orders for the snapshot
  const recentOrders = sellerOrders.slice(0, 5).map(o => ({
    id: o._id.substring(o._id.length - 8).toUpperCase(),
    items: `${o.orderItems.length} Item(s)`,
    amount: `₹${o.totalPrice}`,
    status: o.status || "Pending",
    time: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }));

  // Filtering logic for the search bar
  const filteredOrders = recentOrders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1">Welcome back, Jai Store. Here is your store's current status.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/live">
            <Button variant="primary"><Video size={18}/> Start Packing</Button>
          </Link>
        </div>
      </div>

      {/* Top Level Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Orders" value={sellerOrders.length.toString()} />
        <StatCard label="Pending Action" value={sellerOrders.filter(o => o.status === "Pending").length.toString()} />
        <StatCard label="Acceptance Rate" value="98%" />
        <StatCard label="Revenue" value={`₹${sellerOrders.reduce((acc, curr) => acc + curr.totalPrice, 0)}`} />
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Live Orders Snapshot */}
        <div className="xl:col-span-2 space-y-6">
          <Card>
            {/* --- ENHANCED HEADER WITH SEARCH BAR --- */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-5">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock size={20} className="text-slate-500"/> Live Orders Snapshot
              </h2>
              
              <div className="flex items-center gap-4">
                {/* Search Input */}
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search Order ID..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 bg-slate-50 focus:bg-white transition-all"
                  />
                </div>
                
                <Link to="/live" className="text-sm font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors whitespace-nowrap">
                  View All <ArrowRight size={16}/>
                </Link>
              </div>
            </div>
            
            <DataTable headers={["Order ID", "Items", "Amount", "Status", "Time"]}>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-2 font-bold text-slate-900">{order.id}</td>
                    <td className="py-4 px-2 text-slate-500 font-medium">{order.items}</td>
                    <td className="py-4 px-2 font-bold text-slate-900">{order.amount}</td>
                    <td className="py-4 px-2">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md uppercase tracking-wide ${
                        order.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                        order.status === 'Processing' ? 'bg-blue-50 text-blue-600' :
                        order.status === 'Cancelled' ? 'bg-red-50 text-red-600' :
                        'bg-emerald-50 text-emerald-600'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-slate-400 text-sm font-medium">{order.time}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500 font-medium">
                    No orders found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </DataTable>
          </Card>
        </div>

        {/* RIGHT COLUMN: Alerts & Quick Actions */}
        <div className="space-y-6">
          
          <Card className="border-amber-200 bg-gradient-to-b from-amber-50/50 to-white">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-amber-500"/> Action Needed
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0"><Package size={16}/></div>
                <div>
                  <p className="text-sm font-bold text-slate-900">1 Order pending acceptance</p>
                  <Link to="/orders" className="text-xs font-bold text-amber-600 hover:text-amber-700 mt-1 inline-block">Review Now &rarr;</Link>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0"><Video size={16}/></div>
                <div>
                  <p className="text-sm font-bold text-slate-900">3 Orders require video packing</p>
                  <Link to="/live" className="text-xs font-bold text-blue-600 hover:text-blue-700 mt-1 inline-block">Start Camera &rarr;</Link>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                <div className="p-2 bg-red-50 text-red-600 rounded-lg shrink-0"><TrendingUp size={16}/></div>
                <div>
                  <p className="text-sm font-bold text-slate-900">2 Products are Low Stock</p>
                  <Link to="/inventory" className="text-xs font-bold text-red-600 hover:text-red-700 mt-1 inline-block">Update Inventory &rarr;</Link>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider text-slate-400">System Status</h2>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500"/> Store Visibility
              </span>
              <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Online</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-600">Next Settlement</span>
              <span className="text-sm font-bold text-slate-900">Tomorrow</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm font-medium text-slate-600">Video Storage</span>
              <span className="text-sm font-bold text-slate-900">42% Used</span>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}