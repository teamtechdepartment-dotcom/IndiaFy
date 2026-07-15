import React from "react";

export function Skeleton({ className = "", ...props }) {
  return (
    <div
      className={`relative overflow-hidden bg-slate-200 dark:bg-slate-800 rounded-xl ${className}`}
      aria-busy="true"
      role="status"
      {...props}
    >
      <div
        className="absolute inset-0 -translate-x-full"
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
          animation: "shimmer 1.8s infinite",
        }}
      />
    </div>
  );
}

export function SkeletonText({ className = "", lines = 1, ...props }) {
  return (
    <div className="space-y-2 w-full">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 w-full ${i === lines - 1 && lines > 1 ? "w-2/3" : ""} ${className}`}
          {...props}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ className = "", ...props }) {
  return (
    <Skeleton
      className={`h-12 w-12 rounded-full ${className}`}
      {...props}
    />
  );
}

export function SkeletonButton({ className = "", ...props }) {
  return (
    <Skeleton
      className={`h-10 w-full rounded-lg ${className}`}
      {...props}
    />
  );
}
