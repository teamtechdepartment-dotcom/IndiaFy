
import React from "react";

export const Card = ({ children, hover, className = "" }) => (
  <div className={`bg-white rounded border border-gray-200 p-4 sm:p-5 ${hover ? "hover:shadow-md transition" : "shadow-sm"} ${className}`}>
    {children}
  </div>
);

export const StatCard = ({ label, value }) => (
  <div className="bg-white rounded border border-gray-200 p-4 shadow-sm">
    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
    <h2 className="text-2xl font-bold mt-1 text-gray-900">{value}</h2>
  </div>
);

export const Button = ({ children, variant = "primary", ...props }) => {
  const variants = {
    primary: "bg-[#065F46] text-white hover:bg-[#047857]",
    secondary: "bg-gray-100 text-gray-600 hover:bg-gray-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    success: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
  };
  return (
    <button className={`px-4 py-2 rounded text-sm font-bold transition flex items-center justify-center gap-2 ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
};

export const DataTable = ({ headers, children }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm text-left">
      <thead className="text-gray-500 border-b border-gray-200">
        <tr>{headers.map(h => <th key={h} className="pb-3 font-semibold px-2">{h}</th>)}</tr>
      </thead>
      <tbody className="text-gray-800 divide-y divide-gray-100">
        {children}
      </tbody>
    </table>
  </div>
);