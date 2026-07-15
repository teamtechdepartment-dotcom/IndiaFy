import React from "react";
import { Skeleton } from "../Skeleton";

export function StoreSkeleton({ count = 4, variant = "grid" }) {
  const Skeletons = Array.from({ length: count });

  if (variant === "list") {
    return (
      <div className="flex flex-col gap-4 w-full">
        {Skeletons.map((_, i) => (
          <div key={i} className="flex gap-4 p-4 border border-slate-100 rounded-2xl bg-white items-center">
            <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-5 w-1/3 mb-2" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-10 w-24 rounded-lg hidden sm:block" />
          </div>
        ))}
      </div>
    );
  }

  // Grid variant
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
      {Skeletons.map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-start gap-4">
            <Skeleton className="w-16 h-16 rounded-full shrink-0" />
            <div className="flex-1">
              <Skeleton className="w-3/4 h-5 mb-2" />
              <Skeleton className="w-1/2 h-4 mb-3" />
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Skeleton className="w-16 h-6 rounded-full" />
                <Skeleton className="w-20 h-6 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
