
import React from "react";

export const Card = ({ children, hover }) => (
  <div className={`bg-white rounded-2xl border border-slate-200/60 p-4 sm:p-5 ${hover ? "hover:shadow-md transition" : "shadow-sm"}`}>
    {children}
  </div>
);

export const StatCard = ({ label, value }) => (
  <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm">
    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
    <h2 className="text-2xl font-bold mt-1 text-slate-900">{value}</h2>
  </div>
);

export const Button = ({ children, variant = "primary", ...props }) => {
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800",
    secondary: "bg-slate-100 text-slate-600 hover:bg-slate-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    success: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
  };
  return (
    <button className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2 ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
};

export const DataTable = ({ headers, children }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm text-left">
      <thead className="text-slate-500 border-b border-slate-200/60">
        <tr>{headers.map(h => <th key={h} className="pb-3 font-semibold px-2">{h}</th>)}</tr>
      </thead>
      <tbody className="text-slate-800 divide-y divide-slate-100">
        {children}
      </tbody>
    </table>
  </div>
);