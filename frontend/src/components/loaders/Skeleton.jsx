import React from "react";

export default function Skeleton({ className = "", type = "text" }) {
  const baseClasses = "animate-pulse bg-slate-200/60 dark:bg-slate-800/60 rounded-md";

  if (type === "text") {
    return <div className={`${baseClasses} h-4 w-full ${className}`} />;
  }

  if (type === "title") {
    return <div className={`${baseClasses} h-8 w-3/4 ${className}`} />;
  }

  if (type === "avatar") {
    return <div className={`${baseClasses} rounded-full h-12 w-12 ${className}`} />;
  }

  if (type === "card") {
    return (
      <div className={`p-4 border border-slate-200 dark:border-slate-800 rounded-2xl ${className}`}>
        <div className={`${baseClasses} h-40 w-full rounded-xl mb-4`} />
        <div className={`${baseClasses} h-6 w-3/4 mb-2`} />
        <div className={`${baseClasses} h-4 w-1/2`} />
      </div>
    );
  }

  return <div className={`${baseClasses} ${className}`} />;
}
