import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, Save, Award, Star, RefreshCw, AlertTriangle } from 'lucide-react';
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import AdminErrorBoundary from "../../components/admin/AdminErrorBoundary";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

const ALL_PERMISSIONS = [
  "dashboard:read",
  "users:read", "users:write",
  "sellers:read", "sellers:write",
  "stores:read", "stores:write",
  "products:read", "products:write",
  "orders:read", "orders:write",
  "payments:read", "payments:write",
  "categories:read", "categories:write",
  "tickets:read", "tickets:write",
  "settings:read", "settings:write",
  "audit:read",
  "roles:read", "roles:write"
];

export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissionsMap, setPermissionsMap] = useState({});

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/admin/management/roles");
      const raw = res?.data?.roles ?? res?.data ?? res ?? [];
      const safeData = Array.isArray(raw) ? raw : [];
      setRoles(safeData);
      if (safeData.length > 0 && !selectedRole) {
        handleSelectRole(safeData[0]);
      }
    } catch (_err) {
      console.error("Error fetching roles:", _err);
      setError("Failed to load platform roles.");
      toast.error("Failed to load platform roles");
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSelectRole = (role) => {
    if (!role) return;
    setSelectedRole(role);
    const initialMap = {};
    const perms = Array.isArray(role.permissions) ? role.permissions : [];
    ALL_PERMISSIONS.forEach(p => {
      initialMap[p] = perms.includes(p) || perms.includes("*");
    });
    setPermissionsMap(initialMap);
  };

  const handleTogglePermission = (p) => {
    setPermissionsMap(prev => ({
      ...prev,
      [p]: !prev[p]
    }));
  };

  const handleSavePermissions = async () => {
    if (!selectedRole?.roleName) return;
    try {
      const activePermissions = Object.keys(permissionsMap).filter(k => permissionsMap[k]);
      await axiosInstance.put("/admin/management/roles", {
        roleName: selectedRole.roleName,
        permissions: activePermissions
      });
      toast.success("Role privileges saved");
      fetchRoles();
    } catch (_err) {
      toast.error("Failed to adjust role permissions");
    }
  };

  const safeRolesList = Array.isArray(roles) ? roles : [];

  return (
    <div className="flex min-h-screen font-sans" style={{background:"radial-gradient(ellipse at 20% 50%, rgba(40,116,240,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(251,100,27,0.04) 0%, transparent 60%), linear-gradient(135deg, #050811 0%, #080C1A 50%, #050811 100%)"}}>
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 p-4 sm:p-8">
          <div className="max-w-7xl mx-auto space-y-8 pb-20">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#10B981]/10 border border-[#10B981]/25 text-[#2874F0] text-xs font-bold uppercase tracking-widest mb-1">
                  <ShieldCheck size={14} /> Security Compliance
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Access Control & Role Policies</h1>
                <p className="text-slate-500 font-medium">
                  Configure fine-grained resource limits, assign action keys, and audit administrative role groups.
                </p>
              </div>

              <button
                onClick={fetchRoles}
                className="flex items-center justify-center gap-2 bg-white border border-slate-200 px-4 py-3 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-xs self-start sm:self-auto"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                Refresh Roles
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
                <button onClick={fetchRoles} className="underline hover:text-red-900">Retry</button>
              </div>
            )}

            {/* Content wrapped in Error Boundary */}
            <AdminErrorBoundary title="Unable to load access control policies">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Role List */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="rounded-3xl p-5 space-y-3" style={{background:"linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",border:"1px solid rgba(255,255,255,0.07)",boxShadow:"0 0 0 1px rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.4)",backdropFilter:"blur(16px)"}}>
                    <h3 className="font-extrabold text-[#2874F0] text-sm">System Roles</h3>
                    
                    <div className="space-y-2">
                      {loading ? (
                         <p className="text-xs text-slate-400 text-center py-8">Loading roles...</p>
                      ) : safeRolesList.length === 0 ? (
                        <>
                          <RoleItem name="SUPER_ADMIN" desc="Full wildcard root access" active={selectedRole?.roleName === "SUPER_ADMIN"} onClick={() => handleSelectRole({ roleName: "SUPER_ADMIN", permissions: ["*"] })} />
                          <RoleItem name="ADMIN" desc="All management operations" active={selectedRole?.roleName === "ADMIN"} onClick={() => handleSelectRole({ roleName: "ADMIN", permissions: ["users:read", "users:write"] })} />
                          <RoleItem name="FINANCE_MANAGER" desc="Payouts & fee ledger checks" active={selectedRole?.roleName === "FINANCE_MANAGER"} onClick={() => handleSelectRole({ roleName: "FINANCE_MANAGER", permissions: ["payments:read"] })} />
                        </>
                      ) : (
                        safeRolesList.map(r => (
                          <RoleItem 
                            key={r.roleName || Math.random()}
                            name={r.roleName || "ADMIN"} 
                            desc={r.description || "Administrative access role"} 
                            active={selectedRole?.roleName === r.roleName}
                            onClick={() => handleSelectRole(r)}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Permissions Matrix Editor */}
                <div className="lg:col-span-2">
                  {selectedRole ? (
                    <div className="bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-xs space-y-6">
                      
                      {/* Header */}
                      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <Award size={18} className="text-[#2874F0]" />
                            <h3 className="font-extrabold text-slate-800 text-lg uppercase tracking-wider">{selectedRole.roleName ?? "ROLE"}</h3>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">Configure feature-level restrictions for this role.</p>
                        </div>

                        <button
                          onClick={handleSavePermissions}
                          className="flex items-center justify-center gap-2 bg-slate-900 text-white font-bold text-xs rounded-xl py-3 px-5 hover:bg-black transition active:scale-95 shadow-xs"
                        >
                          <Save size={14} /> Save Privileges
                        </button>
                      </div>

                      {/* Permissions checklist */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ALL_PERMISSIONS.map(p => {
                          const isGranted = Boolean(permissionsMap[p]);
                          return (
                            <div 
                              key={p}
                              onClick={() => handleTogglePermission(p)}
                              className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:border-[#10B981]/30 transition ${
                                isGranted ? "bg-[#10B981]/10 border-[#10B981]/30 text-slate-800" : "bg-slate-50/50 border-slate-200 text-slate-600"
                              }`}
                            >
                              <span className="text-xs font-bold">{p}</span>
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                                isGranted ? "bg-slate-900 border-slate-900 text-white" : "border-slate-300"
                              }`}>
                                {isGranted && <Check size={12} />}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200/60 rounded-[2rem] p-10 text-center text-xs text-slate-400 min-h-[300px] flex flex-col items-center justify-center">
                      Select a security role from the left list to edit permission flags.
                    </div>
                  )}
                </div>

              </div>
            </AdminErrorBoundary>

          </div>
        </main>
      </div>
    </div>
  );
}

function RoleItem({ name = "ROLE", desc = "", active = false, onClick }) {
  const safeName = (name ?? "ROLE").toString();
  return (
    <div 
      onClick={onClick}
      className={`p-3.5 border rounded-2xl cursor-pointer transition flex justify-between items-center ${
        active ? "bg-slate-900 border-[#10B981] text-white shadow-xs" : "bg-white border-slate-200 text-slate-700 hover:border-slate-350"
      }`}
    >
      <div>
        <p className="font-extrabold text-xs tracking-wider uppercase">{safeName.replace("_", " ")}</p>
        <p className={`text-[10px] mt-0.5 ${active ? "text-slate-300" : "text-slate-500"}`}>{desc}</p>
      </div>
      {active && <Star size={14} className="text-[#2874F0] fill-[#10B981]" />}
    </div>
  );
}
