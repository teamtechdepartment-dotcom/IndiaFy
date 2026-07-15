import React from "react";

/**
 * Reusable premium glass stats card for the admin panel.
 * Consumes the central CSS class tokens for clean light/dark support.
 * Supports backward-compatible properties (accent/badge).
 */
export default function StatsCard({ title, value, icon: Icon, trend, badge, color = "emerald", accent, isWarning = false }) {
  const selectedColor = accent || color;
  const displayTrend = trend || badge;

  const colorMap = {
    emerald: { text: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    green: { text: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    blue: { text: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    amber: { text: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    orange: { text: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    yellow: { text: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    red: { text: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
    purple: { text: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  };
  const c = colorMap[selectedColor] || colorMap.emerald;

  return (
    <div className="admin-card relative p-6 flex flex-col justify-between overflow-hidden select-none">
      {/* Corner glow */}
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none opacity-40 ${c.bg} blur-xl translate-x-[30%] -translate-y-[30%]`} />

      <div className="flex items-start justify-between relative z-10">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{title}</p>
        {Icon && (
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${c.bg} ${c.border} ${c.text}`}>
            {Icon}
          </div>
        )}
      </div>

      <div className="mt-4 relative z-10">
        <p className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">{value}</p>
        {displayTrend && (
          <span className={`inline-flex items-center gap-1 mt-2 text-[10px] font-black px-2.5 py-1 rounded-xl border ${
            isWarning
              ? "bg-red-500/10 border-red-500/25 text-red-500"
              : `${c.bg} ${c.border} ${c.text}`
          }`}>
            {displayTrend}
          </span>
        )}
      </div>
    </div>
  );
}
