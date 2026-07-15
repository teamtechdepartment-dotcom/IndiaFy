import React from "react";
import { Skeleton } from "../Skeleton";

export function WholesaleSkeleton({ count = 8, mode = "product" }) {
  const Skeletons = Array.from({ length: count });

  if (mode === "supplier") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
        {Skeletons.map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200">
            <div className="flex items-center gap-4 mb-4">
              <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
              <div className="flex-1">
                <Skeleton className="w-3/4 h-5 mb-2" />
                <Skeleton className="w-1/2 h-4 mb-2" />
                <Skeleton className="w-24 h-4" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Skeleton className="w-12 h-3 mb-1" />
                <Skeleton className="w-20 h-4" />
              </div>
              <div>
                <Skeleton className="w-12 h-3 mb-1" />
                <Skeleton className="w-20 h-4" />
              </div>
            </div>
            <Skeleton className="w-full h-10 rounded-lg mt-6" />
          </div>
        ))}
      </div>
    );
  }

  // Product Mode
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 w-full">
      {Skeletons.map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-3 border border-slate-200">
          <Skeleton className="w-full aspect-square rounded-xl mb-3" />
          <Skeleton className="w-3/4 h-4 mb-2" />
          <Skeleton className="w-1/2 h-3 mb-3" />
          
          <div className="bg-slate-50 p-2 rounded-lg mb-3">
            <Skeleton className="w-full h-3 mb-1" />
            <Skeleton className="w-2/3 h-4" />
          </div>

          <div className="flex justify-between items-end">
            <Skeleton className="w-16 h-5" />
            <Skeleton className="w-24 h-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
