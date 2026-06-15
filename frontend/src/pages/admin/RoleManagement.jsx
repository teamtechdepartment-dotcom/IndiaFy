/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Check, Save, ShieldAlert, Award, Star } from 'lucide-react';
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

// List of all administrative permission tags
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
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissionsMap, setPermissionsMap] = useState({});

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/management/roles");
      const data = res.data || res;
      setRoles(data || []);
      if (data?.length > 0 && !selectedRole) {
        handleSelectRole(data[0]);
      }
    } catch (_err) {
      toast.error("Failed to load platform roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    const initialMap = {};
    ALL_PERMISSIONS.forEach(p => {
      initialMap[p] = role.permissions?.includes(p) || role.permissions?.includes("*");
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

  return (
    <div className="flex min-h-screen bg-hero-gradient text-slate-800 font-sans selection:bg-[#10B981] selection:text-white relative overflow-hidden">
      <Sidebar />

      {/* Decorative Blur Blobs */}
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-emerald-100/30 to-teal-100/10 rounded-full blur-3xl -z-0 pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-100/20 to-indigo-100/5 rounded-full blur-3xl -z-0 pointer-events-none" aria-hidden="true" />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        <Header />

        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8">
          <div className="max-w-7xl mx-auto space-y-8 pb-20">
            
            {/* Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#10B981]/10 border border-[#10B981]/25 text-[#10B981] text-xs font-bold uppercase tracking-widest mb-1">
                <ShieldCheck size={14} /> Security Compliance
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Access Control & Role Policies</h1>
              <p className="text-slate-500 font-medium">
                Configure fine-grained resource limits, assign action keys, and audit administrative role groups.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Role List */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-5 shadow-md space-y-3">
                  <h3 className="font-extrabold text-[#10B981] text-sm">System Roles</h3>
                  
                  <div className="space-y-2">
                    {loading ? (
                       <p className="text-xs text-gray-400 text-center py-5">Loading roles...</p>
                    ) : roles.length === 0 ? (
                      // Display mock roles list if empty to verify visual state
                      <>
                        <RoleItem name="SUPER_ADMIN" desc="Full wildcard root access" active={selectedRole?.roleName === "SUPER_ADMIN"} onClick={() => handleSelectRole({ roleName: "SUPER_ADMIN", permissions: ["*"] })} />
                        <RoleItem name="ADMIN" desc="All management operations" active={selectedRole?.roleName === "ADMIN"} onClick={() => handleSelectRole({ roleName: "ADMIN", permissions: ["users:read", "users:write"] })} />
                        <RoleItem name="FINANCE_MANAGER" desc="Payouts & fee ledger checks" active={selectedRole?.roleName === "FINANCE_MANAGER"} onClick={() => handleSelectRole({ roleName: "FINANCE_MANAGER", permissions: ["payments:read"] })} />
                      </>
                    ) : (
                      roles.map(r => (
                        <RoleItem 
                          key={r.roleName}
                          name={r.roleName} 
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
                  <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-[2rem] p-6 shadow-md space-y-6">
                    
                    {/* Header */}
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Award size={18} className="text-[#10B981]" />
                          <h3 className="font-extrabold text-slate-800 text-lg uppercase tracking-wider">{selectedRole.roleName}</h3>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Configure feature-level restrictions for this role.</p>
                      </div>

                      <button
                        onClick={handleSavePermissions}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-[#10B981] text-white font-bold text-xs rounded-xl py-3 px-5 hover:opacity-90 transition active:scale-95 shadow-md shadow-emerald-500/20"
                      >
                        <Save size={14} className="text-white" /> Save Privileges
                      </button>
                    </div>

                    {/* Permissions checklist */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ALL_PERMISSIONS.map(p => {
                        const isGranted = permissionsMap[p];
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
                              isGranted ? "bg-gradient-to-r from-emerald-500 to-[#10B981] border-[#10B981] text-white" : "border-slate-300"
                            }`}>
                              {isGranted && <Check size={12} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                ) : (
                  <div className="bg-white/50 backdrop-blur-md border border-slate-200/60 rounded-[2rem] p-10 text-center text-xs text-slate-400 min-h-[300px] flex flex-col items-center justify-center">
                    Select a security role from the left list to edit permission flags.
                  </div>
                )}
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

function RoleItem({ name, desc, active, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`p-3.5 border rounded-2xl cursor-pointer transition flex justify-between items-center ${
        active ? "bg-[#0F172A] border-[#10B981] text-white shadow-md" : "bg-white border-slate-200 text-slate-700 hover:border-slate-350"
      }`}
    >
      <div>
        <p className="font-extrabold text-xs tracking-wider uppercase">{name.replace("_", " ")}</p>
        <p className={`text-[10px] mt-0.5 ${active ? "text-slate-300" : "text-slate-500"}`}>{desc}</p>
      </div>
      {active && <Star size={14} className="text-[#10B981] fill-[#10B981]" />}
    </div>
  );
}
