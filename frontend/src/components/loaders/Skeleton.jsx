import React from "react";

export default function Skeleton({ className = "", type = "text" }) {
  const baseClasses = "animate-pulse bg-gray-200/60 dark:bg-gray-800/60 rounded-md";

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
      <div className={`p-4 border border-gray-200 dark:border-gray-800 rounded ${className}`}>
        <div className={`${baseClasses} h-40 w-full rounded mb-4`} />
        <div className={`${baseClasses} h-6 w-3/4 mb-2`} />
        <div className={`${baseClasses} h-4 w-1/2`} />
      </div>
    );
  }

  return <div className={`${baseClasses} ${className}`} />;
}
