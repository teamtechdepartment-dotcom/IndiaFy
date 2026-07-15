import React from "react";
import { Skeleton, SkeletonText } from "../Skeleton";

export function ProductSkeleton({ count = 8, variant = "grid" }) {
  const Skeletons = Array.from({ length: count });

  if (variant === "list") {
    return (
      <div className="flex flex-col gap-4 w-full">
        {Skeletons.map((_, i) => (
          <div key={i} className="flex gap-4 p-4 border border-slate-100 rounded-2xl bg-white">
            <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-xl" />
            <div className="flex-1 flex flex-col justify-between py-1">
              <div>
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex justify-between items-end mt-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Grid variant
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 w-full">
      {Skeletons.map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-3 border border-slate-100">
          <Skeleton className="w-full aspect-square rounded-xl mb-3" />
          <Skeleton className="w-4/5 h-4 mb-2" />
          <Skeleton className="w-1/2 h-3 mb-4" />
          <div className="flex justify-between items-center">
            <Skeleton className="w-12 h-5" />
            <Skeleton className="w-16 h-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
